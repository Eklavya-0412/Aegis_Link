"""
Audit Trail API routes (Append-Only).
"""

from __future__ import annotations

from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, Query, status

from app.api.dependencies import get_current_user
from app.models.schemas import AuditLogPaginatedResponse
from app.services import supabase_client as db

router = APIRouter(prefix="/audit", tags=["Audit Trail"])


@router.get(
    "",
    response_model=AuditLogPaginatedResponse,
    summary="Get paginated, append-only audit trail logs",
)
async def get_audit_logs(
    patient_id: Optional[str] = Query(None, description="Filter logs for patient ID"),
    limit: int = Query(50, ge=1, le=200),
    cursor: Optional[str] = Query(None, description="Cursor for pagination"),
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    """Retrieve append-only audit log entries for an actor or patient."""
    target_patient = patient_id or current_user["user_id"]
    return await db.get_audit_logs(
        patient_id=target_patient,
        limit=limit,
        cursor=cursor,
    )
