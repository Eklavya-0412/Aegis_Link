"""
Lab Results & Diagnostic Reports API routes (UML UC6 & UC9).

Endpoints:
    GET  /api/lab-results/patient/{patient_id} – Retrieve lab results (Consent Gated for Doctors!)
    POST /api/lab-results/                     – Record lab results
"""

from __future__ import annotations

from typing import Any, Dict, List
from fastapi import APIRouter, Depends, HTTPException, status

from app.api.dependencies import get_current_user, require_roles
from app.models.schemas import LabResultCreate, LabResultResponse
from app.services import supabase_client as db

router = APIRouter(prefix="/lab-results", tags=["Lab Results"])


@router.get(
    "/patient/{patient_id}",
    response_model=List[LabResultResponse],
    summary="Get patient lab results (Consent verification enforced - EXP6)",
)
async def get_patient_labs(
    patient_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> List[Dict[str, Any]]:
    """
    Retrieve lab panels for a patient.
    Enforces consent verification: If requested by a Doctor and consent is missing,
    raises 403 Forbidden with consent required prompt (EXP6 Sequence Diagram).
    """
    target_patient = str(patient_id)
    if current_user["role"] == "doctor" and target_patient != current_user["user_id"]:
        allowed = await db.check_consent(target_patient, current_user["user_id"], "documents")
        if not allowed:
            # Also check wildcard consent
            allowed = await db.check_consent(target_patient, current_user["user_id"], "*")
        if not allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Consent required: Patient has not granted document/lab review permissions to this doctor profile.",
            )

    return await db.get_lab_results_by_patient(patient_id=target_patient)


@router.post(
    "/",
    response_model=LabResultResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Record new lab test results",
)
async def create_lab(
    body: LabResultCreate,
    current_user: Dict[str, Any] = Depends(require_roles(["doctor", "caregiver"])),
) -> Dict[str, Any]:
    """Upload or record diagnostic lab result."""
    lab_data = body.model_dump(mode="json")
    if lab_data.get("test_date"):
        lab_data["test_date"] = str(lab_data["test_date"])

    return await db.create_lab_result(lab_data=lab_data, ordered_by=current_user["user_id"])
