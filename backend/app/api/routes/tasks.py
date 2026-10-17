"""
Care Tasks API routes for Caregivers.

Endpoints:
    GET    /api/tasks/           – List care tasks
    POST   /api/tasks/           – Create new care task
    PATCH  /api/tasks/{task_id}  – Toggle completion or update task
    DELETE /api/tasks/{task_id}  – Remove care task
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.dependencies import get_current_user, require_roles
from app.models.schemas import CareTaskCreate, CareTaskResponse, CareTaskUpdate
from app.services import supabase_client as db

router = APIRouter(prefix="/tasks", tags=["Care Tasks"])


@router.get(
    "/",
    response_model=List[CareTaskResponse],
    summary="List care tasks for caregiver or patient",
)
async def list_tasks(
    patient_id: Optional[str] = Query(None),
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> List[Dict[str, Any]]:
    """Retrieve care tasks."""
    caregiver_id = current_user["user_id"] if current_user["role"] in ["caregiver", "doctor"] else None
    return await db.get_care_tasks(caregiver_id=caregiver_id, patient_id=patient_id)


@router.post(
    "/",
    response_model=CareTaskResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new care task",
)
async def create_task(
    body: CareTaskCreate,
    current_user: Dict[str, Any] = Depends(require_roles(["caregiver", "doctor"])),
) -> Dict[str, Any]:
    """Create task for caregiver to monitor or perform."""
    task_data = body.model_dump(mode="json")
    if not task_data.get("caregiver_id"):
        task_data["caregiver_id"] = current_user["user_id"]
    return await db.create_care_task(task_data)


@router.patch(
    "/{task_id}",
    response_model=CareTaskResponse,
    summary="Update or toggle care task",
)
async def update_task(
    task_id: str,
    body: CareTaskUpdate,
    current_user: Dict[str, Any] = Depends(require_roles(["caregiver", "doctor", "patient"])),
) -> Dict[str, Any]:
    """Toggle completion or update task fields."""
    updates = body.model_dump(exclude_unset=True, mode="json")
    updated = await db.update_care_task(task_id, updates)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Care task not found")
    return updated


@router.delete(
    "/{task_id}",
    summary="Delete care task",
)
async def delete_task(
    task_id: str,
    current_user: Dict[str, Any] = Depends(require_roles(["caregiver", "doctor"])),
) -> Dict[str, str]:
    """Remove care task."""
    await db.delete_care_task(task_id)
    return {"message": "Care task deleted"}
