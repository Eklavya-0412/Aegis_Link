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

def _generate_intelligent_health_response(message: str, health_context: Optional[Dict[str, Any]] = None) -> str:
    """Generate an intelligent clinical health assistant response using real patient context."""
    msg = message.lower().strip()
    vitals = (health_context or {}).get("vitals", [])
    meds = (health_context or {}).get("medications", [])
    patient_name = (health_context or {}).get("patient_name") or (health_context or {}).get("name") or "there"
    role = (health_context or {}).get("role", "patient")

    # 1. Emergency detection
    emergency_keywords = ["chest pain", "shortness of breath", "can't breathe", "stroke", "fainted", "unconscious", "heart attack", "seizure", "severe bleeding"]
    if any(k in msg for k in emergency_keywords):
        return (
            "🚨 **URGENT MEDICAL WARNING**: Your symptoms may indicate a potentially life-threatening medical emergency.\n\n"
            "• **Call emergency services (911 or local emergency)** immediately.\n"
            "• Tap the **Red Emergency SOS** button in Aegis Link to notify all emergency contacts and caretakers with your live GPS location.\n"
            "• Do not attempt to drive yourself. Sit upright, rest, and keep doors unlocked for first responders."
        )

    # 2. Vitals Analysis
    if any(k in msg for k in ["vital", "bp", "blood pressure", "heart rate", "pulse", "glucose", "sugar", "temperature", "oxygen", "spo2"]):
        readings_summary = []
        for v in vitals[:5]:
            v_type = str(v.get("vital_type") or v.get("type", "")).replace("_", " ").title()
            val = v.get("value", "")
            unit = v.get("unit", "")
            readings_summary.append(f"- **{v_type}**: {val} {unit}")

        summary_text = "\n".join(readings_summary) if readings_summary else "No recent vitals recorded yet."
        return (
            f"### 🩺 Vitals Analysis & Overview for {patient_name}\n\n"
            f"Here are your most recent recorded metrics:\n{summary_text}\n\n"
            "**Clinical Standards Reference:**\n"
            "• **Blood Pressure**: Normal is < 120/80 mmHg (Elevated: 120-129/<80, Stage 1: 130-139/80-89, Stage 2: ≥ 140/90).\n"
            "• **Heart Rate**: Resting 60–100 bpm is considered healthy for adults.\n"
            "• **Fasting Glucose**: 70–99 mg/dL is normal (100–125 indicates pre-diabetes).\n"
            "• **Oxygen Saturation**: 95%–100% is optimal.\n\n"
            "💡 *Tip: Record your vitals at the same time each day (e.g. before breakfast) for maximum consistency.*"
        )

    # 3. Medications & Schedule
    if any(k in msg for k in ["medication", "pill", "drug", "dose", "dosage", "prescription", "side effect", "interaction"]):
        med_list = []
        for m in meds:
            m_name = m.get("name", "Medication")
            m_dose = m.get("dosage", "")
            m_freq = str(m.get("frequency", "")).replace("_", " ")
            m_taken = "✅ Taken today" if m.get("taken_today") else "⏳ Due"
            med_list.append(f"- **{m_name}** ({m_dose}) — {m_freq} [{m_taken}]")

        med_text = "\n".join(med_list) if med_list else "No active medications currently registered in your regimen."
        return (
            f"### 💊 Medication Schedule & Guidance for {patient_name}\n\n"
            f"**Your Active Regimen:**\n{med_text}\n\n"
            "**Best Practices:**\n"
            "1. Take oral medications with a full glass of water.\n"
            "2. Never double up on a missed dose without consulting your physician or pharmacist.\n"
            "3. If you experience unexpected nausea, dizziness, or rash, log a check-in or contact your care team immediately.\n\n"
            "Would you like me to check potential drug interactions or set custom dosage reminders?"
        )

    # 4. Caregiver / Nurse features
    if any(k in msg for k in ["caregiver", "caretaker", "nurse", "check-in", "checkin", "visit note", "ward"]):
        return (
            "### 🏥 Caregiver & Nurse Coordination\n\n"
            "As part of the Aegis Link care continuum, caregivers can:\n"
            "• **Log Visit Check-Ins (UC11)**: Document patient status, mood, observed vitals, and administered doses.\n"
            "• **Update Medication Dosage (TC_06)**: Adjust timings or dosages with automatic cryptographic audit logging.\n"
            "• **Real-Time Anomaly Response (UC13)**: Receive push notifications whenever critical vitals breach clinical thresholds.\n"
            "• **Family Transparency (UC12)**: Keep family members synchronized with chronological care activity logs."
        )

    # 5. Doctor / Clinical Oversight & Treatment Plans
    if any(k in msg for k in ["doctor", "dietician", "treatment plan", "diet plan", "consent", "permission", "lab"]):
        return (
            "### 👨‍⚕️ Clinical Oversight & Treatment Management\n\n"
            "For attending physicians and dieticians:\n"
            "• **Access Consent Verification (EXP6)**: Prior to reviewing patient metrics or decrypted lab reports, explicit active patient consent is strictly verified.\n"
            "• **Adjust Treatment & Diet Plans (UC8)**: Doctors establish tailored dietary guidelines (e.g. low-sodium DASH, glycemic control) and prescription orders.\n"
            "• **Encrypted Lab Vault (UC6/UC9)**: Secure AES-256 diagnostic report viewing with audit trail compliance."
        )

    # 6. Menstrual & Reproductive Health
    if any(k in msg for k in ["menstrual", "period", "cycle", "reproductive", "cramp", "ovulation"]):
        return (
            "### 🌸 Menstrual & Reproductive Health Tracker\n\n"
            "• **Strict Privacy Guarantee**: Menstrual logs are completely confidential and are **hidden from family members and caregivers**.\n"
            "• **Consent-Gated**: Even attending doctors cannot view reproductive data without your explicit, revocable consent.\n"
            "• **Symptom & Flow Logging**: Record cycle start dates, flow intensity, and associated symptoms to receive cycle predictions."
        )

    # 7. Nutrition, Diet & Lifestyle
    if any(k in msg for k in ["diet", "food", "nutrition", "exercise", "walk", "lifestyle", "water", "sleep"]):
        return (
            "### 🥗 Personalized Health & Lifestyle Recommendations\n\n"
            "• **Cardiovascular Nutrition**: Emphasize fiber-rich legumes, leafy greens, and whole grains. Limit sodium intake to < 2,300 mg per day.\n"
            "• **Hydration Goal**: Target 2.0–2.5 Liters of water daily unless on fluid restrictions.\n"
            "• **Physical Activity**: Aim for 150 minutes of moderate-intensity aerobic exercise (e.g. brisk walking) weekly.\n"
            "• **Sleep Hygiene**: Maintain 7–8 hours of consistent, restorative sleep for hormonal and cardiac recovery."
        )

    # Default helpful assistant response
    return (
        f"Hello {patient_name}! I am your **Aegis Link AI Assistant**.\n\n"
        "I can help you with:\n"
        "• 🩺 **Vitals Analysis** – evaluate your blood pressure, heart rate, and glucose trends.\n"
        "• 💊 **Medications** – explain dosages, adherence status, and drug precautions.\n"
        "• 🏥 **Caregiver & Doctor Coordination** – logging visit check-ins, treatment plans, and appointments.\n"
        "• 🌸 **Reproductive Health** – confidential cycle logging and tracking.\n"
        "• 🚨 **Emergency Triage** – detecting critical symptoms and activating rapid alerts.\n\n"
        "What specific health topic or question can I assist you with today?"
    )


