# Aegis Link 🛡️

**Intelligent Multi-Role Healthcare Management & Family Wellness System**

> For a complete, granular specification of all clinical capabilities, UML compliance, database models, and API endpoints, see the dedicated [APPLICATION_FEATURES.md](APPLICATION_FEATURES.md) document.

---

## 🌟 System Overview

Aegis Link connects patients, physicians, professional caregivers, and family members into a unified, secure care ecosystem. It features continuous vital telemetry, automated anomaly alerts, granular consent gating, AES-256 encrypted health document vaults, and an intelligent clinical assistant.

### 🎭 Core Roles & Capabilities

* **Patient Portal**:
  * Continuous multi-metric vital tracking (Heart Rate, Blood Pressure, Glucose, SpO2, Temperature, Weight) with anomaly flags.
  * Prescription adherence scheduler with time-slot tracking.
  * One-touch Emergency SOS dispatch with real-time GPS telemetry and WebSocket alerts.
  * Menstrual health tracking (cycle predictions, flow intensity, mood logs; gender-adaptive UI).
  * Encrypted Health Document Vault (AES-256) and granular consent permissions.
  * Health goals, wellness challenges, and rewards loyalty point redemption.

* **Doctor / Physician Portal**:
  * Assigned patient census and clinical roster.
  * **Granular Consent Verification Gate** (EXP6 Phase 2 compliance: restricts access to diagnostic data without active patient consent).
  * Clinical Treatment & Dietary Plan authoring (diagnoses, DASH/cardiac diet guidelines, prescriptions, audit trails).
  * Digital Prescription generation and encrypted laboratory review (CBC, metabolic, lipid panels).

* **Caregiver / Caretaker Portal**:
  * Real-time patient monitoring dashboard with true mathematical adherence tracking.
  * On-site patient check-in and visit logging (vitals, meds administered, clinician notes).
  * Medication dosage adjustments with mandatory clinical reason and regulatory audit trail (EXP9 TC_06).
  * Caregiver activity audit timeline and daily care task assignments.

* **Family Portal**:
  * Multi-member health tracking and wellness leaderboards.
  * Caregiver oversight and visit transparency feed (EXP2 UC12).
  * Instant emergency notifications and SOS response coordination.

* **AI Health Assistant & Clinical Intelligence Engine**:
  * Conversational AI companion powered by Groq LLM (`llama-3.3-70b-versatile`) with live patient clinical context injection.
  * Contextual clinical reasoning fallback engine for offline or rate-limited resilience.
  * 4-step AI Symptom Checker & Triage Wizard.
  * Longitudinal predictive health insights and risk level stratification.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Tailwind CSS, Lucide React, Zustand |
| **Backend API** | Python 3.12+, FastAPI, Pydantic v2, Uvicorn |
| **Database** | PostgreSQL / Supabase, SQL Migrations (`backend/migrations/`) |
| **AI & NLP** | Groq API (`llama-3.3-70b`, `llama-3.1-8b`), Intelligent Clinical Fallback Engine |
| **Security & Cryptography** | OAuth2 / JWT, Fernet AES-256 Encryption, Append-Only Audit Logging |
| **Real-Time** | WebSockets (`/ws/alerts`), Live Telemetry Streaming |

---

## 🚀 Quick Start

### 1. Unified Launch (Frontend + Backend)
Run the automated launcher script from the project root:
```bash
# Windows PowerShell
.\launch.ps1

# Or Windows Command Prompt / Batch
launch.bat
```

### 2. Manual Startup

#### Backend (FastAPI):
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
API Documentation will be live at `http://localhost:8000/docs`.

#### Frontend (React):
```bash
npm install
npm start
```
The application will open at `http://localhost:3000`.

---

## 📖 In-Depth Feature Documentation

For complete diagrams, UML compliance mapping (EXP2–EXP9), entity-relationship schemas, and full API route tables, refer to **[APPLICATION_FEATURES.md](APPLICATION_FEATURES.md)**.
