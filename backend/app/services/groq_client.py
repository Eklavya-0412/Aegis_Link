"""
Groq AI integration layer.

Wraps the Groq Python SDK to provide three capabilities:
1. **Conversational chatbot** – with optional health context injection.
2. **Symptom checker** – returns structured severity / causes / actions.
3. **Health insights generator** – summarises vitals / meds for caregivers.

All functions are async-friendly and return parsed outputs.  Streaming
for the chatbot is exposed as an async generator.
"""

from __future__ import annotations

import json
import logging
from typing import Any, AsyncGenerator, Dict, List, Optional

from groq import Groq

from app.core.config import get_settings
from app.core.exceptions import GroqServiceError

logger = logging.getLogger(__name__)

# ── Model constants ───────────────────────────────────────────────────
_DEFAULT_MODEL = "llama-3.3-70b-versatile"
_FAST_MODEL = "llama-3.1-8b-instant"


def _get_groq_client() -> Groq:
    """Return a fresh Groq SDK client."""
    settings = get_settings()
    return Groq(api_key=settings.groq_api_key)


# ── 1. Chatbot ────────────────────────────────────────────────────────

_CHAT_SYSTEM_PROMPT = """\
You are **Aegis Assistant**, the AI health companion inside the Aegis Link \
family health management platform.

Guidelines:
- Provide helpful, empathetic, evidence-based health information.
- Always remind the user that your advice is NOT a replacement for \
  professional medical consultation.
- If the user describes an emergency, urge them to call emergency \
  services immediately.
- When health context (medications, vitals) is provided, reference it \
  to give personalised guidance.
- Keep responses concise and well-structured.
"""


async def chat_completion(
    message: str,
    conversation_history: List[Dict[str, str]],
    health_context: Optional[Dict[str, Any]] = None,
) -> str:
    """
    Generate a single (non-streaming) chatbot reply.

    Args:
        message: The latest user message.
        conversation_history: Prior turns as ``[{"role": ..., "content": ...}]``.
        health_context: Optional dict with the user's current health snapshot.

    Returns:
        The assistant's reply text.
    """
    client = _get_groq_client()

    system_content = _CHAT_SYSTEM_PROMPT
    if health_context:
        system_content += (
            "\n\nCurrent health context for this patient:\n"
            f"```json\n{json.dumps(health_context, indent=2, default=str)}\n```"
        )

    messages = [{"role": "system", "content": system_content}]
    messages.extend(conversation_history)
    messages.append({"role": "user", "content": message})

    try:
        response = client.chat.completions.create(
            model=_DEFAULT_MODEL,
            messages=messages,
            temperature=0.7,
            max_tokens=1024,
        )
        return response.choices[0].message.content or ""
    except Exception as exc:
        logger.exception("Groq chat completion failed")
        raise GroqServiceError(f"Chat completion failed: {exc}")


async def chat_completion_stream(
    message: str,
    conversation_history: List[Dict[str, str]],
    health_context: Optional[Dict[str, Any]] = None,
) -> AsyncGenerator[str, None]:
    """
    Yield chatbot reply tokens as an async generator for SSE streaming.

    Usage::

        async for chunk in chat_completion_stream(msg, history):
            yield f"data: {chunk}\\n\\n"
    """
    client = _get_groq_client()

    system_content = _CHAT_SYSTEM_PROMPT
    if health_context:
        system_content += (
            "\n\nCurrent health context for this patient:\n"
            f"```json\n{json.dumps(health_context, indent=2, default=str)}\n```"
        )

    messages = [{"role": "system", "content": system_content}]
    messages.extend(conversation_history)
    messages.append({"role": "user", "content": message})

    try:
        stream = client.chat.completions.create(
            model=_DEFAULT_MODEL,
            messages=messages,
            temperature=0.7,
            max_tokens=1024,
            stream=True,
        )
        for chunk in stream:
            delta = chunk.choices[0].delta
            if delta and delta.content:
                yield delta.content
    except Exception as exc:
        logger.exception("Groq streaming chat failed")
        raise GroqServiceError(f"Streaming chat failed: {exc}")


# ── 2. Symptom Checker ───────────────────────────────────────────────

