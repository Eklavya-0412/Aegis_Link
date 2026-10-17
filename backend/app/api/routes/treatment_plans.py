"""
Clinical Treatment & Diet Plans API routes (UML UC8 & Doctor Oversight).

Endpoints:
    POST /api/treatment-plans/                     – Doctor creates treatment & diet plan (UC8)
    GET  /api/treatment-plans/patient/{patient_id} – Retrieve treatment plans for patient
    PUT  /api/treatment-plans/{plan_id}            – Doctor updates treatment plan
"""

from __future__ import annotations

from typing import Any, Dict, List
from fastapi import APIRouter, Depends, HTTPException, status

from app.api.dependencies import get_current_user, require_doctor, require_roles
from app.models.schemas import (
    TreatmentPlanCreate,
    TreatmentPlanResponse,
    TreatmentPlanUpdate,
)
from app.services import supabase_client as db

router = APIRouter(prefix="/treatment-plans", tags=["Treatment Plans"])


@router.post(
    "/",
    response_model=TreatmentPlanResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create clinical treatment and diet plan (Doctor UC8)",
)
async def create_plan(
    body: TreatmentPlanCreate,
    current_user: Dict[str, Any] = Depends(require_doctor),
) -> Dict[str, Any]:
    """
    Attending Doctor establishes clinical treatment, diet recommendations, and prescriptions.
    Logs TREATMENT_ADJUSTMENT in audit trail.
    """
    plan_data = body.model_dump(mode="json")
    user_profile = await db.get_user_by_id(current_user["user_id"])
    doctor_name = user_profile.get("full_name") if user_profile else "Dr. " + current_user.get("email", "Physician")

    return await db.create_treatment_plan(
        patient_id=str(body.patient_id),
        doctor_id=current_user["user_id"],
        plan_data=plan_data,
        doctor_name=doctor_name,
    )


@router.get(
    "/patient/{patient_id}",
    response_model=List[TreatmentPlanResponse],
    summary="Retrieve clinical treatment plans for a patient",
)
async def get_plans(
    patient_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> List[Dict[str, Any]]:
    """
    Retrieve treatment plans for viewing by patient, doctor, caregiver, or family.
    """
    return await db.get_treatment_plans_by_patient(patient_id=patient_id)


@router.put(
    "/{plan_id}",
    response_model=TreatmentPlanResponse,
    summary="Update treatment plan (Doctor only)",
)
async def update_plan(
    plan_id: str,
    body: TreatmentPlanUpdate,
    current_user: Dict[str, Any] = Depends(require_doctor),
) -> Dict[str, Any]:
    """Modify treatment plan and record clinical update audit entry."""
    updates = body.model_dump(exclude_unset=True, mode="json")
    if not updates:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No fields to update")

    updated = await db.update_treatment_plan(
        plan_id=plan_id,
        doctor_id=current_user["user_id"],
        updates=updates,
    )
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Treatment plan not found")
    return updated
