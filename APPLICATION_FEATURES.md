# Aegis Link — Comprehensive Application Features & System Specification 🛡️

> **Aegis Link** is an enterprise-grade, intelligent healthcare and family wellness platform engineered to bridge patients, physicians, professional caregivers, and family members. It combines real-time vital telemetry, clinical decision support, fine-grained access consent, encrypted medical vaults, and an AI-powered clinical assistant.

---

## 📑 Table of Contents
1. [System Architecture & Role Hierarchy](#1-system-architecture--role-hierarchy)
2. [Patient Portal Features](#2-patient-portal-features)
3. [Doctor / Physician Portal Features](#3-doctor--physician-portal-features)
4. [Caregiver / Caretaker Portal Features](#4-caregiver--caretaker-portal-features)
5. [Family Portal Features](#5-family-portal-features)
6. [Artificial Intelligence & Clinical Intelligence Engine](#6-artificial-intelligence--clinical-intelligence-engine)
7. [Security, Privacy & Consent Architecture](#7-security-privacy--consent-architecture)
8. [Real-Time Alerts, Telemetry & WebSocket Engine](#8-real-time-alerts-telemetry--websocket-engine)
9. [Database Schema & Entity Relationship](#9-database-schema--entity-relationship)
10. [UML & Formal Specification Compliance Matrix](#10-uml--formal-specification-compliance-matrix)
11. [API Endpoints Summary](#11-api-endpoints-summary)

---

## 1. System Architecture & Role Hierarchy

Aegis Link enforces a strict **Role-Based Access Control (RBAC)** model structured around four specialized clinical and personal actors (derived from the *EXP5 UML Class Hierarchy*):

```
                        ┌────────────────────────┐
                        │      User (Base)       │
                        │ id, name, email, role  │
                        │ phone, is_active, auth │
                        └───────────┬────────────┘
         ┌──────────────────┬───────┴────────────┬──────────────────┐
         ▼                  ▼                    ▼                  ▼
┌────────────────┐ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐
│    Patient     │ │     Doctor     │ │   Caregiver    │ │ Family Member  │
│ blood_group    │ │ specialization │ │ shift_timing   │ │ relation_to_   │
│ dob, gender    │ │ license_no     │ │ assigned_ward  │ │   patient      │
│ emergency_pins │ │ hospital_affil │ │ certification  │ │ alerts_enabled │
└────────────────┘ └────────────────┘ └────────────────┘ └────────────────┘
```

---

## 2. Patient Portal Features

### 2.1 Vital Signs Monitoring & Live Telemetry
- **Multi-Metric Tracking**: Real-time logging of six core physiological indicators:
  - **Heart Rate** (`bpm`)
  - **Blood Pressure** (`Systolic/Diastolic mmHg`)
  - **Blood Glucose** (`mg/dL`, fasting & postprandial)
  - **Blood Oxygen Saturation** (`SpO2 %`)
  - **Body Temperature** (`°F / °C`)
  - **Body Weight** (`kg / lbs`)
- **Visual Analytics**: Interactive timeline charts displaying historical trends, daily/weekly averages, and target healthy reference ranges.
- **Anomaly Detection & Boundary Integrity (TC_03 & TC_04)**: Automatic detection of abnormal biometric values (e.g., Systolic > 140 mmHg, Heart Rate > 120 bpm, SpO2 < 92%) triggering instant visual badges and WebSocket emergency broadcast.

### 2.2 Medication Management & Adherence Tracker
- **Prescription Schedule**: Complete ledger of current medications with brand names, dosages, directions, and schedule intervals (`once_daily`, `twice_daily`, `three_times_daily`, `as_needed`).
- **One-Click Adherence Logging**: Patients can mark daily dosage slots as taken or missed, updating their adherence score in real time.
- **Time-Slot Reminders**: Time-based visual indicators highlighting upcoming and overdue medications.

### 2.3 Emergency SOS Broadcast (EXP6 Phase 3)
- **One-Click Emergency Trigger**: Prominent red SOS button accessible from every view.
- **Automated Dispatch**: Instantly aggregates current geolocation, latest vital sign values, active medication regimen, and broadcasts high-priority emergency alerts across WebSockets to linked caregivers, family members, and attending doctors.
- **Emergency Contacts Directory**: Management of primary and secondary emergency contacts with direct dial links.

### 2.4 Menstrual Health & Cycle Tracker (TC_05)
- **Gender-Adaptive UI**: In strict compliance with *EXP9 TC_05*, this module is conditionally rendered based on the profile gender (automatically hidden for male patient accounts).
- **Cycle Tracking**: Calculation of next predicted cycle start, ovulation window, and fertile days.
- **Symptom & Flow Logging**: Daily recording of flow intensity, pain scores, mood shifts, and physical symptoms.
- **Privacy Gating (EXP2 & EXP3)**: Menstrual log data is strictly protected under granular consent policies and cannot be viewed by doctors or caretakers without explicit opt-in permission.

### 2.5 Health Goals & Wellness Challenges
- **Personalized Goals**: Target tracking for daily steps, water intake (liters), sleep duration (hours), and active caloric expenditure.
- **Family Wellness Challenges**: Multi-member challenges (e.g., *10,000 Steps Daily*, *Hydration Hero*, *Mindful Sleep Week*) fostering collective adherence.
- **Rewards & Points Store**: Earning health loyalty points upon challenge completion, redeemable for pharmacy discounts, wellness coupons, and partner vouchers.

### 2.6 Encrypted Document Vault (EXP2 UC7)
- **Zero-Knowledge Architecture**: Upload, storage, and retrieval of clinical documents, discharge summaries, prescription scans, and lab reports.
- **AES-256 Encryption**: Files are encrypted at rest using Fernet symmetric encryption keys.
- **Granular Share Access**: Patients can grant or revoke temporary access tokens to doctors or caregivers for specific files.

### 2.7 Telemedicine & Telepharmacy
- **Virtual Consultations**: WebRTC-ready video/audio interface for remote clinical appointments with screen sharing and in-session notes.
- **Telepharmacy Prescription Refills**: Digital requests for medication refills directly routed to licensed partner pharmacies.

---

## 3. Doctor / Physician Portal Features

### 3.1 Patient Census & Clinical Roster
- **Assigned Patient Roster**: Filterable directory of all patients under active medical care.
- **At-a-Glance Triage Status**: Color-coded risk indicators reflecting vital anomalies, missed critical medications, and recent emergency alerts.

### 3.2 Granular Access Consent Verification (EXP6 Phase 2)
- **Mandatory Consent Gate**: In strict compliance with *EXP6 BCE Sequence Diagram Phase 2*, physicians cannot inspect diagnostic data, detailed vitals, or lab records without verified active consent (`/api/consent/check`).
- **Authorization Flow**: If consent has not been granted by the patient, the portal enforces an access gate with a simulated authorization request mechanism.

### 3.3 Clinical Treatment & Dietary Plans (EXP3 UC8)
- **Comprehensive Plan Authoring**: Physicians create, update, and manage formal medical treatment plans:
  - Primary Diagnosis & Clinical Impressions (ICD-ready descriptions)
  - Detailed Clinical Treatment Directives & Therapy Goals
  - Dietary & Lifestyle Guidelines (e.g., DASH Diet, Low-Sodium, Renal Nutrition)
  - Associated Prescription List
- **Status Management**: Plans can be transitioned between `active`, `completed`, and `archived` states.
- **Audit Logging**: Every plan creation or alteration automatically creates an immutable audit entry (`TREATMENT_ADJUSTMENT`).

### 3.4 Direct Prescription Management
- **Prescription Modal**: Write and issue prescriptions directly into the patient's schedule.
- **Dosage Specification**: Sets frequency, exact dosage units, start and end dates, and special consumption notes.
- **Compliance Audit**: Writes an append-only audit trail record (`PRESCRIBE_MEDICATION`) recording the doctor's actor ID, patient ID, and drug parameters.

### 3.5 Encrypted Diagnostic & Lab Results Review (EXP2 UC6 & UC9)
- **Panel Categories**: Complete review interface for clinical panels:
  - Complete Blood Count (CBC)
  - Comprehensive Metabolic Panel (CMP)
  - Lipid Panel
  - Urinalysis & Cardiac Biomarkers
- **Status Classification**: Badges for `normal`, `borderline`, `abnormal`, and `critical` results.
- **Cryptographic Transparency**: Visual badge displaying the AES-256 decryption validation status.

---

## 4. Caregiver / Caretaker Portal Features

### 4.1 Real-Time Patient Monitoring Dashboard
- **Caregiver Patient Census**: Multi-patient card grid displaying active vitals, recent activities, and pending care needs.
- **True Mathematical Adherence**: Adherence percentage dynamically calculated from scheduled vs. administered medications (`medications.filter(m => m.taken_today)`).
- **Real-Time Alert Triage**: Immediate audio-visual alerts received over WebSockets for missed doses, critical vitals, or SOS triggers.

### 4.2 On-Site Patient Check-In & Visit Logging (EXP2 UC11)
- **Check-In Modal**: Caregivers log official home visits and facility rounds:
  - Visit Type (`routine_check`, `medication_administration`, `vital_monitoring`, `emergency_response`)
  - Clinician Clinical Notes & Observations
  - Point-of-Care Vitals (Blood Pressure, Heart Rate, Glucose)
  - Medications Administered during the visit
- **API Persistence**: Submits directly to `/api/checkins/` with automatic caregiver identity tagging.

### 4.3 Medication Dosage Adjustment with Clinical Audit Trail (EXP9 TC_06)
- **Dosage Modification Interface**: Caregivers can update patient medication dosages and administration schedules per doctor verbal orders or clinical protocol.
- **Mandatory Justification**: Requires a documented clinical rationale before submission.
- **Regulatory Audit Trail**: Generates an immutable `MEDICATION_DOSAGE_UPDATE` audit log storing old vs. new dosage, timestamp, caregiver ID, and clinical reason.

### 4.4 Caregiver Activity Logs Timeline (EXP2 UC12)
- **Chronological Audit Feed**: Unified timeline view displaying every visit, vital check, medication administered, and care task completed by attending staff.
- **Filter by Patient**: Enables retrospective auditing during clinical handovers.

### 4.5 Care Tasks Management
- **Task Scheduling**: Create, assign, prioritize (`low`, `normal`, `high`, `emergency`), and schedule daily care activities.
- **Interactive Completion**: Toggle tasks completed with immediate backend synchronization (`/api/tasks/`).

---

## 5. Family Portal Features

### 5.1 Family Health Aggregation Dashboard
- **Multi-Member Overview**: Consolidated dashboard tracking all connected family members (children, parents, grandparents).
- **Comparative Metrics**: Visual charts comparing medication adherence and challenge participation across family members.

### 5.2 Caregiver Oversight & Visit Visibility (EXP2 UC12)
- **Reassurance Feed**: Family members can view caregiver check-in timestamps, observed vitals, and visit notes to verify their loved ones are receiving proper care.
- **Transparency Without Breach**: Provides vital peace-of-mind updates while respecting sensitive diagnostic privacy restrictions.

### 5.3 Family Wellness Competitions
- **Leaderboards**: Family step counts, hydration goals, and shared wellness points.
- **Collaborative Rewards**: Pooling family reward points for collective wellness purchases.

---

## 6. Artificial Intelligence & Clinical Intelligence Engine

### 6.1 Aegis Health Assistant (LLM-Powered Chatbot)
- **Engine Architecture**: Powered by Groq's high-speed Llama-3 model (`llama-3.3-70b-versatile` / `llama-3.1-8b-instant`) with automatic fallback to an embedded clinical reasoning engine.
- **Live Clinical Context Injection**: Every user prompt automatically injects a structured health snapshot:
  ```json
  {
    "role": "patient",
    "age": 68,
    "gender": "male",
    "vitals": [{"type": "blood_pressure", "value": "138/88"}, {"type": "heart_rate", "value": 78}],
    "medications": ["Amlodipine 5mg", "Metformin 500mg"],
    "upcoming_appointments": [{"doctor": "Dr. Sarah Jenkins", "date": "2026-10-22"}]
  }
  ```
- **Contextual Clinical Fallback Engine**: If the remote LLM endpoint is unreachable, an intelligent clinical rules engine analyzes queries for:
  - *Emergency & Red-Flag Triage* (chest pain, stroke symptoms, acute dyspnea)
  - *Hypertension & Vitals Analysis* (DASH diet, monitoring frequency)
  - *Medication Precautions & Interactions*
- **Clinical Action Chips**: Fast 1-click prompts for vitals analysis, medication interactions, dietary advice, and triage guidelines.
- **Markdown & Code Rendering**: Clean tabular and bulleted medical explanations with one-click copy and medical disclaimer compliance.

### 6.2 AI Symptom Checker (EXP2 UC5)
- **Multi-Step Diagnostic Wizard**:
  1. *Symptom Input*: Natural language symptom tags with auto-suggest.
  2. *Severity Step*: Pain scales (1–10) and functional impairment scoring.
  3. *Duration Step*: Acute vs. sub-acute vs. chronic duration categorization.
  4. *Analysis Result*: Structured AI triage report:
     - Triage Severity Level (`low`, `moderate`, `high`, `emergency`)
     - Differential Diagnostic Considerations
     - Recommended Action Steps
     - Emergency Department Flag (`should_seek_emergency: boolean`)

### 6.3 Predictive Health Insights & Risk Stratification
- **Trend Forecasting**: Rolling 7-to-30 day regression analysis across vitals telemetry.
- **Risk Score Output**: Computes categorical health risk scores (`low`, `moderate`, `high`) with clinical explanation and preventive recommendations.
- **Endpoint Parity**: Dual compatibility supporting both `/api/ai/health-insights` and `/api/ai/insights`.

---

## 7. Security, Privacy & Consent Architecture

### 7.1 Authentication & Session Management
- **JWT Bearer Authentication**: Industry-standard cryptographic token authentication (`/api/auth/login`, `/api/auth/refresh`).
- **Inactivity Idle Timer**: Configurable client-side timer (`useIdleTimer`) displaying a 60-second warning countdown modal before securely terminating inactive sessions to safeguard PHI (Protected Health Information).

### 7.2 Granular Access Consent Management (EXP2 & EXP3)
- **Fine-Grained Scopes**: Patients exercise sovereign control over health data access via explicit scopes:
  - `vitals`: Physiological telemetry logs
  - `documents`: Diagnostic vaults and lab files
  - `menstrual_data`: Menstrual logs and symptoms (strictly blocked by default)
  - `all`: Comprehensive clinical access
- **Temporal Validity**: Granular consents include expiration timestamps and instant revocation (`POST /api/consent/revoke`).
- **Consent Gate Verification**: All doctor data routes evaluate active consent before returning protected records.

### 7.3 Cryptographic Document Security (EXP2 UC7)
- **AES-256 Symmetric Encryption**: Clinical records and lab files are encrypted using master cryptographic keys.
- **HMAC Tamper Detection**: File hashes verify document integrity upon decryption.

### 7.4 Immutable Clinical Audit Trail (EXP6 Phase 4 & EXP9 TC_06)
- **Append-Only Ledger**: High-impact clinical and access events are immutably logged in the `audit_logs` table:
  - `LOGIN`, `LOGOUT`, `TOKEN_REFRESH`
  - `MEDICATION_DOSAGE_UPDATE`
  - `PRESCRIBE_MEDICATION`
  - `TREATMENT_ADJUSTMENT`
  - `CONSENT_GRANT`, `CONSENT_REVOKE`
  - `EMERGENCY_BROADCAST`
- **Metadata Fingerprinting**: Every log records `actor_id`, `action`, `target_type`, `target_id`, `client_ip`, and detailed JSON metadata.

---

## 8. Real-Time Alerts, Telemetry & WebSocket Engine

### 8.1 WebSocket Alert Engine (`/ws/alerts/{client_id}`)
- **Persistent Bi-Directional Channel**: Real-time communication bridge between frontend clients and the FastAPI backend.
- **Broadcast Channels**:
  - `emergency`: Immediate SOS alerts across all care team members.
  - `vital_alert`: Biometric boundary threshold violations.
  - `medication_reminder`: Scheduled dosing notifications.
  - `task_assignment`: Care task assignment to caretakers.
- **Auto-Reconnection**: Resilient client hook (`useAlertSocket`) with exponential backoff reconnection.

---

## 9. Database Schema & Entity Relationship

The database schema is organized across 13 core relational tables:

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│      users      │1─────*│    medications  │       │     vitals      │
│  (Supabase Auth)│       │  (Schedules)    │       │  (Telemetry)    │
└────────┬────────┘       └─────────────────┘       └─────────────────┘
         │
         ├───────────────*┌─────────────────┐       ┌─────────────────┐
         │1               │  appointments   │       │    documents    │
         │                │  (Visits)       │       │  (AES Encrypted)│
         │                └─────────────────┘       └─────────────────┘
         ├───────────────*┌─────────────────┐
         │1               │    consents     │
         │                │(Granular Scopes)│
         │                └─────────────────┘
         ├───────────────*┌─────────────────┐       ┌─────────────────┐
         │1               │   audit_logs    │       │ menstrual_logs  │
         │                │  (Append-Only)  │       │  (Cycle data)   │
         │                └─────────────────┘       └─────────────────┘
         │
         ├───────────────*┌────────────────────┐
         │1               │caregiver_checkins  │ (UML UC11, UC12)
         │                └────────────────────┘
         ├───────────────*┌────────────────────┐
         │1               │  treatment_plans   │ (UML UC8)
         │                └────────────────────┘
         ├───────────────*┌────────────────────┐
         │1               │    lab_results     │ (UML UC6, UC9)
         │                └────────────────────┘
         └───────────────*┌────────────────────┐
                          │     care_tasks     │ (UML EXP5)
                          └────────────────────┘
```

---

## 10. UML & Formal Specification Compliance Matrix

| Experiment / Spec | Formal Use Case / Diagram | Implemented Feature in Aegis Link | Code Reference |
| :--- | :--- | :--- | :--- |
| **EXP2 & EXP3** | UC1: User Registration & RBAC | Multi-role registration & JWT Auth | `backend/app/api/routes/users.py` |
| **EXP2 & EXP3** | UC2: Vitals Telemetry Tracking | 6-metric logger, graphs & anomaly flags | `src/features/vitals/VitalManager.tsx` |
| **EXP2 & EXP3** | UC3: Medication Scheduling | Prescriptions, daily adherence, time slots | `src/features/medications/MedicationManager.tsx` |
| **EXP2 & EXP3** | UC4: Emergency SOS Alert | Multi-channel broadcast & GPS dispatch | `src/features/emergency/EmergencyContactsManager.tsx` |
| **EXP2 & EXP3** | UC5: AI Symptom Checker | 4-step severity and triage wizard | `src/features/symptom-checker/AISymptomChecker.tsx` |
| **EXP2 & EXP3** | UC6: Diagnostic & Lab Viewing | Encrypted lab panel viewer with status badges | `src/pages/DoctorDashboard/modals/LabResultsModal.tsx` |
| **EXP2 & EXP3** | UC7: Encrypted Health Vault | AES-256 encrypted storage & retrieval | `backend/app/api/routes/documents.py` |
| **EXP3** | UC8: Clinical Treatment Plans | Doctor diagnosis, DASH diet, prescriptions | `src/pages/DoctorDashboard/modals/CreatePlanModal.tsx` |
| **EXP2 & EXP3** | UC9: Medical Lab Order & Result | Lab panels, abnormal flags, decryption | `backend/app/api/routes/lab_results.py` |
| **EXP2 & EXP3** | UC10: Telemedicine Video Session | WebRTC virtual room & clinical notes | `src/features/telemedicine/TelemedicineModal.tsx` |
| **EXP2 & EXP3** | UC11: Caretaker Visit Logging | Check-in modal: notes, vitals, meds | `src/pages/CaregiverDashboard/modals/LogCheckInModal.tsx` |
| **EXP2 & EXP3** | UC12: Caregiver Activity Timeline | Chronological care audit timeline for family | `src/pages/CaregiverDashboard/tabs/CaregiverLogsTab.tsx` |
| **EXP2 & EXP3** | UC13: Menstrual Health Tracking | Cycle prediction & symptom logger | `src/features/menstrual/MenstrualTracker.tsx` |
| **EXP3** | UC14: Wellness Challenges | Step & hydration challenges, points store | `src/features/wellness/EnhancedWellnessChallenges.tsx` |
| **EXP3** | UC15: Granular Consent Privacy | Scope-based grant/revoke (vitals, labs, cycle) | `backend/app/api/routes/consent.py` |
| **EXP3** | UC16: Clinical Audit Trail | Immutable audit logging of clinical events | `backend/app/api/routes/audit.py` |
| **EXP5** | Class Hierarchy | User, Patient, Doctor, Caretaker, Family | `backend/app/models/schemas.py` |
| **EXP6** | Phase 1: Authentication & Assign | Role-based login and doctor/caregiver linking | `backend/app/api/routes/users.py` |
| **EXP6** | Phase 2: Consent Verification | Pre-access consent check before record review | `src/pages/DoctorDashboard/index.tsx` |
| **EXP6** | Phase 3: Emergency Broadcast | Anomaly detection & WebSocket broadcast | `backend/app/services/websocket_manager.py` |
| **EXP6** | Phase 4: Caregiver Intervention | Dosage update, treatment adjustment & audit | `backend/app/services/supabase_client.py` |
| **EXP9** | TC_03: Vitals Boundary Integrity | Physiological threshold validation | `src/hooks/useLiveVitals.ts` |
| **EXP9** | TC_04: Anomaly Detection Trigger | Real-time red flag generation on extreme vitals | `backend/app/services/anomaly_service.py` |
| **EXP9** | TC_05: Gender-Specific UI Gating | Menstrual tracker hidden for male profiles | `src/components/layout/AppShell.tsx` |
| **EXP9** | TC_06: Caretaker Dosage Adjustment | Dosage update with reason and audit log | `src/pages/CaregiverDashboard/modals/ManagePatientMedsModal.tsx` |

---

## 11. API Endpoints Summary

The FastAPI backend exposes **62 production endpoints** grouped into modular routers:

### Authentication & Users (`/api/auth` & `/api/users`)
- `POST /api/auth/register` — Account creation with role-specific attributes
- `POST /api/auth/login` — OAuth2 Password Request Form token generation
- `POST /api/auth/refresh` — Refresh access token
- `GET  /api/auth/me` — Retrieve active authenticated user profile
- `GET  /api/users/` — List users (filterable by role)
- `POST /api/users/link` — Link patient to doctor or caregiver

### Vitals Telemetry (`/api/vitals`)
- `POST /api/vitals/` — Record new vital sign measurement
- `GET  /api/vitals/` — List vitals for authenticated patient
- `GET  /api/vitals/patient/{patient_id}` — Clinician retrieval of patient vitals (consent-checked)
- `GET  /api/vitals/summary` — Aggregate daily/weekly averages and ranges

### Medications (`/api/medications`)
- `POST /api/medications/` — Patient self-registration of medication
- `GET  /api/medications/` — List patient's medications
- `PUT  /api/medications/{id}` — Patient schedule adjustment
- `DELETE /api/medications/{id}` — Discontinue medication
- `GET  /api/medications/patient/{patient_id}` — Clinician medication review
- `PUT  /api/medications/patient/{patient_id}/{medication_id}` — Caretaker/Doctor dosage adjustment with audit logging (TC_06)
- `POST /api/medications/patient/{patient_id}` — Doctor prescription issuance with audit logging

### Caregiver Check-Ins & Logs (`/api/checkins`)
- `POST /api/checkins/` — Caregiver logs patient visit, notes, vitals, and meds (UC11)
- `GET  /api/checkins/patient/{patient_id}` — Retrieve visit history and care timeline (UC12)

### Treatment Plans (`/api/treatment-plans`)
- `POST /api/treatment-plans/` — Doctor authors clinical treatment plan (UC8)
- `GET  /api/treatment-plans/patient/{patient_id}` — Retrieve patient treatment plans
- `PUT  /api/treatment-plans/{plan_id}` — Update treatment plan status or directions

### Lab Results (`/api/lab-results`)
- `GET  /api/lab-results/patient/{patient_id}` — Consent-gated diagnostic lab review (UC6, UC9)
- `POST /api/lab-results/` — Record new laboratory panel result

### Care Tasks (`/api/tasks`)
- `GET    /api/tasks/` — List daily care tasks for patient or caregiver
- `POST   /api/tasks/` — Create new care task with priority and due time
- `PATCH  /api/tasks/{task_id}` — Toggle task completion status
- `DELETE /api/tasks/{task_id}` — Remove care task

### Artificial Intelligence (`/api/ai`)
- `POST /api/ai/chat` — Conversational clinical assistant with live health context
- `POST /api/ai/symptom-checker` — Multi-step AI symptom assessment & triage
- `POST /api/ai/health-insights` — Longitudinal vitals and adherence trend analysis
- `POST /api/ai/insights` — Compatibility endpoint for frontend insights client

### Document Vault (`/api/documents`)
- `POST /api/documents/upload` — Encrypted upload of medical files (AES-256)
- `GET  /api/documents/` — List encrypted documents
- `GET  /api/documents/{id}/download` — Decrypt and download medical file

### Consent Governance (`/api/consent`)
- `POST /api/consent/grant` — Patient grants granular scope permission
- `POST /api/consent/revoke` — Patient revokes access permission
- `GET  /api/consent/check` — Verify whether doctor/caregiver has active permission

### Regulatory Audit Trail (`/api/audit`)
- `GET /api/audit/logs` — Query append-only audit logs with filters and pagination

### Real-Time WebSocket (`/ws`)
- `WebSocket /ws/alerts/{client_id}` — Bi-directional real-time alert and telemetry stream
