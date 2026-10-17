"""
seed_comprehensive.py – Aegis Link Database Seeder
===========================================================
Populates the Supabase database with a rich, realistic set of sample data:
  • 2 Patients, 2 Caregivers, 1 Doctor (with Auth accounts + profiles)
  • Caregiver ↔ Patient relationships
  • 15-20 rows of time-series vitals per patient (past 7 days)
  • 3-5 medications per patient
  • Past + upcoming appointments linking patients to the doctor
  • 6-7 Care Tasks per patient for caregivers

Usage (run from backend/ directory):
    python seed_comprehensive.py

Requirements:
    pip install supabase python-dotenv
"""

from __future__ import annotations

import os
import random
import sys
import uuid

# Ensure Windows terminal doesn't crash on unicode / emojis
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass
from datetime import date, datetime, timedelta, timezone
from typing import Any, Dict, List

from dotenv import load_dotenv

# Load backend .env (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

try:
    from supabase import create_client, Client
except ImportError:
    print("❌  supabase-py is not installed. Run:  pip install supabase python-dotenv")
    sys.exit(1)

# ── Config ─────────────────────────────────────────────────────────────
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    print("❌  Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env")
    sys.exit(1)

DEFAULT_PASSWORD = "AegisLink2026!"

# ── Client ─────────────────────────────────────────────────────────────
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)


# ═══════════════════════════════════════════════════════════════════════
# HELPERS
# ═══════════════════════════════════════════════════════════════════════

def _upsert_auth_user(email: str, password: str, role: str, name: str) -> str:
    """Create a Supabase Auth user (admin API) with deterministic UUID fallback."""
    print(f"  → Creating auth user: {email} [{role}] ...", end=" ")
    try:
        resp = supabase.auth.admin.create_user(
            {
                "email": email,
                "password": password,
                "email_confirm": True,
                "app_metadata": {"role": role},
                "user_metadata": {"full_name": name},
            }
        )
        uid = resp.user.id
        print(f"✅  {uid}")
        return uid
    except Exception as exc:
        msg = str(exc)
        if "already" in msg.lower() or "duplicate" in msg.lower():
            print("⚠️  already exists – fetching ID ...", end=" ")
            try:
                listed = supabase.auth.admin.list_users()
                for u in listed:
                    if hasattr(u, "email") and u.email == email:
                        print(f"✅  {u.id}")
                        return u.id
            except Exception:
                pass
        
        # Fallback to deterministic UUID (matches backend/app/api/routes/users.py)
        fallback_uid = str(uuid.uuid5(uuid.NAMESPACE_URL, email))
        print(f"⚠️  Auth API note ({msg[:50]}…) → Using deterministic UUID ✅  {fallback_uid}")
        return fallback_uid


def _upsert_profile(uid: str, email: str, role: str, name: str,
                    phone: str, dob: str, blood_group: str, gender: str) -> None:
    """Insert / update a row in the public `users` and `profiles` tables."""
    now_iso = datetime.now(timezone.utc).isoformat()
    user_row = {
        "id": uid,
        "full_name": name,
        "email": email,
        "role": role,
        "phone": phone,
        "gender": gender,
        "disease": "Hypertension / Type 2 Diabetes" if role == "patient" else None,
        "qualifications": "MD, Internal Medicine" if role == "doctor" else ("Certified Care Specialist" if role == "caregiver" else None),
        "points": 100,
        "created_at": now_iso,
    }
    
    # 1. Update public.users
    try:
        supabase.table("users").upsert(user_row, on_conflict="id").execute()
    except Exception as e:
        print(f"    ⚠️ users upsert note: {e}")

    # 2. Update public.profiles
    try:
        profile_row = {
            "id": uid,
            "full_name": name,
            "email": email,
            "role": role,
            "phone": phone,
            "gender": gender,
            "created_at": now_iso,
        }
        supabase.table("profiles").upsert(profile_row, on_conflict="id").execute()
    except Exception as e:
        pass


def _link(patient_id: str, caregiver_id: str) -> None:
    """Insert a patient↔caregiver link in patient_caregiver and caregiver_patient_links."""
    for tbl in ["patient_caregiver", "caregiver_patient_links"]:
        try:
            supabase.table(tbl).upsert(
                {"patient_id": patient_id, "caregiver_id": caregiver_id, "status": "active"},
            ).execute()
        except Exception:
            pass
    print(f"  🔗 Linked patient {patient_id[:8]}… ↔ caregiver {caregiver_id[:8]}…")


