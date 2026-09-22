"""
Appointment scheduling routes.

Endpoints:
    POST   /api/appointments/                        – schedule an appointment (patient)
    GET    /api/appointments/                        – list own appointments (patient)
    GET    /api/appointments/{appointment_id}        – get single appointment
    PUT    /api/appointments/{appointment_id}        – update an appointment
    DELETE /api/appointments/{appointment_id}        – cancel an appointment
    GET    /api/appointments/patient/{patient_id}    – view a patient's appointments (caregiver / doctor)
    GET    /api/appointments/doctor/my-appointments  – doctor views their schedule
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status

from app.api.dependencies import (
    get_current_user,
    require_doctor,
    require_patient,
    require_roles,
)
from app.models.schemas import (
    AppointmentCreate,
    AppointmentResponse,
    AppointmentStatus,
    AppointmentUpdate,
)
from app.services import supabase_client as db

router = APIRouter(prefix="/appointments", tags=["Appointments"])


@router.post(
    "/",
    response_model=AppointmentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Schedule a new appointment",
)
async def create_appointment(
    body: AppointmentCreate,
    current_user: Dict[str, Any] = Depends(require_patient),
) -> Dict[str, Any]:
    """
    Schedule a medical appointment for the authenticated patient.

    If a ``doctor_id`` is provided the appointment will also appear on
    the doctor's schedule.
    """
    appt_data = body.model_dump(mode="json")
    appt_data["appointment_date"] = str(appt_data["appointment_date"])
    appt_data["appointment_time"] = str(appt_data["appointment_time"])
    if appt_data.get("doctor_id"):
        appt_data["doctor_id"] = str(appt_data["doctor_id"])
    return await db.create_appointment(current_user["user_id"], appt_data)


@router.get(
    "/",
    response_model=List[AppointmentResponse],
    summary="List the current patient's appointments",
)
async def list_my_appointments(
    status_filter: Optional[AppointmentStatus] = Query(
        None, alias="status", description="Filter by appointment status"
    ),
    current_user: Dict[str, Any] = Depends(require_patient),
) -> List[Dict[str, Any]]:
    """Retrieve upcoming and past appointments for the authenticated patient."""
    return await db.get_appointments(
        current_user["user_id"],
        status=status_filter.value if status_filter else None,
    )


@router.get(
    "/doctor/my-appointments",
    response_model=List[AppointmentResponse],
    summary="List appointments for the authenticated doctor",
)
async def list_doctor_appointments(
    status_filter: Optional[AppointmentStatus] = Query(
        None, alias="status"
    ),
    current_user: Dict[str, Any] = Depends(require_doctor),
) -> List[Dict[str, Any]]:
    """
    Return all appointments where the authenticated doctor is the assigned
    physician (``doctor_id`` matches the JWT subject).
    """
    return await db.get_appointments(
        current_user["user_id"],
        status=status_filter.value if status_filter else None,
    )


@router.get(
    "/{appointment_id}",
    response_model=AppointmentResponse,
    summary="Get a single appointment by ID",
)
async def get_appointment(
    appointment_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    """Retrieve a specific appointment belonging to the authenticated user."""
    appt = await db.get_appointment_by_id(
        appointment_id, current_user["user_id"]
    )
    if not appt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found.",
        )
    return appt


@router.put(
    "/{appointment_id}",
    response_model=AppointmentResponse,
    summary="Update an appointment",
)
async def update_appointment(
    appointment_id: str,
    body: AppointmentUpdate,
    current_user: Dict[str, Any] = Depends(require_patient),
) -> Dict[str, Any]:
    """Reschedule or update details of an existing appointment."""
    updates = body.model_dump(exclude_unset=True, mode="json")
    if not updates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update.",
        )
    if "appointment_date" in updates and updates["appointment_date"]:
        updates["appointment_date"] = str(updates["appointment_date"])
    if "appointment_time" in updates and updates["appointment_time"]:
        updates["appointment_time"] = str(updates["appointment_time"])
    if "doctor_id" in updates and updates["doctor_id"]:
        updates["doctor_id"] = str(updates["doctor_id"])

    result = await db.update_appointment(
        appointment_id, current_user["user_id"], updates
    )
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found.",
        )
    return result


@router.delete(
    "/{appointment_id}",
    summary="Cancel / delete an appointment",
)
async def delete_appointment(
    appointment_id: str,
    current_user: Dict[str, Any] = Depends(require_patient),
) -> Dict[str, str]:
    """Delete an appointment record."""
    deleted = await db.delete_appointment(
        appointment_id, current_user["user_id"]
    )
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found or you do not own it.",
        )
    return {"message": "Appointment deleted successfully"}


@router.get(
    "/patient/{patient_id}",
    response_model=List[AppointmentResponse],
    summary="View a patient's appointments (caregivers and doctors only)",
)
async def get_patient_appointments(
    patient_id: str,
    status_filter: Optional[AppointmentStatus] = Query(
        None, alias="status"
    ),
    current_user: Dict[str, Any] = Depends(
        require_roles(["caregiver", "doctor"])
    ),
) -> List[Dict[str, Any]]:
    """Allow caregivers and doctors to view a patient's appointment schedule."""
    return await db.get_appointments(
        patient_id,
        status=status_filter.value if status_filter else None,
    )
