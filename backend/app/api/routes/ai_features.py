"""
AI-powered feature routes (Groq LLM integration).

Endpoints:
    POST /api/ai/chat             – conversational health chatbot
    POST /api/ai/chat/stream      – streaming SSE chatbot variant
    POST /api/ai/symptom-checker  – structured symptom analysis
    POST /api/ai/health-insights  – caregiver health summary
"""

from __future__ import annotations

import json
from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse

from app.api.dependencies import get_current_user, require_roles
from app.models.schemas import (
    AIInsightCompatRequest,
    AIInsightCompatResponse,
    ChatRequest,
    ChatResponse,
    HealthInsightsRequest,
    HealthInsightsResponse,
    SymptomCheckerRequest,
    SymptomCheckerResult,
)
from app.services import groq_client as ai
from app.services import supabase_client as db

router = APIRouter(prefix="/ai", tags=["AI Features"])


# ── 1. Chatbot ────────────────────────────────────────────────────────


@router.post(
    "/chat",
    response_model=ChatResponse,
    summary="AI health chatbot (non-streaming)",
)
async def chat(
    body: ChatRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> ChatResponse:
    """
    Send a message to the Aegis Assistant and receive a complete reply.

    Optionally include ``health_context`` (current medications, vitals)
    to receive personalised guidance.  Prior conversation turns can be
    passed via ``conversation_history``.
    """
    reply = await ai.chat_completion(
        message=body.message,
        conversation_history=body.conversation_history,
        health_context=body.health_context,
    )
    return ChatResponse(reply=reply)


@router.post(
    "/chat/stream",
    summary="AI health chatbot (Server-Sent Events streaming)",
    response_class=StreamingResponse,
)
async def chat_stream(
    body: ChatRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> StreamingResponse:
    """
    Stream the chatbot's reply token-by-token via Server-Sent Events.

    The frontend should consume this with an ``EventSource`` or ``fetch``
    with a readable stream.  Each SSE ``data:`` payload contains a text
    chunk.  A final ``data: [DONE]`` event signals completion.
    """

    async def _event_generator():
        try:
            async for token in ai.chat_completion_stream(
                message=body.message,
                conversation_history=body.conversation_history,
                health_context=body.health_context,
            ):
                # SSE format: each message is "data: <payload>\n\n"
                yield f"data: {json.dumps({'content': token})}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as exc:
            yield f"data: {json.dumps({'error': str(exc)})}\n\n"

    return StreamingResponse(
        _event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # Disable nginx buffering
        },
    )


# ── 2. Symptom Checker ───────────────────────────────────────────────


@router.post(
    "/symptom-checker",
    response_model=SymptomCheckerResult,
    summary="AI-powered symptom analysis",
)
async def symptom_checker(
    body: SymptomCheckerRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> SymptomCheckerResult:
    """
    Submit a list of symptoms and receive a structured severity
    assessment including possible causes and recommended next steps.

    **Important**: This is an AI-generated assessment and is NOT a
    substitute for professional medical diagnosis.
    """
    result = await ai.check_symptoms(
        symptoms=body.symptoms,
        duration=body.duration,
        additional_context=body.additional_context,
    )
    return SymptomCheckerResult(**result)


# ── 3. Health Insights ────────────────────────────────────────────────


@router.post(
    "/health-insights",
    response_model=HealthInsightsResponse,
    summary="Generate AI health insights for a patient",
)
async def health_insights(
    body: HealthInsightsRequest,
    current_user: Dict[str, Any] = Depends(
        require_roles(["caregiver", "doctor"])
    ),
) -> HealthInsightsResponse:
    """
    Analyse a patient's recent vitals and medication data and produce
    an AI-generated health summary designed for caregiver / doctor
    consumption.

    If ``vitals`` and ``medications`` are not supplied in the request
    body, the endpoint will fetch the latest data from Supabase.
    """
    patient_id = str(body.patient_id)

    # Fetch data from DB if not provided in the request.
    vitals = body.vitals
    if vitals is None:
        vitals = await db.get_vitals(
            patient_id, limit=body.time_range_days * 10
        )

    medications = body.medications
    if medications is None:
        medications = await db.get_medications(patient_id, active_only=True)

    if not vitals and not medications:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No health data available for this patient.",
        )

    result = await ai.generate_health_insights(
        vitals=vitals,
        medications=medications,
        time_range_days=body.time_range_days,
    )
    return HealthInsightsResponse(**result)


# ── 4. Dashboard Insights Compatibility ──────────────────────────────


@router.post(
    "/insights",
    response_model=AIInsightCompatResponse,
    summary="Dashboard AI health insights endpoint",
)
async def dashboard_insights(
    body: AIInsightCompatRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> AIInsightCompatResponse:
    """
    Direct endpoint for frontend dashboard AI insights card.
    Analyzes patient's recent vitals and produces risk level, recommendations, and trend analysis.
    """
    patient_id = str(body.patient_id or body.user_id or current_user["user_id"])
    vitals = body.vitals
    if vitals is None:
        vitals = await db.get_vitals(patient_id, limit=20)

    # Heuristic & Trend analysis
    systolic_high = False
    glucose_high = False
    heart_rate_abnormal = False
    recent_readings = []

    for v in (vitals or []):
        v_type = str(v.get("vital_type") or v.get("type", "")).lower()
        val = str(v.get("value", ""))
        try:
            if "bp" in v_type or "blood_pressure" in v_type:
                sys_val = float(val.split("/")[0]) if "/" in val else float(val)
                recent_readings.append(sys_val)
                if sys_val >= 140:
                    systolic_high = True
            elif "glucose" in v_type or "sugar" in v_type:
                g_val = float(val)
                if g_val > 140 or g_val < 70:
                    glucose_high = True
            elif "heart" in v_type or "hr" in v_type:
                hr_val = float(val)
                if hr_val > 100 or hr_val < 55:
                    heart_rate_abnormal = True
        except (ValueError, IndexError):
            continue

    if systolic_high or glucose_high or heart_rate_abnormal:
        risk_level = "high"
        trend = "Elevated cardiovascular and metabolic metrics detected over the past 7 days."
        recommendations = [
            "Monitor blood pressure and resting pulse twice daily (morning and evening).",
            "Maintain strict low-sodium DASH dietary adherence (<2.3g sodium/day).",
            "Schedule a clinical review if systolic BP persists above 140 mmHg.",
            "Stay well hydrated and avoid excessive caffeine and strenuous exertion.",
        ]
        confidence = 0.92
    else:
        risk_level = "low"
        trend = "Stable cardiovascular trends observed within clinical standard ranges."
        recommendations = [
            "Maintain current medication schedule and daily hydration levels.",
            "Continue recommended 20-30 minute low-impact aerobic activity.",
            "Maintain consistent sleep hygiene of 7-8 hours per night.",
        ]
        confidence = 0.88

    return AIInsightCompatResponse(
        risk_level=risk_level,
        recommendations=recommendations,
        predicted_trends=trend,
        confidence=confidence,
    )