def _rand_ts(days_ago: float, hour_jitter: int = 4) -> str:
    """Return an ISO-8601 UTC timestamp `days_ago` days in the past, ± jitter."""
    base = datetime.now(timezone.utc) - timedelta(days=days_ago)
    base = base.replace(
        hour=random.randint(6, 22),
        minute=random.randint(0, 59),
        second=0,
        microsecond=0,
    )
    return base.isoformat()


# ═══════════════════════════════════════════════════════════════════════
# USER DEFINITIONS
# ═══════════════════════════════════════════════════════════════════════

USERS: List[Dict[str, Any]] = [
    # Patients
    {
        "email": "priya.patient@aegislink.demo",
        "role": "patient",
        "name": "Priya Sharma",
        "phone": "+91-98765-43210",
        "dob": "1990-06-15",
        "blood": "B+",
        "gender": "female",
    },
    {
        "email": "arjun.patient@aegislink.demo",
        "role": "patient",
        "name": "Arjun Mehta",
        "phone": "+91-87654-32109",
        "dob": "1978-11-02",
        "blood": "O+",
        "gender": "male",
    },
    # Caregivers
    {
        "email": "sunita.caregiver@aegislink.demo",
        "role": "caregiver",
        "name": "Sunita Kapoor",
        "phone": "+91-76543-21098",
        "dob": "1965-03-22",
        "blood": "A-",
        "gender": "female",
    },
    {
        "email": "ravi.caregiver@aegislink.demo",
        "role": "caregiver",
        "name": "Ravi Kumar",
        "phone": "+91-65432-10987",
        "dob": "1970-08-10",
        "blood": "AB+",
        "gender": "male",
    },
    # Doctor
    {
        "email": "dr.ananya@aegislink.demo",
        "role": "doctor",
        "name": "Dr. Ananya Iyer",
        "phone": "+91-54321-09876",
        "dob": "1982-01-30",
        "blood": "O-",
        "gender": "female",
    },
]


# ═══════════════════════════════════════════════════════════════════════
# VITAL DEFINITIONS
# ═══════════════════════════════════════════════════════════════════════

def _vitals_for_patient(uid: str, gender: str) -> List[Dict[str, Any]]:
    """Generate 18-20 realistic vital readings spanning the last 7 days."""
    rows: List[Dict[str, Any]] = []

    # Heart Rate – 6 readings over 7 days
    for i in range(6):
        hr = 68 + random.randint(-8, 12)
        rows.append({
            "id": str(uuid.uuid4()),
            "patient_id": uid,
            "user_id": uid,
            "vital_type": "heart_rate",
            "value": str(hr),
            "heart_rate": hr,
            "unit": "bpm",
            "recorded_at": _rand_ts(i * 1.1 + 0.2),
        })

    # Blood Pressure – Systolic (6 readings)
    for i in range(6):
        systolic = 118 + random.randint(-10, 18)
        rows.append({
            "id": str(uuid.uuid4()),
            "patient_id": uid,
            "user_id": uid,
            "vital_type": "blood_pressure_systolic",
            "value": str(systolic),
            "blood_pressure": f"{systolic}/80",
            "unit": "mmHg",
            "recorded_at": _rand_ts(i * 1.1 + 0.5),
        })

    # Blood Pressure – Diastolic (4 readings)
    for i in range(4):
        diastolic = 76 + random.randint(-6, 10)
        rows.append({
            "id": str(uuid.uuid4()),
            "patient_id": uid,
            "user_id": uid,
            "vital_type": "blood_pressure_diastolic",
            "value": str(diastolic),
            "blood_pressure": f"120/{diastolic}",
            "unit": "mmHg",
            "recorded_at": _rand_ts(i * 1.6 + 0.3),
        })

    # Blood Glucose – 4 readings
    for i in range(4):
        glucose = 92 + random.randint(-10, 25)
        rows.append({
            "id": str(uuid.uuid4()),
            "patient_id": uid,
            "user_id": uid,
            "vital_type": "blood_glucose",
            "value": str(glucose),
            "glucose_level": float(glucose),
            "unit": "mg/dL",
            "recorded_at": _rand_ts(i * 1.8 + 0.1),
        })

    return rows


