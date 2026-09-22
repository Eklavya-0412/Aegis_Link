"""
FastAPI dependencies for authentication and Role-Based Access Control.

Usage in route handlers::

    @router.get("/patient-only")
    async def patient_route(user: dict = Depends(require_patient)):
        ...

    @router.get("/caregiver-or-doctor")
    async def mixed_route(user: dict = Depends(require_roles(["caregiver", "doctor"]))):
        ...
"""

from __future__ import annotations

from typing import Any, Callable, Dict, List

from fastapi import Depends, HTTPException, status

from app.core.security import verify_jwt
from app.models.schemas import UserRole


def _extract_role(payload: Dict[str, Any]) -> str:
    """
    Pull the application role from the JWT's ``app_metadata``.

    Supabase stores custom claims under ``app_metadata``.  The expected
    shape is ``{"role": "patient" | "caregiver" | "doctor"}``.  If the
    claim is missing the user is rejected.
    """
    app_meta = payload.get("app_metadata") or {}
    role = app_meta.get("role")
    if not role:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No application role assigned.  Contact support.",
        )
    return role


# ── Convenience helpers ───────────────────────────────────────────────

async def get_current_user(
    payload: Dict[str, Any] = Depends(verify_jwt),
) -> Dict[str, Any]:
    """
    Return a minimal user dict extracted from the verified JWT.

    Adds the resolved ``role`` as a top-level key for easy access.
    """
    role = _extract_role(payload)
    return {
        "user_id": payload["sub"],
        "email": payload.get("email"),
        "role": role,
        "app_metadata": payload.get("app_metadata", {}),
        "user_metadata": payload.get("user_metadata", {}),
    }


def require_roles(allowed_roles: List[str]) -> Callable:
    """
    Factory that returns a dependency restricting access to *allowed_roles*.

    Example::

        require_roles(["doctor", "caregiver"])
    """

    async def _dependency(
        current_user: Dict[str, Any] = Depends(get_current_user),
    ) -> Dict[str, Any]:
        if current_user["role"] not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    f"This endpoint requires one of {allowed_roles} roles. "
                    f"Your role is '{current_user['role']}'."
                ),
            )
        return current_user

    return _dependency


# ── Pre-built role guards ─────────────────────────────────────────────

async def require_patient(
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    """Dependency that restricts access to the **patient** role only."""
    if current_user["role"] != UserRole.PATIENT.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only patients can access this resource.",
        )
    return current_user


async def require_caregiver(
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    """Dependency that restricts access to the **caregiver** role only."""
    if current_user["role"] != UserRole.CAREGIVER.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only caregivers can access this resource.",
        )
    return current_user


async def require_doctor(
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    """Dependency that restricts access to the **doctor** role only."""
    if current_user["role"] != UserRole.DOCTOR.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only doctors can access this resource.",
        )
    return current_user
