"""
Menstrual Tracking API routes gated by require_consent("menstrual_log").
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.dependencies import get_current_user, require_consent
from app.models.schemas import (
    MenstrualLogCreate,
    MenstrualLogResponse,
)
from app.services import supabase_client as db

router = APIRouter(prefix="/menstrual", tags=["Menstrual Tracking"])


@router.post(
    "/",
    response_model=MenstrualLogResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new menstrual cycle log",
)
async def create_log(
    body: MenstrualLogCreate,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    """Create a menstrual log entry."""
    target_patient = str(body.patient_id)
    if target_patient != current_user["user_id"]:
        allowed = await db.check_consent(target_patient, current_user["user_id"], "menstrual_log")
        if not allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: missing consent for scope 'menstrual_log'",
            )

    return await db.create_menstrual_log(
        patient_id=target_patient,
        log_data=body.model_dump(mode="json"),
    )


@router.get(
    "/",
    response_model=List[MenstrualLogResponse],
    summary="Get menstrual cycle logs for a patient",
)
async def list_logs(
    patient_id: Optional[str] = Query(None, description="Patient ID to fetch logs for"),
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> List[Dict[str, Any]]:
    """Retrieve menstrual tracking logs."""
    target_patient = patient_id or current_user["user_id"]
    if target_patient != current_user["user_id"]:
        allowed = await db.check_consent(target_patient, current_user["user_id"], "menstrual_log")
        if not allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: missing consent for scope 'menstrual_log'",
            )

    return await db.get_menstrual_logs(target_patient)


@router.get(
    "/{log_id}",
    response_model=MenstrualLogResponse,
    summary="Get a single menstrual log by ID",
)
async def get_log(
    log_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    """Fetch single menstrual log."""
    log = await db.get_menstrual_log_by_id(log_id)
    if not log:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Menstrual log not found")

    target_patient = log["patient_id"]
    if target_patient != current_user["user_id"]:
        allowed = await db.check_consent(target_patient, current_user["user_id"], "menstrual_log")
        if not allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: missing consent for scope 'menstrual_log'",
            )

    return log


@router.delete(
    "/{log_id}",
    summary="Delete a menstrual log entry",
)
async def delete_log(
    log_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, str]:
    """Delete a menstrual log entry."""
    log = await db.get_menstrual_log_by_id(log_id)
    if not log:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Menstrual log not found")

    target_patient = log["patient_id"]
    if target_patient != current_user["user_id"]:
        allowed = await db.check_consent(target_patient, current_user["user_id"], "menstrual_log")
        if not allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: missing consent for scope 'menstrual_log'",
            )

    await db.delete_menstrual_log(log_id, current_user["user_id"])
    return {"message": "Menstrual log deleted successfully"}