_SYMPTOM_SYSTEM_PROMPT = """\
You are a medical triage AI assistant.  Given a list of symptoms (and \
optional duration / context), return a JSON object with EXACTLY these keys:

{
  "severity": "low" | "moderate" | "high" | "critical",
  "possible_causes": ["cause1", "cause2", ...],
  "recommended_actions": ["action1", "action2", ...],
  "should_seek_emergency": true | false
}

Rules:
- Be thorough but concise.
- List 2-5 possible causes ordered by likelihood.
- List 2-4 actionable next steps.
- Set should_seek_emergency to true ONLY for genuinely dangerous \
  symptom combinations (e.g. chest pain + shortness of breath).
- Return ONLY the JSON object, no markdown fences or extra text.
"""


async def check_symptoms(
    symptoms: List[str],
    duration: Optional[str] = None,
    additional_context: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Analyse symptoms and return a structured assessment.

    Returns:
        A dict matching the ``SymptomCheckerResult`` schema fields.
    """
    client = _get_groq_client()

    user_parts = [f"Symptoms: {', '.join(symptoms)}"]
    if duration:
        user_parts.append(f"Duration: {duration}")
    if additional_context:
        user_parts.append(f"Additional context: {additional_context}")

    try:
        response = client.chat.completions.create(
            model=_DEFAULT_MODEL,
            messages=[
                {"role": "system", "content": _SYMPTOM_SYSTEM_PROMPT},
                {"role": "user", "content": "\n".join(user_parts)},
            ],
            temperature=0.3,
            max_tokens=512,
            response_format={"type": "json_object"},
        )
        raw = response.choices[0].message.content or "{}"
        result = json.loads(raw)

        # Normalise keys to match our Pydantic schema exactly.
        return {
            "severity": result.get("severity", "moderate"),
            "possible_causes": result.get("possible_causes", []),
            "recommended_actions": result.get("recommended_actions", []),
            "should_seek_emergency": result.get("should_seek_emergency", False),
        }
    except json.JSONDecodeError:
        raise GroqServiceError("AI returned unparseable symptom analysis.")
    except Exception as exc:
        logger.exception("Groq symptom check failed")
        raise GroqServiceError(f"Symptom analysis failed: {exc}")


# ── 3. Health Insights ────────────────────────────────────────────────

_INSIGHTS_SYSTEM_PROMPT = """\
You are a clinical analytics AI.  Given a patient's recent vitals and \
medication data, produce a JSON object with EXACTLY these keys:

{
  "summary": "A 2-3 sentence overview of the patient's current health status.",
  "trends": ["trend1", "trend2", ...],
  "alerts": ["alert1", ...],
  "recommendations": ["rec1", "rec2", ...]
}

Rules:
- Provide 2-4 trends (e.g. "Blood pressure trending upward over 7 days").
- Alerts should flag readings outside normal ranges.
- Recommendations should be actionable and concise.
- Return ONLY the JSON object, no markdown fences or extra text.
"""


async def generate_health_insights(
    vitals: Optional[List[Dict[str, Any]]] = None,
    medications: Optional[List[Dict[str, Any]]] = None,
    time_range_days: int = 7,
) -> Dict[str, Any]:
    """
    Analyse a patient's recent data and produce a caregiver-ready summary.

    Returns:
        A dict matching the ``HealthInsightsResponse`` schema fields.
    """
    client = _get_groq_client()

    context_parts: List[str] = [
        f"Analysis window: last {time_range_days} day(s)."
    ]
    if vitals:
        context_parts.append(
            f"Recent vitals:\n```json\n{json.dumps(vitals, indent=2, default=str)}\n```"
        )
    else:
        context_parts.append("No recent vitals data available.")

    if medications:
        context_parts.append(
            f"Current medications:\n```json\n{json.dumps(medications, indent=2, default=str)}\n```"
        )
    else:
        context_parts.append("No medication data available.")

    try:
        response = client.chat.completions.create(
            model=_DEFAULT_MODEL,
            messages=[
                {"role": "system", "content": _INSIGHTS_SYSTEM_PROMPT},
                {"role": "user", "content": "\n\n".join(context_parts)},
            ],
            temperature=0.4,
            max_tokens=768,
            response_format={"type": "json_object"},
        )
        raw = response.choices[0].message.content or "{}"
        result = json.loads(raw)

        return {
            "summary": result.get("summary", "No summary available."),
            "trends": result.get("trends", []),
            "alerts": result.get("alerts", []),
            "recommendations": result.get("recommendations", []),
        }
    except json.JSONDecodeError:
        raise GroqServiceError("AI returned unparseable health insights.")
    except Exception as exc:
        logger.exception("Groq health insights failed")
        raise GroqServiceError(f"Health insights generation failed: {exc}")