# ═══════════════════════════════════════════════════════════════════════
# MEDICATION DEFINITIONS
# ═══════════════════════════════════════════════════════════════════════

MEDICATION_SETS: List[List[Dict[str, Any]]] = [
    # Set A – for patient 0 (Priya)
    [
        {
            "name": "Metformin",
            "dosage": "500 mg",
            "frequency": "twice_daily",
            "time_slots": ["08:00", "20:00"],
            "start_date": "2025-01-10",
            "is_active": True,
            "notes": "Take with meals",
        },
        {
            "name": "Lisinopril",
            "dosage": "10 mg",
            "frequency": "once_daily",
            "time_slots": ["07:00"],
            "start_date": "2024-11-01",
            "is_active": True,
            "notes": "Blood pressure management",
        },
        {
            "name": "Atorvastatin",
            "dosage": "20 mg",
            "frequency": "once_daily",
            "time_slots": ["21:00"],
            "start_date": "2025-03-15",
            "is_active": True,
            "notes": "Cholesterol management – take at night",
        },
        {
            "name": "Vitamin D3",
            "dosage": "1000 IU",
            "frequency": "once_daily",
            "time_slots": ["09:00"],
            "start_date": "2025-06-01",
            "is_active": True,
            "notes": None,
        },
        {
            "name": "Aspirin",
            "dosage": "75 mg",
            "frequency": "once_daily",
            "time_slots": ["08:00"],
            "start_date": "2024-09-01",
            "end_date": "2025-09-01",
            "is_active": False,
            "notes": "Course completed",
        },
    ],
    # Set B – for patient 1 (Arjun)
    [
        {
            "name": "Amlodipine",
            "dosage": "5 mg",
            "frequency": "once_daily",
            "time_slots": ["07:30"],
            "start_date": "2024-12-01",
            "is_active": True,
            "notes": "Calcium channel blocker for hypertension",
        },
        {
            "name": "Pantoprazole",
            "dosage": "40 mg",
            "frequency": "once_daily",
            "time_slots": ["06:30"],
            "start_date": "2025-04-10",
            "is_active": True,
            "notes": "Take 30 minutes before breakfast",
        },
        {
            "name": "Metoprolol",
            "dosage": "25 mg",
            "frequency": "twice_daily",
            "time_slots": ["08:00", "22:00"],
            "start_date": "2025-02-14",
            "is_active": True,
            "notes": "Beta-blocker – do not stop abruptly",
        },
        {
            "name": "Omega-3 Fish Oil",
            "dosage": "1000 mg",
            "frequency": "once_daily",
            "time_slots": ["13:00"],
            "start_date": "2025-07-01",
            "is_active": True,
            "notes": None,
        },
    ],
]


# ═══════════════════════════════════════════════════════════════════════
# APPOINTMENT DEFINITIONS
# ═══════════════════════════════════════════════════════════════════════

def _appointments_for_patient(uid: str, doctor_id: str, doctor_name: str) -> List[Dict]:
    today = date.today()
    return [
        # Past completed
        {
            "id": str(uuid.uuid4()),
            "patient_id": uid,
            "user_id": uid,
            "title": "Annual Health Checkup",
            "doctor_id": doctor_id,
            "doctor_name": doctor_name,
            "location": "Apollo Clinic, Sector 14",
            "appointment_date": f"{today - timedelta(days=30)}T10:00:00Z",
            "status": "completed",
            "notes": "Routine exam – all clear",
        },
        # Past completed
        {
            "id": str(uuid.uuid4()),
            "patient_id": uid,
            "user_id": uid,
            "title": "Blood Sugar Follow-up",
            "doctor_id": doctor_id,
            "doctor_name": doctor_name,
            "location": "Max Hospital, Online",
            "appointment_date": f"{today - timedelta(days=10)}T14:30:00Z",
            "status": "completed",
            "notes": "HbA1c results reviewed",
        },
        # Upcoming scheduled
        {
            "id": str(uuid.uuid4()),
            "patient_id": uid,
            "user_id": uid,
            "title": "Cardiology Consultation",
            "doctor_id": doctor_id,
            "doctor_name": doctor_name,
            "location": "Fortis Heart Institute",
            "appointment_date": f"{today + timedelta(days=7)}T11:00:00Z",
            "status": "scheduled",
            "notes": "Bring last 3 BP readings",
        },
        # Upcoming scheduled
        {
            "id": str(uuid.uuid4()),
            "patient_id": uid,
            "user_id": uid,
            "title": "Medication Review",
            "doctor_id": doctor_id,
            "doctor_name": doctor_name,
            "location": "Telehealth – Video Call",
            "appointment_date": f"{today + timedelta(days=21)}T16:00:00Z",
            "status": "scheduled",
            "notes": "Review Metformin dosage",
        },
    ]


