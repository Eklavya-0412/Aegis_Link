"""
Access Consent Management API routes.
"""

from __future__ import annotations

from typing import Any, Dict, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.dependencies import get_current_user
from app.models.schemas import (
    ConsentCheckResponse,
    ConsentGrantRequest,
    ConsentResponse,
    ConsentRevokeRequest,
)
from app.services import supabase_client as db

router = APIRouter(prefix="/consent", tags=["Access Consent"])


@router.post(
    "/grant",
    response_model=ConsentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Grant access consent to another user",
)
async def grant_consent(
    body: ConsentGrantRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    """Grant granular access consent for health records."""
    if str(body.patient_id) != current_user["user_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only grant consent for your own health records.",
        )

    expires_at_str = body.expires_at.isoformat() if body.expires_at else None
    return await db.grant_consent(
        patient_id=str(body.patient_id),
        grantee_id=str(body.grantee_id),
        scope=body.scope,
        expires_at=expires_at_str,
    )


@router.post(
    "/revoke",
    summary="Revoke an existing access consent",
)
async def revoke_consent(
    body: ConsentRevokeRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    """Revoke an active consent record."""
    return await db.revoke_consent(
        consent_id=str(body.consent_id),
        actor_id=current_user["user_id"],
    )


@router.get(
    "/check",
    response_model=ConsentCheckResponse,
    summary="Check if grantee has valid access consent for a patient scope",
)
async def check_consent(
    patient_id: str = Query(...),
    grantee_id: str = Query(...),
    scope: str = Query(...),
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    """Check active consent status."""
    allowed = await db.check_consent(
        patient_id=patient_id,
        grantee_id=grantee_id,
        scope=scope,
    )
    return {
        "allowed": allowed,
        "patient_id": patient_id,
        "grantee_id": grantee_id,
        "scope": scope,
    }
