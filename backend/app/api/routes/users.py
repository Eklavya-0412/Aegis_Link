"""
User profile management routes.

Endpoints:
    GET    /api/users/me              – current user's profile
    PUT    /api/users/me              – update own profile
    POST   /api/users/profile         – create profile (post-signup)
    GET    /api/users/{user_id}       – get user by ID (doctor / caregiver)
    POST   /api/users/link-caregiver  – patient links a caregiver
    DELETE /api/users/link-caregiver  – patient unlinks a caregiver
    GET    /api/users/my-patients     – caregiver lists linked patients
    GET    /api/users/my-caregivers   – patient lists linked caregivers
"""

from __future__ import annotations

from typing import Any, Dict, List

from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.api.dependencies import (
    get_current_user,
    require_caregiver,
    require_patient,
    require_roles,
)
from app.models.schemas import (
    PatientCaregiverLink,
    PatientCaregiverResponse,
    UserCreate,
    UserResponse,
    UserUpdate,
)
from app.services import supabase_client as db

router = APIRouter(prefix="/users", tags=["Users"])


# ── Profile CRUD ──────────────────────────────────────────────────────


@router.post(
    "/profile",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create user profile after Supabase Auth signup",
)
async def create_profile(
    body: UserCreate,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Called once immediately after a new user registers via Supabase Auth.

    The ``id`` is taken from the JWT subject claim so it stays in sync
    with the auth provider.
    """
    user_data = body.model_dump(mode="json")
    user_data["id"] = current_user["user_id"]
    return await db.create_user_profile(user_data)


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get the current authenticated user's profile",
)
async def get_my_profile(
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    """Return the profile of the currently authenticated user."""
    profile = await db.get_user_by_id(current_user["user_id"])
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found. Please complete registration.",
        )
    return profile


@router.put(
    "/me",
    response_model=UserResponse,
    summary="Update the current user's profile",
)
async def update_my_profile(
    body: UserUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    """Patch the authenticated user's own profile."""
    updates = body.model_dump(exclude_unset=True, mode="json")
    if not updates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update.",
        )
    return await db.update_user_profile(current_user["user_id"], updates)


@router.get(
    "/{user_id}",
    response_model=UserResponse,
    summary="Get a user profile by ID (doctors and caregivers only)",
)
async def get_user_by_id(
    user_id: str,
    current_user: Dict[str, Any] = Depends(
        require_roles(["doctor", "caregiver"])
    ),
) -> Dict[str, Any]:
    """
    Retrieve another user's profile.

    Restricted to doctors and caregivers who need to view patient
    information.
    """
    profile = await db.get_user_by_id(user_id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )
    return profile


# ── Patient ↔ Caregiver Linking ──────────────────────────────────────


@router.post(
    "/link-caregiver",
    response_model=PatientCaregiverResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Link a caregiver to the current patient",
)
async def link_caregiver(
    body: PatientCaregiverLink,
    current_user: Dict[str, Any] = Depends(require_patient),
) -> Dict[str, Any]:
    """
    Create a relationship between the authenticated patient and a
    caregiver identified by ``caregiver_id``.
    """
    if str(body.patient_id) != current_user["user_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only link caregivers to your own account.",
        )
    return await db.link_patient_caregiver(
        str(body.patient_id), str(body.caregiver_id)
    )


@router.delete(
    "/link-caregiver",
    summary="Unlink a caregiver from the current patient",
)
async def unlink_caregiver(
    body: PatientCaregiverLink,
    current_user: Dict[str, Any] = Depends(require_patient),
) -> Dict[str, str]:
    """Remove the relationship between a patient and a caregiver."""
    if str(body.patient_id) != current_user["user_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only unlink caregivers from your own account.",
        )
    await db.unlink_patient_caregiver(
        str(body.patient_id), str(body.caregiver_id)
    )
    return {"message": "Caregiver unlinked successfully"}


@router.get(
    "/my-patients",
    response_model=List[Dict[str, Any]],
    summary="List patients linked to the current caregiver",
)
async def list_my_patients(
    current_user: Dict[str, Any] = Depends(require_caregiver),
) -> List[Dict[str, Any]]:
    """Return all patients linked to the authenticated caregiver."""
    return await db.get_linked_patients(current_user["user_id"])


@router.get(
    "/my-caregivers",
    response_model=List[Dict[str, Any]],
    summary="List caregivers linked to the current patient",
)
async def list_my_caregivers(
    current_user: Dict[str, Any] = Depends(require_patient),
) -> List[Dict[str, Any]]:
    """Return all caregivers linked to the authenticated patient."""
    return await db.get_linked_caregivers(current_user["user_id"])
