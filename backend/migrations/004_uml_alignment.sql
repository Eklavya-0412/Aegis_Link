-- =====================================================================
-- Aegis Link: UML Alignment & Comprehensive Feature Expansion (004)
-- Aligns schema with UML Specifications (EXP2, EXP3, EXP4, EXP5, EXP6, EXP7, EXP9)
-- =====================================================================

-- 1. Extend Users and Profiles Tables with UML Attributes (EXP5 Class Diagram)
-- Patient: blood_group, dob
-- Doctor: specialization, license_no
-- Caretaker / Nurse: shift_timing, assigned_ward
-- Patient Family: relation_to_patient

ALTER TABLE IF EXISTS public.users ADD COLUMN IF NOT EXISTS blood_group TEXT;
ALTER TABLE IF EXISTS public.users ADD COLUMN IF NOT EXISTS dob DATE;
ALTER TABLE IF EXISTS public.users ADD COLUMN IF NOT EXISTS specialization TEXT;
ALTER TABLE IF EXISTS public.users ADD COLUMN IF NOT EXISTS license_no TEXT;
ALTER TABLE IF EXISTS public.users ADD COLUMN IF NOT EXISTS shift_timing TEXT;
ALTER TABLE IF EXISTS public.users ADD COLUMN IF NOT EXISTS assigned_ward TEXT;
ALTER TABLE IF EXISTS public.users ADD COLUMN IF NOT EXISTS relation_to_patient TEXT;

ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS blood_group TEXT;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS dob DATE;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS specialization TEXT;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS license_no TEXT;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS shift_timing TEXT;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS assigned_ward TEXT;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS relation_to_patient TEXT;

-- 2. Caregiver Check-Ins & Visit Notes (UC11: Log Check-Ins & Notes, UC12: View Oversight Logs)
CREATE TABLE IF NOT EXISTS public.caregiver_checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL,
    caregiver_id UUID NOT NULL,
    caregiver_name TEXT,
    visit_type TEXT DEFAULT 'routine_check', -- 'routine_check', 'medication_administration', 'vital_monitoring', 'emergency_response'
    notes TEXT NOT NULL,
    vitals_recorded JSONB DEFAULT '{}'::jsonb,
    medications_administered TEXT[] DEFAULT '{}',
    checkin_time TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_checkins_patient ON public.caregiver_checkins(patient_id, checkin_time DESC);
CREATE INDEX IF NOT EXISTS idx_checkins_caregiver ON public.caregiver_checkins(caregiver_id, checkin_time DESC);

-- 3. Clinical Treatment Plans & Diet Recommendations (UC8: Adjust Treatment & Diet Plans, EXP6)
CREATE TABLE IF NOT EXISTS public.treatment_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL,
    doctor_id UUID NOT NULL,
    doctor_name TEXT,
    title TEXT NOT NULL,
    diagnosis TEXT,
    plan_details TEXT NOT NULL,
    dietary_guidelines TEXT,
    prescriptions JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'active', -- 'active', 'completed', 'revised'
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_treatment_plans_patient ON public.treatment_plans(patient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_treatment_plans_doctor ON public.treatment_plans(doctor_id);

-- 4. Lab Results & Diagnostic Reports (UC6, UC9: Encrypted Lab Reports & Review)
CREATE TABLE IF NOT EXISTS public.lab_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL,
    patient_name TEXT,
    ordered_by UUID,
    doctor_name TEXT,
    test_name TEXT NOT NULL,
    category TEXT DEFAULT 'cbc', -- 'cbc', 'metabolic', 'lipid', 'urinalysis', 'cardiac'
    test_date TIMESTAMPTZ DEFAULT now(),
    panel_results JSONB NOT NULL DEFAULT '{}'::jsonb,
    overall_status TEXT DEFAULT 'normal', -- 'normal', 'borderline', 'abnormal', 'critical'
    notes TEXT,
    is_encrypted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lab_results_patient ON public.lab_results(patient_id, test_date DESC);

-- 5. Care Tasks (Ensuring all columns match UML and application requirements)
CREATE TABLE IF NOT EXISTS public.care_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL,
    caregiver_id UUID,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'general',
    due_time TIME,
    priority TEXT DEFAULT 'normal', -- 'low', 'normal', 'high', 'emergency'
    is_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE IF EXISTS public.care_tasks ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal';
ALTER TABLE IF EXISTS public.care_tasks ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_care_tasks_patient_created ON public.care_tasks(patient_id, created_at DESC);
