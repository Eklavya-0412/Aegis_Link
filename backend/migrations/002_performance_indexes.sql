-- Aegis Link Task 5 Database Migration: Performance Indexes for Non-Search Reads
-- Target: Enforce sub-second (<1s) query performance at 10,000+ row scale

-- 1. Vitals History Index (user_id + recorded_at DESC)
CREATE INDEX IF NOT EXISTS idx_vitals_user_id_recorded_at 
ON vitals(user_id, recorded_at DESC);

-- 2. Active Medications Index (user_id + is_active + created_at DESC)
CREATE INDEX IF NOT EXISTS idx_medications_user_id_active 
ON medications(user_id, is_active, created_at DESC);

-- 3. Appointments Dashboard Index (user_id + status + appointment_date)
CREATE INDEX IF NOT EXISTS idx_appointments_user_id_status 
ON appointments(user_id, status, appointment_date);

-- 4. Documents Vault Index (patient_id + uploaded_at DESC)
CREATE INDEX IF NOT EXISTS idx_documents_patient_id 
ON documents(patient_id, uploaded_at DESC);

-- 5. Access Consents Active Index (patient_id + grantee_id)
CREATE INDEX IF NOT EXISTS idx_consents_patient_grantee 
ON consents(patient_id, grantee_id) 
WHERE revoked_at IS NULL;

-- 6. Audit Logs Indexes (actor_id + target_id + created_at DESC)
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id 
ON audit_logs(actor_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_target_id 
ON audit_logs(target_id, created_at DESC);

-- 7. Menstrual Logs Index (patient_id + start_date DESC)
CREATE INDEX IF NOT EXISTS idx_menstrual_logs_patient_id 
ON menstrual_logs(patient_id, start_date DESC);
