"""
Supabase database interaction layer.

Uses the **service-role** client for privileged operations (bypassing RLS)
and provides typed CRUD helpers for every domain table.  All public
functions accept and return plain dicts / lists so they stay decoupled
from Pydantic and can be unit-tested easily.
"""

from __future__ import annotations

from functools import lru_cache
from typing import Any, Dict, List, Optional
from uuid import UUID

from supabase import Client, create_client

from app.core.config import get_settings
from app.core.exceptions import SupabaseOperationError


# ── Client Singleton ──────────────────────────────────────────────────

@lru_cache()
def get_supabase_client() -> Client:
    """
    Return a cached Supabase client initialised with the **service-role** key.

    The service-role key bypasses Row Level Security so the backend can
    perform any operation on behalf of any user.  Never expose this key
    to the frontend.
    """
    settings = get_settings()
    return create_client(settings.supabase_url, settings.supabase_service_role_key)


def _handle_response(response: Any) -> Any:
    """Extract data from a Supabase response or raise on error."""
    if hasattr(response, "data"):
        return response.data
    raise SupabaseOperationError("Unexpected response format from Supabase.")


# ── Users ─────────────────────────────────────────────────────────────

async def create_user_profile(user_data: Dict[str, Any]) -> Dict[str, Any]:
    """Insert a new row into the ``users`` table."""
    client = get_supabase_client()
    try:
        response = client.table("users").insert(user_data).execute()
        data = _handle_response(response)
        return data[0] if data else {}
    except Exception as exc:
        raise SupabaseOperationError(f"Failed to create user profile: {exc}")


async def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    """Fetch a single user by their UUID."""
    client = get_supabase_client()
    try:
        response = (
            client.table("users")
            .select("*")
            .eq("id", user_id)
            .single()
            .execute()
        )
        return _handle_response(response)
    except Exception:
        return None


async def update_user_profile(
    user_id: str, updates: Dict[str, Any]
) -> Dict[str, Any]:
    """Patch a user profile."""
    client = get_supabase_client()
    try:
        response = (
            client.table("users")
            .update(updates)
            .eq("id", user_id)
            .execute()
        )
        data = _handle_response(response)
        return data[0] if data else {}
    except Exception as exc:
        raise SupabaseOperationError(f"Failed to update user profile: {exc}")


async def delete_user_profile(user_id: str) -> bool:
    """Delete a user profile. Returns True on success."""
    client = get_supabase_client()
    try:
        client.table("users").delete().eq("id", user_id).execute()
        return True
    except Exception as exc:
        raise SupabaseOperationError(f"Failed to delete user: {exc}")


# ── Patient ↔ Caregiver Links ────────────────────────────────────────

async def link_patient_caregiver(
    patient_id: str, caregiver_id: str
) -> Dict[str, Any]:
    """Create a patient-caregiver relationship."""
    client = get_supabase_client()
    try:
        response = (
            client.table("patient_caregiver")
            .insert({"patient_id": patient_id, "caregiver_id": caregiver_id})
            .execute()
        )
        data = _handle_response(response)
        return data[0] if data else {}
    except Exception as exc:
        raise SupabaseOperationError(f"Failed to link patient/caregiver: {exc}")


async def get_linked_patients(caregiver_id: str) -> List[Dict[str, Any]]:
    """Return all patients linked to a caregiver."""
    client = get_supabase_client()
    try:
        response = (
            client.table("patient_caregiver")
            .select("*, users!patient_caregiver_patient_id_fkey(*)")
            .eq("caregiver_id", caregiver_id)
            .execute()
        )
        return _handle_response(response) or []
    except Exception as exc:
        raise SupabaseOperationError(f"Failed to fetch linked patients: {exc}")


async def get_linked_caregivers(patient_id: str) -> List[Dict[str, Any]]:
    """Return all caregivers linked to a patient."""
    client = get_supabase_client()
    try:
        response = (
            client.table("patient_caregiver")
            .select("*, users!patient_caregiver_caregiver_id_fkey(*)")
            .eq("patient_id", patient_id)
            .execute()
        )
        return _handle_response(response) or []
    except Exception as exc:
        raise SupabaseOperationError(f"Failed to fetch linked caregivers: {exc}")


async def unlink_patient_caregiver(
    patient_id: str, caregiver_id: str
) -> bool:
    """Remove a patient-caregiver link."""
    client = get_supabase_client()
    try:
        client.table("patient_caregiver").delete().eq(
            "patient_id", patient_id
        ).eq("caregiver_id", caregiver_id).execute()
        return True
    except Exception as exc:
        raise SupabaseOperationError(f"Failed to unlink: {exc}")


# ── Medications ───────────────────────────────────────────────────────

async def create_medication(
    user_id: str, med_data: Dict[str, Any]
) -> Dict[str, Any]:
    """Insert a new medication for a user."""
    client = get_supabase_client()
    try:
        med_data["user_id"] = user_id
        response = client.table("medications").insert(med_data).execute()
        data = _handle_response(response)
        return data[0] if data else {}
    except Exception as exc:
        raise SupabaseOperationError(f"Failed to create medication: {exc}")


