"""
Pydantic schemas for request / response validation.

Each domain entity has:
- A *Base* schema with shared fields.
- A *Create* schema for POST bodies.
- An *Update* schema for PATCH bodies (all fields optional).
- A *Response* schema that adds server-generated fields (id, timestamps).

These schemas map to the following Supabase (PostgreSQL) tables:

    users              – synced from Supabase Auth with extra profile fields
    medications        – patient medication schedules
    vitals             – recorded health metrics
    appointments       – scheduled visits
    patient_caregiver  – many-to-many link between patients and caregivers
"""

from __future__ import annotations

from datetime import date, datetime, time
from enum import Enum
from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field


# ── Enums ─────────────────────────────────────────────────────────────

class UserRole(str, Enum):
    """Application-level roles stored in Supabase app_metadata."""
    PATIENT = "patient"
    CAREGIVER = "caregiver"
    DOCTOR = "doctor"


class VitalType(str, Enum):
    """Types of vital signs that can be recorded."""
    HEART_RATE = "heart_rate"
    BLOOD_PRESSURE_SYSTOLIC = "blood_pressure_systolic"
    BLOOD_PRESSURE_DIASTOLIC = "blood_pressure_diastolic"
    BLOOD_GLUCOSE = "blood_glucose"
    TEMPERATURE = "temperature"
    OXYGEN_SATURATION = "oxygen_saturation"
    WEIGHT = "weight"


class MedicationFrequency(str, Enum):
    """How often a medication should be taken."""
    ONCE_DAILY = "once_daily"
    TWICE_DAILY = "twice_daily"
    THREE_TIMES_DAILY = "three_times_daily"
    FOUR_TIMES_DAILY = "four_times_daily"
    WEEKLY = "weekly"
    AS_NEEDED = "as_needed"


class AppointmentStatus(str, Enum):
    """Lifecycle status of an appointment."""
    SCHEDULED = "scheduled"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    NO_SHOW = "no_show"


class SymptomSeverity(str, Enum):
    """AI-assessed severity level."""
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    CRITICAL = "critical"


# ── Users ─────────────────────────────────────────────────────────────

class UserBase(BaseModel):
    """Shared user profile fields."""
    full_name: str = Field(..., min_length=1, max_length=120, examples=["Jane Doe"])
    email: EmailStr
    role: UserRole
    phone: Optional[str] = Field(None, max_length=20, examples=["+1-555-0199"])
    avatar_url: Optional[str] = None
    date_of_birth: Optional[date] = None
    blood_group: Optional[str] = Field(None, max_length=5, examples=["O+"])


class UserCreate(UserBase):
    """Body for creating a user profile after Supabase Auth signup."""
    pass


class UserUpdate(BaseModel):
    """Body for updating a user profile (all fields optional)."""
    full_name: Optional[str] = Field(None, min_length=1, max_length=120)
    phone: Optional[str] = Field(None, max_length=20)
    avatar_url: Optional[str] = None
    date_of_birth: Optional[date] = None
    blood_group: Optional[str] = Field(None, max_length=5)

    model_config = ConfigDict(extra="forbid")


class UserResponse(UserBase):
    """User profile returned from the API."""
    id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ── Patient ↔ Caregiver Mapping ──────────────────────────────────────

class PatientCaregiverLink(BaseModel):
    """Links a patient to a caregiver (or vice-versa)."""
    patient_id: UUID
    caregiver_id: UUID


class PatientCaregiverResponse(PatientCaregiverLink):
    """Stored link including timestamp."""
    id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ── Medications ───────────────────────────────────────────────────────

class MedicationBase(BaseModel):
    """Shared medication fields."""
    name: str = Field(..., min_length=1, max_length=200, examples=["Metformin"])
    dosage: str = Field(..., max_length=100, examples=["500 mg"])
    frequency: MedicationFrequency
    time_slots: List[str] = Field(
        default_factory=list,
        examples=[["08:00", "20:00"]],
        description="List of HH:MM time strings when the medication should be taken.",
    )
    start_date: date
    end_date: Optional[date] = None
    notes: Optional[str] = Field(None, max_length=500)
    is_active: bool = True


class MedicationCreate(MedicationBase):
    """Body for adding a new medication."""
    pass