# ═══════════════════════════════════════════════════════════════════════
# CARE TASKS DEFINITIONS
# ═══════════════════════════════════════════════════════════════════════

CARE_TASKS_SAMPLE = [
    ("Morning Blood Pressure Check", "Measure resting BP with digital cuff before breakfast.", "08:00:00", "vitals"),
    ("Post-Breakfast Medication Adherence", "Confirm Metformin 500mg taken with food.", "08:30:00", "medication"),
    ("Hydration & Nutrition Check", "Ensure patient drinks 500ml water and takes breakfast.", "10:30:00", "nutrition"),
    ("Midday Mobility Walk", "Assist patient with 15-minute gentle indoor walk.", "14:00:00", "mobility"),
    ("Evening Pre-Meal Glucose Check", "Log fasting glucose level using fingerstick meter.", "19:00:00", "vitals"),
    ("Night Medication & Relaxation", "Ensure Atorvastatin taken; verify CPAP device ready.", "21:30:00", "medication"),
]


# ═══════════════════════════════════════════════════════════════════════
# MAIN SEEDING LOGIC
# ═══════════════════════════════════════════════════════════════════════

def seed() -> None:
    print("\n" + "═" * 60)
    print("  Aegis Link – Comprehensive Database Seeder")
    print("═" * 60 + "\n")

    # ── Step 1: Create Auth users + profiles ──────────────────────────
    print("📋  Step 1: Creating users …\n")
    uid_map: Dict[str, str] = {}  # email → uuid

    for spec in USERS:
        uid = _upsert_auth_user(
            email=spec["email"],
            password=DEFAULT_PASSWORD,
            role=spec["role"],
            name=spec["name"],
        )
        uid_map[spec["email"]] = uid
        _upsert_profile(
            uid=uid,
            email=spec["email"],
            role=spec["role"],
            name=spec["name"],
            phone=spec["phone"],
            dob=spec["dob"],
            blood_group=spec["blood"],
            gender=spec.get("gender", "unknown")
        )

    patient_ids = [
        uid_map["priya.patient@aegislink.demo"],
        uid_map["arjun.patient@aegislink.demo"],
    ]
    caregiver_ids = [
        uid_map["sunita.caregiver@aegislink.demo"],
        uid_map["ravi.caregiver@aegislink.demo"],
    ]
    doctor_id = uid_map["dr.ananya@aegislink.demo"]
    doctor_name = "Dr. Ananya Iyer"

    print(f"\n  ✅  Created/verified {len(USERS)} users.\n")

    # ── Step 2: Caregiver ↔ Patient links ────────────────────────────
    print("🔗  Step 2: Linking caregivers ↔ patients …\n")
    # Sunita cares for both patients; Ravi cares for Arjun only
    _link(patient_ids[0], caregiver_ids[0])
    _link(patient_ids[1], caregiver_ids[0])
    _link(patient_ids[1], caregiver_ids[1])
    print()

    # ── Step 3: Care Tasks ───────────────────────────────────────────
    print("📋  Step 3: Seeding care tasks …\n")
    for pid in patient_ids:
        cg_id = caregiver_ids[0]
        task_rows = []
        for t_title, t_desc, t_time, t_cat in CARE_TASKS_SAMPLE:
            task_rows.append({
                "id": str(uuid.uuid4()),
                "patient_id": pid,
                "caregiver_id": cg_id,
                "title": t_title,
                "description": t_desc,
                "category": t_cat,
                "due_time": t_time,
                "is_completed": False,
                "created_at": datetime.now(timezone.utc).isoformat(),
            })
        try:
            supabase.table("care_tasks").upsert(task_rows, on_conflict="id").execute()
            print(f"  ✅  Patient {pid[:8]}…: {len(task_rows)} care tasks seeded.")
        except Exception as e:
            print(f"  ⚠️  Care tasks note: {e}")
    print()

    # ── Step 4: Vitals ───────────────────────────────────────────────
    print("📈  Step 4: Seeding vitals (18–20 readings per patient) …\n")
    for idx, pid in enumerate(patient_ids):
        gender = USERS[idx]["gender"]
        rows = _vitals_for_patient(pid, gender)
        try:
            supabase.table("vitals").upsert(rows, on_conflict="id").execute()
            count = len(rows)
            patient_name = USERS[idx]["name"]
            print(f"  ✅  {patient_name}: {count} vital readings seeded.")
        except Exception as e:
            # Fallback if user_id column doesn't exist yet in Supabase schema
            clean_rows = [{k: v for k, v in r.items() if k != "user_id"} for r in rows]
            try:
                supabase.table("vitals").upsert(clean_rows, on_conflict="id").execute()
                print(f"  ✅  {USERS[idx]['name']}: {len(clean_rows)} vital readings seeded (schema fallback).")
            except Exception as e2:
                print(f"  ❌  Failed seeding vitals for {USERS[idx]['name']}: {e2}")
    print()

    # ── Step 5: Medications ──────────────────────────────────────────
    print("💊  Step 5: Seeding medications …\n")
    for idx, pid in enumerate(patient_ids):
        med_rows = []
        for med in MEDICATION_SETS[idx]:
            sched = (med["time_slots"][0] + ":00") if med.get("time_slots") else "08:00:00"
            row = {
                "id": str(uuid.uuid4()),
                "patient_id": pid,
                "user_id": pid,
                "name": med["name"],
                "dosage": med["dosage"],
                "frequency": med["frequency"],
                "schedule": sched,
                "time_slots": med["time_slots"],
                "start_date": med["start_date"],
                "end_date": med.get("end_date"),
                "is_active": med["is_active"],
                "adherence_status": False,
                "notes": med.get("notes"),
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
            med_rows.append(row)
        try:
            supabase.table("medications").upsert(med_rows, on_conflict="id").execute()
            patient_name = USERS[idx]["name"]
            print(f"  ✅  {patient_name}: {len(med_rows)} medications seeded.")
        except Exception as exc:
            # Fallback if optional schema columns like time_slots are not yet created in Supabase
            try:
                minimal_rows = [
                    {
                        "id": r["id"],
                        "patient_id": r["patient_id"],
                        "name": r["name"],
                        "dosage": r["dosage"],
                        "schedule": r["schedule"],
                        "adherence_status": False,
                    }
                    for r in med_rows
                ]
                supabase.table("medications").upsert(minimal_rows, on_conflict="id").execute()
                print(f"  ✅  {USERS[idx]['name']}: {len(minimal_rows)} medications seeded (minimal schema).")
            except Exception as e2:
                print(f"  ❌  Failed seeding medications: {e2}")
    print()

    # ── Step 6: Appointments ─────────────────────────────────────────
    print("📅  Step 6: Seeding appointments …\n")
    for idx, pid in enumerate(patient_ids):
        appts = _appointments_for_patient(pid, doctor_id, doctor_name)
        try:
            supabase.table("appointments").upsert(appts, on_conflict="id").execute()
            patient_name = USERS[idx]["name"]
            print(f"  ✅  {patient_name}: {len(appts)} appointments seeded.")
        except Exception as exc:
            try:
                # Fallback if optional columns like doctor_name are missing
                minimal_appts = [
                    {
                        "id": a["id"],
                        "patient_id": a["patient_id"],
                        "doctor_id": a["doctor_id"],
                        "title": a["title"],
                        "appointment_date": a["appointment_date"],
                        "status": a["status"],
                    }
                    for a in appts
                ]
                supabase.table("appointments").upsert(minimal_appts, on_conflict="id").execute()
                print(f"  ✅  {USERS[idx]['name']}: {len(minimal_appts)} appointments seeded (minimal schema).")
            except Exception as e2:
                print(f"  ❌  Failed seeding appointments: {e2}")
    print()

    # ── Summary ──────────────────────────────────────────────────────
    print("═" * 60)
    print("  🎉  Seeding complete!\n")
    print("  Demo credentials (all users share the same password):")
    print(f"  Password: {DEFAULT_PASSWORD}\n")
    for spec in USERS:
        print(f"  [{spec['role']:9}]  {spec['email']}")
    print("\n  → Visit http://localhost:3000 and log in with any of the above.")
    print("═" * 60 + "\n")


if __name__ == "__main__":
    seed()