async def get_medications(
    user_id: str, active_only: bool = False
) -> List[Dict[str, Any]]:
    """List medications for a user, optionally filtered to active ones."""
    client = get_supabase_client()
    try:
        query = client.table("medications").select("*").eq("user_id", user_id)
        if active_only:
            query = query.eq("is_active", True)
        response = query.order("created_at", desc=True).execute()
        return _handle_response(response) or []
    except Exception as exc:
        raise SupabaseOperationError(f"Failed to fetch medications: {exc}")


async def get_medication_by_id(
    medication_id: str, user_id: str
) -> Optional[Dict[str, Any]]:
    """Fetch a single medication ensuring it belongs to the user."""
    client = get_supabase_client()
    try:
        response = (
            client.table("medications")
            .select("*")
            .eq("id", medication_id)
            .eq("user_id", user_id)
            .single()
            .execute()
        )
        return _handle_response(response)
    except Exception:
        return None


async def update_medication(
    medication_id: str, user_id: str, updates: Dict[str, Any]
) -> Dict[str, Any]:
    """Update a medication scoped to the owning user."""
    client = get_supabase_client()
    try:
        response = (
            client.table("medications")
            .update(updates)
            .eq("id", medication_id)
            .eq("user_id", user_id)
            .execute()
        )
        data = _handle_response(response)
        return data[0] if data else {}
    except Exception as exc:
        raise SupabaseOperationError(f"Failed to update medication: {exc}")


async def delete_medication(medication_id: str, user_id: str) -> bool:
    """Delete a medication record."""
    client = get_supabase_client()
    try:
        client.table("medications").delete().eq("id", medication_id).eq(
            "user_id", user_id
        ).execute()
        return True
    except Exception as exc:
        raise SupabaseOperationError(f"Failed to delete medication: {exc}")


# ── Vitals ────────────────────────────────────────────────────────────

async def create_vital(
    user_id: str, vital_data: Dict[str, Any]
) -> Dict[str, Any]:
    """Log a vital reading for a user."""
    client = get_supabase_client()
    try:
        vital_data["user_id"] = user_id
        response = client.table("vitals").insert(vital_data).execute()
        data = _handle_response(response)
        return data[0] if data else {}
    except Exception as exc:
        raise SupabaseOperationError(f"Failed to log vital: {exc}")


async def get_vitals(
    user_id: str,
    vital_type: Optional[str] = None,
    limit: int = 50,
) -> List[Dict[str, Any]]:
    """Retrieve vitals for a user, optionally filtered by type."""
    client = get_supabase_client()
    try:
        query = client.table("vitals").select("*").eq("user_id", user_id)
        if vital_type:
            query = query.eq("vital_type", vital_type)
        response = query.order("recorded_at", desc=True).limit(limit).execute()
        return _handle_response(response) or []
    except Exception as exc:
        raise SupabaseOperationError(f"Failed to fetch vitals: {exc}")


async def delete_vital(vital_id: str, user_id: str) -> bool:
    """Delete a vital record."""
    client = get_supabase_client()
    try:
        client.table("vitals").delete().eq("id", vital_id).eq(
            "user_id", user_id
        ).execute()
        return True
    except Exception as exc:
        raise SupabaseOperationError(f"Failed to delete vital: {exc}")


# ── Appointments ──────────────────────────────────────────────────────

async def create_appointment(
    user_id: str, appt_data: Dict[str, Any]
) -> Dict[str, Any]:
    """Schedule a new appointment."""
    client = get_supabase_client()
    try:
        appt_data["user_id"] = user_id
        response = client.table("appointments").insert(appt_data).execute()
        data = _handle_response(response)
        return data[0] if data else {}
    except Exception as exc:
        raise SupabaseOperationError(f"Failed to create appointment: {exc}")


async def get_appointments(
    user_id: str, status: Optional[str] = None
) -> List[Dict[str, Any]]:
    """List appointments for a user, optionally filtered by status."""
    client = get_supabase_client()
    try:
        query = client.table("appointments").select("*").eq("user_id", user_id)
        if status:
            query = query.eq("status", status)
        response = query.order("appointment_date", desc=False).execute()
        return _handle_response(response) or []
    except Exception as exc:
        raise SupabaseOperationError(f"Failed to fetch appointments: {exc}")


async def get_appointment_by_id(
    appointment_id: str, user_id: str
) -> Optional[Dict[str, Any]]:
    """Fetch a single appointment scoped to the user."""
    client = get_supabase_client()
    try:
        response = (
            client.table("appointments")
            .select("*")
            .eq("id", appointment_id)
            .eq("user_id", user_id)
            .single()
            .execute()
        )
        return _handle_response(response)
    except Exception:
        return None


async def update_appointment(
    appointment_id: str, user_id: str, updates: Dict[str, Any]
) -> Dict[str, Any]:
    """Update an appointment scoped to the user."""
    client = get_supabase_client()
    try:
        response = (
            client.table("appointments")
            .update(updates)
            .eq("id", appointment_id)
            .eq("user_id", user_id)
            .execute()
        )
        data = _handle_response(response)
        return data[0] if data else {}
    except Exception as exc:
        raise SupabaseOperationError(f"Failed to update appointment: {exc}")


async def delete_appointment(appointment_id: str, user_id: str) -> bool:
    """Cancel / delete an appointment."""
    client = get_supabase_client()
    try:
        client.table("appointments").delete().eq("id", appointment_id).eq(
            "user_id", user_id
        ).execute()
        return True
    except Exception as exc:
        raise SupabaseOperationError(f"Failed to delete appointment: {exc}")
