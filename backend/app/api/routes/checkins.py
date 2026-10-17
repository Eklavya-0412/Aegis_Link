"""
Caregiver Check-ins & Visit Notes API routes (UML UC11 & UC12).

Endpoints:
    POST /api/checkins/                      – Caregiver records visit check-in & notes (UC11)
    GET  /api/checkins/patient/{patient_id}  – Retrieve chronological check-ins (caregiver & family oversight UC12)
"""

from __future__ import annotations

from typing import Any, Dict, List
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.dependencies import get_current_user, require_roles
from app.models.schemas import CaregiverCheckinCreate, CaregiverCheckinResponse
from app.services import supabase_client as db

router = APIRouter(prefix="/checkins", tags=["Caregiver Check-ins"])


@router.post(
    "/",
    response_model=CaregiverCheckinResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Log a caregiver visit check-in with notes (UC11)",
)
async def create_checkin(
    body: CaregiverCheckinCreate,
    current_user: Dict[str, Any] = Depends(require_roles(["caregiver", "doctor"])),
) -> Dict[str, Any]:
    """
    Caregiver or Nurse logs notes, observed vitals, and administered medications.
    Automatically captures actor, timestamp, and stores immutable audit trail (UC11).
    """
    checkin_data = body.model_dump(mode="json")
    user_profile = await db.get_user_by_id(current_user["user_id"])
    caregiver_name = user_profile.get("full_name") if user_profile else current_user.get("email", "Caregiver")

    return await db.create_checkin(
        patient_id=str(body.patient_id),
        caregiver_id=current_user["user_id"],
        checkin_data=checkin_data,
        caregiver_name=caregiver_name,
    )


@router.get(
    "/patient/{patient_id}",
    response_model=List[CaregiverCheckinResponse],
    summary="View caregiver oversight & activity logs for a patient (UC12)",
)
async def get_patient_checkins(
    patient_id: str,
    limit: int = Query(50, ge=1, le=200),
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> List[Dict[str, Any]]:
    """
    Chronological check-in history accessible by the patient, linked caregivers, doctors, and family (UC12).
    """
    return await db.get_checkins_by_patient(patient_id=patient_id, limit=limit)
