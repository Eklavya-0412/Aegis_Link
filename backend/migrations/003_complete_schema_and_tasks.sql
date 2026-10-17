-- =====================================================================
-- Aegis Link: Complete Database Schema Migration (003)
-- Run this in Supabase Dashboard -> SQL Editor -> Click 'Run'
-- =====================================================================

-- 1. Remove broken triggers on auth.users causing 'Database error creating new user'
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Also dynamically drop any other custom triggers attached to auth.users if they exist
DO $$ 
DECLARE 
    trg RECORD;
BEGIN 
    FOR trg IN 
        SELECT trigger_name 
        FROM information_schema.triggers 
        WHERE event_object_schema = 'auth' AND event_object_table = 'users'
    LOOP 
        EXECUTE 'DROP TRIGGER IF EXISTS ' || quote_ident(trg.trigger_name) || ' ON auth.users CASCADE;';
    END LOOP; 
END $$;

-- 2. Drop restrictive foreign keys so tables do not block seeding or inserts
ALTER TABLE IF EXISTS public.vitals DROP CONSTRAINT IF EXISTS vitals_patient_id_fkey;
ALTER TABLE IF EXISTS public.medications DROP CONSTRAINT IF EXISTS medications_patient_id_fkey;
ALTER TABLE IF EXISTS public.caregiver_patient_links DROP CONSTRAINT IF EXISTS caregiver_patient_links_patient_id_fkey;
ALTER TABLE IF EXISTS public.caregiver_patient_links DROP CONSTRAINT IF EXISTS caregiver_patient_links_caregiver_id_fkey;
ALTER TABLE IF EXISTS public.patient_caregiver DROP CONSTRAINT IF EXISTS patient_caregiver_patient_id_fkey;
ALTER TABLE IF EXISTS public.patient_caregiver DROP CONSTRAINT IF EXISTS patient_caregiver_caregiver_id_fkey;
ALTER TABLE IF EXISTS public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- 3. Users Table (Core profiles for Patients, Doctors, Caregivers)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role TEXT NOT NULL DEFAULT 'patient',
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    age INT,
    gender TEXT,
    disease TEXT,
    qualifications TEXT,
    points INT DEFAULT 100,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS age INT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS disease TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS qualifications TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS points INT DEFAULT 100;

-- 4. Profiles Table (Dual compatibility table)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role TEXT DEFAULT 'patient',
    full_name TEXT,
    email TEXT,
    phone TEXT,
    age INT,
    gender TEXT,
    disease TEXT,
    qualifications TEXT,
    points INT DEFAULT 100,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'patient';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS age INT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS disease TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS qualifications TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS points INT DEFAULT 100;

-- 5. Caregiver <-> Patient Links
CREATE TABLE IF NOT EXISTS public.patient_caregiver (
    caregiver_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (caregiver_id, patient_id)
);

CREATE TABLE IF NOT EXISTS public.caregiver_patient_links (
    caregiver_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (caregiver_id, patient_id)
);

-- 6. Care Tasks (Tasks assigned to caregivers for each patient)
CREATE TABLE IF NOT EXISTS public.care_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL,
    caregiver_id UUID,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'general', -- 'medication', 'vitals', 'nutrition', 'mobility', 'hygiene', 'respiratory'
    due_time TIME,
    is_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Vitals Logging (Supports both user_id and patient_id)
CREATE TABLE IF NOT EXISTS public.vitals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID,
    user_id UUID,
    vital_type TEXT DEFAULT 'heart_rate',
    value TEXT NOT NULL,
    unit TEXT,
    heart_rate INT,
    blood_pressure TEXT,
    glucose_level NUMERIC,
    notes TEXT,
    recorded_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.vitals ADD COLUMN IF NOT EXISTS patient_id UUID;
ALTER TABLE public.vitals ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE public.vitals ADD COLUMN IF NOT EXISTS vital_type TEXT;
ALTER TABLE public.vitals ADD COLUMN IF NOT EXISTS value TEXT;
ALTER TABLE public.vitals ADD COLUMN IF NOT EXISTS unit TEXT;
ALTER TABLE public.vitals ADD COLUMN IF NOT EXISTS heart_rate INT;
ALTER TABLE public.vitals ADD COLUMN IF NOT EXISTS blood_pressure TEXT;
ALTER TABLE public.vitals ADD COLUMN IF NOT EXISTS glucose_level NUMERIC;
ALTER TABLE public.vitals ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.vitals ADD COLUMN IF NOT EXISTS recorded_at TIMESTAMPTZ DEFAULT now();

-- 8. Medications
CREATE TABLE IF NOT EXISTS public.medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID,
    user_id UUID,
    name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    frequency TEXT DEFAULT 'once_daily',
    time_slots TEXT[],
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    schedule TIME,
    adherence_status BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.medications ADD COLUMN IF NOT EXISTS patient_id UUID;
ALTER TABLE public.medications ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE public.medications ADD COLUMN IF NOT EXISTS frequency TEXT;
ALTER TABLE public.medications ADD COLUMN IF NOT EXISTS time_slots TEXT[];
ALTER TABLE public.medications ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE public.medications ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE public.medications ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.medications ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.medications ADD COLUMN IF NOT EXISTS schedule TIME;
ALTER TABLE public.medications ADD COLUMN IF NOT EXISTS adherence_status BOOLEAN DEFAULT false;
ALTER TABLE public.medications ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE IF EXISTS public.medications ALTER COLUMN schedule DROP NOT NULL;

-- 9. Appointments
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID,
    user_id UUID,
    doctor_id UUID,
    doctor_name TEXT,
    title TEXT NOT NULL,
    type TEXT DEFAULT 'doctor',
    appointment_date TIMESTAMPTZ NOT NULL,
    location TEXT,
    notes TEXT,
    status TEXT DEFAULT 'scheduled',
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS patient_id UUID;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS doctor_id UUID;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS doctor_name TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'scheduled';
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- 10. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_vitals_patient_time ON public.vitals(patient_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_vitals_user_time ON public.vitals(user_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_medications_patient ON public.medications(patient_id);
CREATE INDEX IF NOT EXISTS idx_medications_user ON public.medications(user_id);
CREATE INDEX IF NOT EXISTS idx_care_tasks_patient ON public.care_tasks(patient_id);
CREATE INDEX IF NOT EXISTS idx_caregiver_links ON public.patient_caregiver(caregiver_id, patient_id);