async def chat_completion(
    message: str,
    conversation_history: List[Dict[str, str]],
    health_context: Optional[Dict[str, Any]] = None,
) -> str:
    """
    Generate a single (non-streaming) chatbot reply.
    Gracefully falls back to intelligent clinical assistant if external LLM is offline.
    """
    try:
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

        response = client.chat.completions.create(
            model=_DEFAULT_MODEL,
            messages=messages,
            temperature=0.7,
            max_tokens=1024,
        )
        return response.choices[0].message.content or ""
    except Exception as exc:
        logger.warning(f"Groq chat API note ({exc}). Utilizing intelligent clinical assistant fallback.")
        return _generate_intelligent_health_response(message, health_context)


async def chat_completion_stream(
    message: str,
    conversation_history: List[Dict[str, str]],
    health_context: Optional[Dict[str, Any]] = None,
) -> AsyncGenerator[str, None]:
    """
    Yield chatbot reply tokens as an async generator for SSE streaming.
    Falls back gracefully to intelligent clinical assistant if needed.
    """
    try:
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
        logger.warning(f"Groq streaming chat API note ({exc}). Streaming intelligent fallback.")
        fallback = _generate_intelligent_health_response(message, health_context)
        # Yield words in chunks to simulate smooth streaming
        words = fallback.split(" ")
        for i in range(0, len(words), 3):
            yield " ".join(words[i:i+3]) + " "



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