class MedicationUpdate(BaseModel):
    """Body for patching a medication."""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    dosage: Optional[str] = Field(None, max_length=100)
    frequency: Optional[MedicationFrequency] = None
    time_slots: Optional[List[str]] = None
    end_date: Optional[date] = None
    notes: Optional[str] = Field(None, max_length=500)
    is_active: Optional[bool] = None

    model_config = ConfigDict(extra="forbid")


class MedicationResponse(MedicationBase):
    """Medication record returned from the API."""
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ── Vitals ────────────────────────────────────────────────────────────

class VitalBase(BaseModel):
    """Shared vital-sign fields."""
    vital_type: VitalType
    value: float = Field(..., examples=[72.0])
    unit: str = Field(..., max_length=20, examples=["bpm"])
    recorded_at: datetime


class VitalCreate(VitalBase):
    """Body for logging a vital reading."""
    notes: Optional[str] = Field(None, max_length=500)


class VitalResponse(VitalBase):
    """Vital reading returned from the API."""
    id: UUID
    user_id: UUID
    notes: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ── Appointments ──────────────────────────────────────────────────────

class AppointmentBase(BaseModel):
    """Shared appointment fields."""
    title: str = Field(..., min_length=1, max_length=200, examples=["Annual Checkup"])
    doctor_name: Optional[str] = Field(None, max_length=200)
    doctor_id: Optional[UUID] = None
    location: Optional[str] = Field(None, max_length=300)
    appointment_date: date
    appointment_time: time
    duration_minutes: int = Field(default=30, ge=5, le=480)
    notes: Optional[str] = Field(None, max_length=500)
    status: AppointmentStatus = AppointmentStatus.SCHEDULED


class AppointmentCreate(AppointmentBase):
    """Body for scheduling an appointment."""
    pass


class AppointmentUpdate(BaseModel):
    """Body for updating an appointment."""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    doctor_name: Optional[str] = Field(None, max_length=200)
    doctor_id: Optional[UUID] = None
    location: Optional[str] = Field(None, max_length=300)
    appointment_date: Optional[date] = None
    appointment_time: Optional[time] = None
    duration_minutes: Optional[int] = Field(None, ge=5, le=480)
    notes: Optional[str] = Field(None, max_length=500)
    status: Optional[AppointmentStatus] = None

    model_config = ConfigDict(extra="forbid")


class AppointmentResponse(AppointmentBase):
    """Appointment returned from the API."""
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ── AI Feature Schemas ────────────────────────────────────────────────

class ChatRequest(BaseModel):
    """Chatbot conversation request."""
    message: str = Field(..., min_length=1, max_length=2000, examples=["What are the side effects of Metformin?"])
    conversation_history: List[Dict[str, str]] = Field(
        default_factory=list,
        description='Prior messages as [{"role": "user"|"assistant", "content": "..."}].',
    )
    health_context: Optional[Dict[str, Any]] = Field(
        None,
        description="Optional snapshot of the user's current medications, vitals, etc.",
    )


class ChatResponse(BaseModel):
    """Non-streaming chatbot response."""
    reply: str
    disclaimer: str = "This is AI-generated health information and not a substitute for professional medical advice."


class SymptomCheckerRequest(BaseModel):
    """Symptom checker input."""
    symptoms: List[str] = Field(
        ...,
        min_length=1,
        max_length=20,
        examples=[["headache", "fatigue", "nausea"]],
    )
    duration: Optional[str] = Field(None, examples=["3 days"])
    additional_context: Optional[str] = Field(None, max_length=1000)


class SymptomCheckerResult(BaseModel):
    """Structured AI assessment of symptoms."""
    severity: SymptomSeverity
    possible_causes: List[str]
    recommended_actions: List[str]
    should_seek_emergency: bool
    disclaimer: str = "This assessment is AI-generated and not a substitute for professional medical diagnosis."


class HealthInsightsRequest(BaseModel):
    """Request for AI-generated health insights."""
    patient_id: UUID
    vitals: Optional[List[Dict[str, Any]]] = None
    medications: Optional[List[Dict[str, Any]]] = None
    time_range_days: int = Field(default=7, ge=1, le=90)


class HealthInsightsResponse(BaseModel):
    """AI-generated summary of a patient's health status."""
    summary: str
    trends: List[str]
    alerts: List[str]
    recommendations: List[str]
    disclaimer: str = "These insights are AI-generated and should be reviewed by a healthcare professional."
