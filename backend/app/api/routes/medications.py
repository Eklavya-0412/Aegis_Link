"""
Medication management routes.

Endpoints:
    POST   /api/medications/                     – add a medication (patient)
    GET    /api/medications/                     – list own medications (patient)
    GET    /api/medications/{medication_id}      – get single medication
    PUT    /api/medications/{medication_id}      – update a medication
    DELETE /api/medications/{medication_id}      – delete a medication
    GET    /api/medications/patient/{patient_id} – view a patient's meds (caregiver / doctor)
"""

from __future__ import annotations

from typing import Any, Dict, List

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status

from app.api.dependencies import get_current_user, require_patient, require_roles
from app.models.schemas import MedicationCreate, MedicationResponse, MedicationUpdate
from app.services import supabase_client as db

router = APIRouter(prefix="/medications", tags=["Medications"])


@router.post(
    "/",
    response_model=MedicationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add a new medication",
)
async def create_medication(
    body: MedicationCreate,
    current_user: Dict[str, Any] = Depends(require_patient),
) -> Dict[str, Any]:
    """
    Add a medication to the authenticated patient's regimen.

    Time slots should be provided as a list of ``HH:MM`` strings.
    """
    med_data = body.model_dump(mode="json")
    med_data["start_date"] = str(med_data["start_date"])
    if med_data.get("end_date"):
        med_data["end_date"] = str(med_data["end_date"])
    return await db.create_medication(current_user["user_id"], med_data)


@router.get(
    "/",
    response_model=List[MedicationResponse],
    summary="List the current patient's medications",
)
async def list_my_medications(
    active_only: bool = Query(
        False, description="If true, return only active medications"
    ),
    current_user: Dict[str, Any] = Depends(require_patient),
) -> List[Dict[str, Any]]:
    """Retrieve all medications for the authenticated patient."""
    return await db.get_medications(
        current_user["user_id"], active_only=active_only
    )


@router.get(
    "/{medication_id}",
    response_model=MedicationResponse,
    summary="Get a single medication by ID",
)
async def get_medication(
    medication_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    """Retrieve a specific medication belonging to the authenticated user."""
    med = await db.get_medication_by_id(medication_id, current_user["user_id"])
    if not med:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medication not found.",
        )
    return med


@router.put(
    "/{medication_id}",
    response_model=MedicationResponse,
    summary="Update a medication",
)
async def update_medication(
    medication_id: str,
    body: MedicationUpdate,
    current_user: Dict[str, Any] = Depends(require_patient),
) -> Dict[str, Any]:
    """Patch one or more fields on a medication owned by the patient."""
    updates = body.model_dump(exclude_unset=True, mode="json")
    if not updates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update.",
        )
    # Serialise date fields.
    if "start_date" in updates and updates["start_date"]:
        updates["start_date"] = str(updates["start_date"])
    if "end_date" in updates and updates["end_date"]:
        updates["end_date"] = str(updates["end_date"])

    result = await db.update_medication(
        medication_id, current_user["user_id"], updates
    )
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medication not found.",
        )
    return result


@router.delete(
    "/{medication_id}",
    summary="Delete a medication",
)
async def delete_medication(
    medication_id: str,
    current_user: Dict[str, Any] = Depends(require_patient),
) -> Dict[str, str]:
    """Remove a medication from the patient's list."""
    deleted = await db.delete_medication(medication_id, current_user["user_id"])
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medication not found or you do not own it.",
        )
    return {"message": "Medication deleted successfully"}


@router.get(
    "/patient/{patient_id}",
    response_model=List[MedicationResponse],
    summary="View a patient's medications (caregivers and doctors only)",
)
async def get_patient_medications(
    patient_id: str,
    active_only: bool = Query(False),
    current_user: Dict[str, Any] = Depends(
        require_roles(["caregiver", "doctor"])
    ),
) -> List[Dict[str, Any]]:
    """
    Allow caregivers and doctors to view a specific patient's medication list.
    """
    return await db.get_medications(patient_id, active_only=active_only)
