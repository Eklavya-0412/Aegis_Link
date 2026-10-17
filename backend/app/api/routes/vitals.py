"""
Vital-sign recording and retrieval routes.

Endpoints:
    POST   /api/vitals/             – log a vital reading (patient)
    GET    /api/vitals/             – list own vitals (patient)
    GET    /api/vitals/{patient_id} – view a patient's vitals (caregiver / doctor)
    DELETE /api/vitals/{vital_id}   – delete a vital record (patient)
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status

from app.api.dependencies import get_current_user, require_patient, require_roles
from app.models.schemas import VitalCreate, VitalResponse, VitalType
from app.services import supabase_client as db

router = APIRouter(prefix="/vitals", tags=["Vitals"])


from app.services.anomaly_service import evaluate_anomaly
from app.services.websocket_manager import ws_manager


@router.post(
    "/",
    response_model=VitalResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Log a vital-sign reading",
)
async def log_vital(
    body: VitalCreate,
    current_user: Dict[str, Any] = Depends(require_patient),
) -> Dict[str, Any]:
    """
    Record a new vital-sign measurement for the authenticated patient.
    Evaluates anomaly thresholds post-write and broadcasts alerts to linked caregivers.
    """
    vital_data = body.model_dump(mode="json")
    vital_data["vital_type"] = vital_data["vital_type"]
    vital_data["recorded_at"] = str(vital_data["recorded_at"])
    
    created_vital = await db.create_vital(current_user["user_id"], vital_data)
    
    # Anomaly evaluation
    alert = evaluate_anomaly(created_vital)
    if alert:
        await db.log_audit(
            actor_id=current_user["user_id"],
            action="ANOMALY_DETECTED",
            target_type="vital",
            target_id=created_vital.get("id", ""),
            metadata=alert,
        )
        # Fetch linked caregiver IDs
        try:
            linked = await db.get_linked_caregivers(current_user["user_id"])
            caregiver_ids = [str(item.get("caregiver_id")) for item in linked if item.get("caregiver_id")]
        except Exception:
            caregiver_ids = []
            
        await ws_manager.broadcast_alert(current_user["user_id"], alert, caregiver_ids)
        
    return created_vital


@router.get(
    "/",
    response_model=List[VitalResponse],
    summary="List the current patient's vital readings",
)
async def list_my_vitals(
    vital_type: Optional[VitalType] = Query(
        None, description="Filter by vital type"
    ),
    limit: int = Query(50, ge=1, le=200, description="Max records to return"),
    current_user: Dict[str, Any] = Depends(require_patient),
) -> List[Dict[str, Any]]:
    """
    Retrieve the authenticated patient's vital history.

    Supports optional filtering by ``vital_type`` and pagination via ``limit``.
    """
    return await db.get_vitals(
        current_user["user_id"],
        vital_type=vital_type.value if vital_type else None,
        limit=limit,
    )


@router.get(
    "/{patient_id}",
    response_model=List[VitalResponse],
    summary="View a patient's vitals (caregivers and doctors only)",
)
async def get_patient_vitals(
    patient_id: str,
    vital_type: Optional[VitalType] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    current_user: Dict[str, Any] = Depends(
        require_roles(["caregiver", "doctor"])
    ),
) -> List[Dict[str, Any]]:
    """
    Allow caregivers and doctors to view a specific patient's vitals.

    In production, you would also verify that the requesting caregiver
    is linked to this patient.
    """
    return await db.get_vitals(
        patient_id,
        vital_type=vital_type.value if vital_type else None,
        limit=limit,
    )


@router.delete(
    "/{vital_id}",
    summary="Delete a vital record",
)
async def delete_vital(
    vital_id: str,
    current_user: Dict[str, Any] = Depends(require_patient),
) -> Dict[str, str]:
    """Remove a vital reading owned by the authenticated patient."""
    deleted = await db.delete_vital(vital_id, current_user["user_id"])
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vital record not found or you do not own it.",
        )
    return {"message": "Vital record deleted successfully"}
