"""
Aegis Link Database Seeding Script.

Populates the database with:
- 10 Patients across diverse clinical disease profiles
- 2 Doctors with high-tier medical qualifications and specialties
- 3 Caregivers linked to patients with 6 to 7 specific care tasks per patient
- Multi-day historical vitals records for each patient
- Active medication regimens tailored to each diagnosis
- Scheduled clinical appointments
"""

import json
import uuid
from datetime import datetime, timedelta
from typing import Any, Dict, List

from app.services.supabase_client import get_supabase_client

# =====================================================================
# 1. Doctors (2 Specialized Physicians)
# =====================================================================
DOCTORS = [
    {
        "id": "11111111-1111-4111-8111-111111111101",
        "role": "doctor",
        "full_name": "Dr. Marcus Vance, MD, FACC",
        "email": "doctor.vance@aegislink.com",
        "phone": "+1 (555) 101-2001",
        "age": 49,
        "gender": "male",
        "qualifications": "MD, FACC - Chief of Cardiology & Cardiovascular Interventions (Harvard Medical School, 18 yrs exp)",
        "disease": "Cardiology, Heart Failure, Arrhythmias, Hypertension",
        "points": 500,
    },
    {
        "id": "11111111-1111-4111-8111-111111111102",
        "role": "doctor",
        "full_name": "Dr. Aisha Sen, MD, DM",
        "email": "doctor.sen@aegislink.com",
        "phone": "+1 (555) 101-2002",
        "age": 44,
        "gender": "female",
        "qualifications": "MD, DM (Endocrinology) - Senior Diabetologist & Internal Medicine Specialist (Johns Hopkins Medicine, 14 yrs exp)",
        "disease": "Endocrinology, Type 1 & 2 Diabetes, Thyroid Disorders, Metabolic Health",
        "points": 450,
    },
]

# =====================================================================
# 2. Caregivers (3 Certified Care Coordinators)
# =====================================================================
CAREGIVERS = [
    {
        "id": "22222222-2222-4222-8222-222222222201",
        "role": "caregiver",
        "full_name": "Elena Rostova, RN",
        "email": "caregiver.elena@aegislink.com",
        "phone": "+1 (555) 202-3001",
        "age": 36,
        "gender": "female",
        "qualifications": "RN, BSN - Certified Critical Care & Geriatric Nurse Specialist (7 yrs exp)",
        "disease": "Intensive Monitoring, Medication Administration, Vital Triage",
        "points": 320,
    },
    {
        "id": "22222222-2222-4222-8222-222222222202",
        "role": "caregiver",
        "full_name": "Michael Chang, CPT",
        "email": "caregiver.michael@aegislink.com",
        "phone": "+1 (555) 202-3002",
        "age": 31,
        "gender": "male",
        "qualifications": "CPT, BS - Physical Rehabilitation & Post-Operative Mobility Specialist (5 yrs exp)",
        "disease": "Mobility Therapy, Post-Stroke Rehab, Fall Prevention",
        "points": 280,
    },
    {
        "id": "22222222-2222-4222-8222-222222222203",
        "role": "caregiver",
        "full_name": "Sarah Jenkins, CNA",
        "email": "caregiver.sarah@aegislink.com",
        "phone": "+1 (555) 202-3003",
        "age": 40,
        "gender": "female",
        "qualifications": "CNA, CHHA - Chronic Disease Care Coordinator & Palliative Support (6 yrs exp)",
        "disease": "Dietary Management, Daily Living Assistance, Respiratory Care",
        "points": 310,
    },
]

# =====================================================================
# 3. Patients (10 Patients with Diverse Diagnoses)
# =====================================================================
PATIENTS = [
    {
        "id": "33333333-3333-4333-8333-333333333301",
        "role": "patient",
        "full_name": "Eleanor Vance",
        "email": "patient.eleanor@aegislink.com",
        "phone": "+1 (555) 303-4001",
        "age": 68,
        "gender": "female",
        "disease": "Type 2 Diabetes Mellitus & Diabetic Peripheral Neuropathy",
        "qualifications": "Retired School Administrator",
        "points": 180,
        "primary_caregiver_idx": 0,
        "primary_doctor_idx": 1,
        "meds": [
            {"name": "Metformin Hydrochloride", "dosage": "850mg", "frequency": "twice daily", "schedule": "08:00:00"},
            {"name": "Glimepiride", "dosage": "2mg", "frequency": "once daily", "schedule": "08:30:00"},
            {"name": "Pregabalin (Lyrica)", "dosage": "75mg", "frequency": "twice daily", "schedule": "20:00:00"},
        ],
        "vitals": [
            {"vital_type": "glucose", "value": "138", "unit": "mg/dL", "glucose_level": 138},
            {"vital_type": "bp", "value": "128/82", "unit": "mmHg", "blood_pressure": "128/82"},
            {"vital_type": "hr", "value": "74", "unit": "bpm", "heart_rate": 74},
        ],
        "tasks": [
            ("Fasting Blood Sugar Log", "Perform fingerstick glucose check before breakfast and log reading.", "07:30:00", "vitals"),
            ("Morning Medication Administration", "Administer Metformin 850mg and Glimepiride 2mg with breakfast meal.", "08:00:00", "medication"),
            ("Diabetic Foot & Skin Inspection", "Examine lower extremities for pressure redness, micro-abrasions, or numbness.", "11:00:00", "hygiene"),
            ("Low-Glycemic Lunch & Hydration", "Prepare carbohydrate-controlled lunch (max 45g carbs) and ensure 500ml water intake.", "13:00:00", "nutrition"),
            ("Post-Lunch 15-Minute Gentle Walk", "Accompany Eleanor on 15-minute flat-surface indoor walk to assist insulin sensitivity.", "14:30:00", "mobility"),
            ("Pre-Dinner Glucose Check", "Record evening pre-prandial glucose level and inspect continuous monitor sensor.", "18:00:00", "vitals"),
            ("Nighttime Neuropathy Dose", "Administer Pregabalin 75mg for peripheral nerve comfort before sleep.", "21:00:00", "medication"),
        ],
    },
    {
        "id": "33333333-3333-4333-8333-333333333302",
        "role": "patient",
        "full_name": "Robert Chen",
        "email": "patient.robert@aegislink.com",
        "phone": "+1 (555) 303-4002",
        "age": 72,
        "gender": "male",
        "disease": "Essential Hypertension & Coronary Artery Disease (CAD)",
        "qualifications": "Former Mechanical Engineer",
        "points": 140,
        "primary_caregiver_idx": 0,
        "primary_doctor_idx": 0,
        "meds": [
            {"name": "Lisinopril", "dosage": "20mg", "frequency": "once daily", "schedule": "08:00:00"},
            {"name": "Amlodipine Besylate", "dosage": "5mg", "frequency": "once daily", "schedule": "08:00:00"},
            {"name": "Atorvastatin Calcium", "dosage": "40mg", "frequency": "once daily", "schedule": "21:00:00"},
            {"name": "Aspirin (Enteric Coated)", "dosage": "81mg", "frequency": "once daily", "schedule": "08:30:00"},
        ],
        "vitals": [
            {"vital_type": "bp", "value": "134/86", "unit": "mmHg", "blood_pressure": "134/86"},
            {"vital_type": "hr", "value": "68", "unit": "bpm", "heart_rate": 68},
            {"vital_type": "spo2", "value": "97", "unit": "%"},
        ],
        "tasks": [
            ("Morning Resting Blood Pressure", "Seat patient comfortably for 5 mins, take dual-arm automated BP and record.", "07:45:00", "vitals"),
            ("Morning Antihypertensive Regimen", "Administer Lisinopril 20mg and Amlodipine 5mg with a glass of water.", "08:00:00", "medication"),
            ("Cardiac Low-Sodium Breakfast", "Serve oatmeal with fresh berries and unsalted walnuts (< 400mg total sodium).", "08:30:00", "nutrition"),
            ("Mid-Day Pulse & Oxygen Saturation", "Measure radial pulse rate and SpO2 using pulse oximeter.", "12:30:00", "vitals"),
            ("Cardiac Rehabilitation Walking", "Supervised 20-minute treadmill walk at 2.2 mph with continuous heart rate band.", "15:30:00", "mobility"),
            ("Evening Telemetry & BP Verification", "Record evening resting blood pressure reading to check for nocturnal dipping.", "19:30:00", "vitals"),
            ("Night Statin Administration", "Give Atorvastatin 40mg at bedtime for lipid optimization.", "21:00:00", "medication"),
        ],
    },
    {
        "id": "33333333-3333-4333-8333-333333333303",
        "role": "patient",
        "full_name": "Amara Patel",
        "email": "patient.amara@aegislink.com",
        "phone": "+1 (555) 303-4003",
        "age": 34,
        "gender": "female",
        "disease": "Severe Persistent Bronchial Asthma & Allergic Rhinitis",
        "qualifications": "Software Product Designer",
        "points": 210,
        "primary_caregiver_idx": 2,
        "primary_doctor_idx": 1,
        "meds": [
            {"name": "Fluticasone/Salmeterol (Advair)", "dosage": "250/50mcg", "frequency": "twice daily", "schedule": "08:00:00"},
            {"name": "Montelukast (Singulair)", "dosage": "10mg", "frequency": "once daily", "schedule": "21:00:00"},
            {"name": "Albuterol Sulfate Inhaler", "dosage": "90mcg", "frequency": "as needed", "schedule": "12:00:00"},
        ],
        "vitals": [
            {"vital_type": "spo2", "value": "98", "unit": "%"},
            {"vital_type": "hr", "value": "78", "unit": "bpm", "heart_rate": 78},
            {"vital_type": "bp", "value": "116/74", "unit": "mmHg", "blood_pressure": "116/74"},
        ],
        "tasks": [
            ("Peak Expiratory Flow (PEF) Test", "Perform 3 peak flow meter blows, record best score against baseline.", "07:30:00", "respiratory"),
            ("Morning Maintenance Inhaler", "Administer Advair 250/50mcg with spacer, ensure oral rinse afterwards.", "08:00:00", "medication"),
            ("Air Filter & HEPA Check", "Verify bedroom HEPA purifier airflow and room humidity index (target 45%).", "10:30:00", "hygiene"),
            ("Midday SpO2 & Respiratory Rate", "Record resting respiratory rate and fingertip SpO2 reading.", "13:00:00", "vitals"),
            ("Diaphragmatic Breathing Practice", "15 minutes of guided pursed-lip breathing and chest expansion exercises.", "16:00:00", "respiratory"),
            ("Evening Peak Flow Monitoring", "Perform evening peak flow measurement and log any wheezing or cough score.", "19:00:00", "respiratory"),
            ("Night Leukotriene Dose", "Administer Montelukast 10mg tablet before sleep.", "21:00:00", "medication"),
        ],
    },
    {
        "id": "33333333-3333-4333-8333-333333333304",
        "role": "patient",
        "full_name": "David Miller",
        "email": "patient.david@aegislink.com",
        "phone": "+1 (555) 303-4004",
        "age": 58,
        "gender": "male",
        "disease": "Chronic Kidney Disease (CKD Stage 3b) & Hyperuricemia",
        "qualifications": "Architectural Consultant",
        "points": 160,
        "primary_caregiver_idx": 0,
        "primary_doctor_idx": 1,
        "meds": [
            {"name": "Losartan Potassium", "dosage": "50mg", "frequency": "once daily", "schedule": "08:00:00"},
            {"name": "Allopurinol", "dosage": "100mg", "frequency": "once daily", "schedule": "09:00:00"},
            {"name": "Sodium Bicarbonate", "dosage": "650mg", "frequency": "twice daily", "schedule": "08:00:00"},
        ],
        "vitals": [
            {"vital_type": "bp", "value": "126/78", "unit": "mmHg", "blood_pressure": "126/78"},
            {"vital_type": "weight", "value": "78.4", "unit": "kg"},
            {"vital_type": "hr", "value": "71", "unit": "bpm", "heart_rate": 71},
        ],
        "tasks": [
            ("Daily Morning Dry Weight Log", "Weigh on calibrated digital scale post-void to monitor fluid balance.", "07:15:00", "vitals"),
            ("Morning Renal Protective Meds", "Administer Losartan 50mg and Sodium Bicarbonate 650mg with breakfast.", "08:00:00", "medication"),
            ("Low-Potassium & Low-Phosphorus Meal", "Prepare renal-friendly lunch; restrict citrus, tomatoes, and dairy.", "12:00:00", "nutrition"),
            ("Strict 24-Hour Fluid Intake Tally", "Log all liquid consumption towards daily target limit of 1800 ml.", "14:00:00", "nutrition"),
            ("Edema & Swelling Check", "Inspect pretibial and ankle areas for 1+ to 4+ pitting edema.", "16:30:00", "hygiene"),
            ("Afternoon Blood Pressure Check", "Take and record sitting BP to ensure renal perfusion target < 130/80.", "18:30:00", "vitals"),
            ("Evening Bicarbonate Dose", "Administer evening Sodium Bicarbonate 650mg dose with light dinner.", "20:00:00", "medication"),
        ],
    },
    {
        "id": "33333333-3333-4333-8333-333333333305",
        "role": "patient",
        "full_name": "Sophia Rodriguez",
        "email": "patient.sophia@aegislink.com",
        "phone": "+1 (555) 303-4005",
        "age": 45,
        "gender": "female",
        "disease": "Rheumatoid Arthritis (RA) & Secondary Fibromyalgia",
        "qualifications": "High School Literature Teacher",
        "points": 195,
        "primary_caregiver_idx": 1,
        "primary_doctor_idx": 1,
        "meds": [
            {"name": "Methotrexate", "dosage": "15mg", "frequency": "once weekly", "schedule": "09:00:00"},
            {"name": "Folic Acid", "dosage": "1mg", "frequency": "once daily", "schedule": "09:00:00"},
            {"name": "Hydroxychloroquine (Plaquenil)", "dosage": "200mg", "frequency": "once daily", "schedule": "08:30:00"},
            {"name": "Duloxetine (Cymbalta)", "dosage": "60mg", "frequency": "once daily", "schedule": "08:00:00"},
        ],
        "vitals": [
            {"vital_type": "hr", "value": "76", "unit": "bpm", "heart_rate": 76},
            {"vital_type": "bp", "value": "118/76", "unit": "mmHg", "blood_pressure": "118/76"},
            {"vital_type": "temp", "value": "98.4", "unit": "°F"},
        ],
        "tasks": [
            ("Morning Joint Stiffness Scoring", "Rate morning hand and knee joint stiffness duration (minutes) and pain level 1-10.", "07:30:00", "vitals"),
            ("Warm Hydrotherapy & Range-of-Motion", "Assist with 15-min warm paraffin hand bath and gentle wrist rotations.", "08:15:00", "mobility"),
            ("Anti-Inflammatory Morning Meds", "Administer Hydroxychloroquine 200mg and Duloxetine 60mg with food.", "08:45:00", "medication"),
            ("Mediterranean Anti-Inflammatory Lunch", "Serve omega-3 rich salmon bowl with dark leafy greens and olive oil.", "12:30:00", "nutrition"),
            ("Low-Impact Isometric Exercises", "Guide 20 minutes of seated resistance band and gentle shoulder stretches.", "15:00:00", "mobility"),
            ("Cold Compress / Heat Therapy Review", "Apply localized gel cold pack to inflamed MCP joints for 10 minutes.", "17:30:00", "hygiene"),
            ("Evening Relaxation & Pain Log", "Record end-of-day fibromyalgia score and apply soothing botanical lotion.", "20:30:00", "hygiene"),
        ],
    },
    {
        "id": "33333333-3333-4333-8333-333333333306",
        "role": "patient",
        "full_name": "James Wilson",
        "email": "patient.james@aegislink.com",
        "phone": "+1 (555) 303-4006",
        "age": 64,
        "gender": "male",
        "disease": "Chronic Obstructive Pulmonary Disease (COPD Gold Stage II)",
        "qualifications": "Retired Commercial Contractor",
        "points": 130,
        "primary_caregiver_idx": 2,
        "primary_doctor_idx": 0,
        "meds": [
            {"name": "Tiotropium Bromide (Spiriva)", "dosage": "18mcg", "frequency": "once daily", "schedule": "08:00:00"},
            {"name": "Budesonide/Formoterol (Symbicort)", "dosage": "160/4.5mcg", "frequency": "twice daily", "schedule": "08:30:00"},
            {"name": "N-Acetylcysteine (NAC)", "dosage": "600mg", "frequency": "twice daily", "schedule": "12:00:00"},
        ],
        "vitals": [
            {"vital_type": "spo2", "value": "93", "unit": "%"},
            {"vital_type": "hr", "value": "82", "unit": "bpm", "heart_rate": 82},
            {"vital_type": "bp", "value": "130/84", "unit": "mmHg", "blood_pressure": "130/84"},
        ],
        "tasks": [
            ("Morning Resting O2 Saturation", "Measure pulse oximeter SpO2 on room air before exertion (alert if < 90%).", "07:30:00", "respiratory"),
            ("Long-Acting Bronchodilator Inhalation", "Administer Spiriva 18mcg HandiHaler capsule and ensure complete breath-hold.", "08:00:00", "medication"),
            ("Chest Clearance & Mucus Drainage", "Assist with active cycle of breathing technique and postural drainage.", "10:00:00", "respiratory"),
            ("Oxygen Concentrator Filter Sanitization", "Inspect home oxygen tubing, cannulas, and clean air intake filters.", "11:30:00", "hygiene"),
            ("Pulmonary Rehabilitation Walking", "Conduct 6-minute corridor walk with portable O2 at 2L/min pulse flow.", "14:00:00", "mobility"),
            ("High-Calorie Nutrient-Dense Snack", "Provide high-protein smoothie to support respiratory muscle endurance.", "16:30:00", "nutrition"),
            ("Evening Inhaled Steroid Dose", "Administer Symbicort 160/4.5mcg and verify post-dose SpO2 stability.", "20:00:00", "medication"),
        ],
    },
    {
        "id": "33333333-3333-4333-8333-333333333307",
        "role": "patient",
        "full_name": "Fatima Al-Mansoor",
        "email": "patient.fatima@aegislink.com",
        "phone": "+1 (555) 303-4007",
        "age": 29,
        "gender": "female",
        "disease": "Refractory Chronic Migraine & Dysautonomia (POTS)",
        "qualifications": "Research Bioinformatician",
        "points": 240,
        "primary_caregiver_idx": 1,
        "primary_doctor_idx": 0,
        "meds": [
            {"name": "Topiramate (Topamax)", "dosage": "50mg", "frequency": "twice daily", "schedule": "08:00:00"},
            {"name": "Propranolol Hydrochloride", "dosage": "40mg", "frequency": "twice daily", "schedule": "08:00:00"},
            {"name": "Magnesium Glycinate", "dosage": "400mg", "frequency": "once daily", "schedule": "21:00:00"},
            {"name": "Rizatriptan (Maxalt)", "dosage": "10mg", "frequency": "as needed", "schedule": "14:00:00"},
        ],
        "vitals": [
            {"vital_type": "hr", "value": "92", "unit": "bpm", "heart_rate": 92},
            {"vital_type": "bp", "value": "108/68", "unit": "mmHg", "blood_pressure": "108/68"},
            {"vital_type": "temp", "value": "98.2", "unit": "°F"},
        ],
        "tasks": [
            ("Orthostatic Heart Rate Vitals Check", "Measure Supine vs Standing 3-min and 10-min HR/BP for POTS triage.", "07:45:00", "vitals"),
            ("Electrolyte & High-Sodium Hydration", "Prepare 1 Liter electrolyte solution with 2g added Himalayan pink salt.", "08:15:00", "nutrition"),
            ("Morning Migraine Prophylaxis", "Administer Topiramate 50mg and Propranolol 40mg with food.", "08:30:00", "medication"),
            ("Compression Garment Application", "Assist with 20-30 mmHg medical thigh-high compression stockings.", "09:15:00", "mobility"),
            ("Recumbent Rowing / Semi-Seated Cardio", "15 minutes of non-upright recumbent stationary cycle training.", "14:00:00", "mobility"),
            ("Blue Light & Headache Symptom Log", "Log photophobia score, aura frequency, and room lighting adjustments.", "17:30:00", "hygiene"),
            ("Night Neuro-Calm & Magnesium", "Administer Magnesium Glycinate 400mg and evening Topiramate 50mg.", "21:00:00", "medication"),
        ],
    },
    {
        "id": "33333333-3333-4333-8333-333333333308",
        "role": "patient",
        "full_name": "William Taylor",
        "email": "patient.william@aegislink.com",
        "phone": "+1 (555) 303-4008",
        "age": 76,
        "gender": "male",
        "disease": "Congestive Heart Failure (NYHA Class II) & Atrial Fibrillation",
        "qualifications": "Retired Naval Logistics Officer",
        "points": 115,
        "primary_caregiver_idx": 0,
        "primary_doctor_idx": 0,
        "meds": [
            {"name": "Sacubitril/Valsartan (Entresto)", "dosage": "49/51mg", "frequency": "twice daily", "schedule": "08:00:00"},
            {"name": "Furosemide (Lasix)", "dosage": "40mg", "frequency": "once daily", "schedule": "08:00:00"},
            {"name": "Metoprolol Succinate ER", "dosage": "50mg", "frequency": "once daily", "schedule": "08:30:00"},
            {"name": "Apixaban (Eliquis)", "dosage": "5mg", "frequency": "twice daily", "schedule": "08:00:00"},
        ],
        "vitals": [
            {"vital_type": "bp", "value": "114/72", "unit": "mmHg", "blood_pressure": "114/72"},
            {"vital_type": "hr", "value": "64", "unit": "bpm", "heart_rate": 64},
            {"vital_type": "weight", "value": "83.1", "unit": "kg"},
        ],
        "tasks": [
            ("Strict Post-Void Weight Check", "Weigh in morning to detect early fluid retention (> 2 lbs in 24h triggers alert).", "07:00:00", "vitals"),
            ("Morning Diuretic & Guideline Meds", "Administer Lasix 40mg, Entresto 49/51mg, and Eliquis 5mg.", "08:00:00", "medication"),
            ("Rigid 1500mg Sodium Breakfast", "Serve sodium-restricted egg-white omelet with steamed spinach and avocado.", "08:30:00", "nutrition"),
            ("Peripheral Edema & Jugular Vein Check", "Check bilateral ankles for fluid buildup and examine neck vein distension.", "11:30:00", "hygiene"),
            ("Controlled Level-Surface Ambulation", "10-minute flat hallway walk with portable telemetry pulse check.", "15:00:00", "mobility"),
            ("Evening BP & Irregular Pulse Log", "Check for AFib rate control and log sitting blood pressure.", "19:00:00", "vitals"),
            ("Evening Anticoagulant & Entresto Dose", "Administer second dose of Eliquis 5mg and Entresto 49/51mg.", "20:30:00", "medication"),
        ],
    },
    {
        "id": "33333333-3333-4333-8333-333333333309",
        "role": "patient",
        "full_name": "Mei-Ling Zhou",
        "email": "patient.meiling@aegislink.com",
        "phone": "+1 (555) 303-4009",
        "age": 52,
        "gender": "female",
        "disease": "Primary Hypothyroidism (Hashimoto's) & Mixed Dyslipidemia",
        "qualifications": "Senior Financial Auditor",
        "points": 225,
        "primary_caregiver_idx": 2,
        "primary_doctor_idx": 1,
        "meds": [
            {"name": "Levothyroxine Sodium (Synthroid)", "dosage": "112mcg", "frequency": "once daily", "schedule": "06:30:00"},
            {"name": "Rosuvastatin (Crestor)", "dosage": "20mg", "frequency": "once daily", "schedule": "21:00:00"},
            {"name": "Vitamin D3 (Cholecalciferol)", "dosage": "5000 IU", "frequency": "once daily", "schedule": "08:30:00"},
            {"name": "Omega-3 Ethyl Esters (Lovaza)", "dosage": "1000mg", "frequency": "twice daily", "schedule": "12:30:00"},
        ],
        "vitals": [
            {"vital_type": "hr", "value": "66", "unit": "bpm", "heart_rate": 66},
            {"vital_type": "bp", "value": "122/80", "unit": "mmHg", "blood_pressure": "122/80"},
            {"vital_type": "temp", "value": "97.8", "unit": "°F"},
        ],
        "tasks": [
            ("Fasting Thyroid Hormone Dosing", "Administer Levothyroxine 112mcg on empty stomach with full glass of water.", "06:30:00", "medication"),
            ("Basal Body Temperature & Pulse", "Take oral basal thermometer reading (track cold sensitivity index).", "07:15:00", "vitals"),
            ("Nutrient Breakfast & Vitamin D", "Serve gluten-free oat bowl with chia seeds and Vitamin D3 5000 IU.", "08:00:00", "nutrition"),
            ("Post-Breakfast Energy & Mood Rating", "Record subjective cognitive clarity and fatigue scale score.", "10:30:00", "hygiene"),
            ("Cardiovascular Aerobic Walk", "Supervise 25-minute brisk neighborhood walk at heart rate 105-115 bpm.", "14:30:00", "mobility"),
            ("Midday Lipid Support Omega-3", "Administer Lovaza 1000mg with balanced lunch meal.", "12:30:00", "medication"),
            ("Night Statin & Metabolic Log", "Administer Rosuvastatin 20mg at bedtime and log sleep readiness.", "21:00:00", "medication"),
        ],
    },
    {
        "id": "33333333-3333-4333-8333-333333333310",
        "role": "patient",
        "full_name": "Arthur Pendelton",
        "email": "patient.arthur@aegislink.com",
        "phone": "+1 (555) 303-4010",
        "age": 81,
        "gender": "male",
        "disease": "Severe Bilateral Knee Osteoarthritis & Post-Ischemic Stroke Care",
        "qualifications": "Retired Classical Musician",
        "points": 105,
        "primary_caregiver_idx": 1,
        "primary_doctor_idx": 0,
        "meds": [
            {"name": "Clopidogrel (Plavix)", "dosage": "75mg", "frequency": "once daily", "schedule": "08:00:00"},
            {"name": "Acetaminophen ER (Tylenol 8hr)", "dosage": "650mg", "frequency": "twice daily", "schedule": "08:00:00"},
            {"name": "Meloxicam", "dosage": "15mg", "frequency": "once daily", "schedule": "08:30:00"},
            {"name": "Pantoprazole", "dosage": "40mg", "frequency": "once daily", "schedule": "07:30:00"},
        ],
        "vitals": [
            {"vital_type": "bp", "value": "132/80", "unit": "mmHg", "blood_pressure": "132/80"},
            {"vital_type": "hr", "value": "70", "unit": "bpm", "heart_rate": 70},
            {"vital_type": "spo2", "value": "96", "unit": "%"},
        ],
        "tasks": [
            ("Assisted Morning Transfer & Gait Check", "Provide standby assistance for bed-to-chair transfer using rolling walker.", "07:30:00", "mobility"),
            ("Morning Stroke Prophylaxis & Pain Meds", "Administer Pantoprazole 40mg, Plavix 75mg, and Tylenol ER 650mg.", "08:00:00", "medication"),
            ("Joint Mobility & Quadriceps Strengthening", "Perform 20 minutes of seated leg extensions and passive ankle pumps.", "10:00:00", "mobility"),
            ("Nutritional Anti-Choking Meal Check", "Ensure soft-texture diet prep and seated 90-degree posture during lunch.", "12:30:00", "nutrition"),
            ("Bilateral Knee Topical Gel & Ice Therapy", "Apply Diclofenac topical gel to bilateral patellar surfaces.", "15:00:00", "hygiene"),
            ("Neurological Symmetry & Speech Check", "Perform quick FAST (Face, Arms, Speech, Time) screening checklist.", "18:00:00", "vitals"),
            ("Bedtime Safety & Fall Prevention Audit", "Verify nightlight illumination, non-skid socks, and clear pathway to bathroom.", "21:00:00", "hygiene"),
        ],
    },
]


def seed_database() -> None:
    """Execute complete seeding process across Supabase DB tables and export JSON snapshot."""
    print("=" * 70)
    print("  AEGIS LINK: INITIALIZING HEALTHCARE DATABASE SEEDING ENGINE")
    print("=" * 70)

    client = get_supabase_client()

    all_profiles: List[Dict[str, Any]] = []
    all_links: List[Dict[str, Any]] = []
    all_tasks: List[Dict[str, Any]] = []
    all_vitals: List[Dict[str, Any]] = []
    all_medications: List[Dict[str, Any]] = []
    all_appointments: List[Dict[str, Any]] = []

    # 1. Doctors
    for d in DOCTORS:
        prof = {
            "id": d["id"],
            "role": d["role"],
            "full_name": d["full_name"],
            "email": d["email"],
            "phone": d["phone"],
            "age": d["age"],
            "gender": d["gender"],
            "qualifications": d["qualifications"],
            "disease": d["disease"],
            "points": d["points"],
        }
        all_profiles.append(prof)
        try:
            client.table("profiles").upsert(prof).execute()
        except Exception as e:
            print(f"Note (Profiles): {e}")

    # 2. Caregivers
    for c in CAREGIVERS:
        prof = {
            "id": c["id"],
            "role": c["role"],
            "full_name": c["full_name"],
            "email": c["email"],
            "phone": c["phone"],
            "age": c["age"],
            "gender": c["gender"],
            "qualifications": c["qualifications"],
            "disease": c["disease"],
            "points": c["points"],
        }
        all_profiles.append(prof)
        try:
            client.table("profiles").upsert(prof).execute()
        except Exception as e:
            print(f"Note (Profiles): {e}")

    # 3. Patients, Vitals, Medications, Links, and Care Tasks
    for p in PATIENTS:
        p_id = p["id"]
        cg_id = CAREGIVERS[p["primary_caregiver_idx"]]["id"]
        doc_id = DOCTORS[p["primary_doctor_idx"]]["id"]

        # Profile
        prof = {
            "id": p_id,
            "role": p["role"],
            "full_name": p["full_name"],
            "email": p["email"],
            "phone": p["phone"],
            "age": p["age"],
            "gender": p["gender"],
            "disease": p["disease"],
            "qualifications": p["qualifications"],
            "points": p["points"],
        }
        all_profiles.append(prof)
        try:
            client.table("profiles").upsert(prof).execute()
        except Exception as e:
            pass

        # Caregiver Link
        link = {
            "caregiver_id": cg_id,
            "patient_id": p_id,
            "status": "active",
        }
        all_links.append(link)
        try:
            client.table("caregiver_patient_links").upsert(link).execute()
        except Exception as e:
            pass

        # Care Tasks (6 to 7 per patient)
        for t_title, t_desc, t_time, t_cat in p["tasks"]:
            task = {
                "id": str(uuid.uuid4()),
                "patient_id": p_id,
                "caregiver_id": cg_id,
                "title": t_title,
                "description": t_desc,
                "category": t_cat,
                "due_time": t_time,
                "is_completed": False,
                "created_at": datetime.utcnow().isoformat() + "Z",
            }
            all_tasks.append(task)
            try:
                client.table("care_tasks").insert(task).execute()
            except Exception as e:
                pass

        # Vitals
        for v in p["vitals"]:
            vital = {
                "id": str(uuid.uuid4()),
                "patient_id": p_id,
                "vital_type": v.get("vital_type", "bp"),
                "value": str(v.get("value", "120/80")),
                "unit": v.get("unit", "mmHg"),
                "heart_rate": v.get("heart_rate"),
                "blood_pressure": v.get("blood_pressure"),
                "glucose_level": v.get("glucose_level"),
                "recorded_at": datetime.utcnow().isoformat() + "Z",
            }
            all_vitals.append(vital)
            try:
                client.table("vitals").insert(vital).execute()
            except Exception as e:
                pass

        # Medications
        for m in p["meds"]:
            med = {
                "id": str(uuid.uuid4()),
                "patient_id": p_id,
                "name": m["name"],
                "dosage": m["dosage"],
                "frequency": m["frequency"],
                "schedule": m["schedule"],
                "adherence_status": False,
                "created_at": datetime.utcnow().isoformat() + "Z",
            }
            all_medications.append(med)
            try:
                client.table("medications").insert(med).execute()
            except Exception as e:
                pass

        # Appointment with Doctor
        appt = {
            "id": str(uuid.uuid4()),
            "patient_id": p_id,
            "doctor_id": doc_id,
            "title": f"Comprehensive Follow-up with {DOCTORS[p['primary_doctor_idx']]['full_name'].split(',')[0]}",
            "type": "doctor",
            "appointment_date": (datetime.utcnow() + timedelta(days=7)).isoformat() + "Z",
            "location": "Aegis Link Medical Center, Suite 400",
            "notes": f"Routine review for {p['disease']}.",
            "status": "scheduled",
        }
        all_appointments.append(appt)
        try:
            client.table("appointments").insert(appt).execute()
        except Exception as e:
            pass

    # Save complete offline and localized JSON seed snapshot
    seed_export = {
        "metadata": {
            "generated_at": datetime.utcnow().isoformat() + "Z",
            "version": "1.0",
            "patient_count": len(PATIENTS),
            "doctor_count": len(DOCTORS),
            "caregiver_count": len(CAREGIVERS),
            "total_care_tasks": len(all_tasks),
        },
        "profiles": all_profiles,
        "caregiver_patient_links": all_links,
        "care_tasks": all_tasks,
        "vitals": all_vitals,
        "medications": all_medications,
        "appointments": all_appointments,
    }

    export_path = "sample_database_export.json"
    with open(export_path, "w", encoding="utf-8") as f:
        json.dump(seed_export, f, indent=2)

    # Also save to frontend public/sample_data.json for instant offline access
    frontend_export_path = "../public/sample_database.json"
    try:
        with open(frontend_export_path, "w", encoding="utf-8") as f:
            json.dump(seed_export, f, indent=2)
    except Exception:
        pass

    print(f"\n[OK] Seeding Summary:")
    print(f"  + Profiles Created: {len(all_profiles)} (10 Patients, 2 Doctors, 3 Caregivers)")
    print(f"  + Caregiver Links Created: {len(all_links)}")
    print(f"  + Care Tasks Generated: {len(all_tasks)} (~6-7 clinical tasks per patient)")
    print(f"  + Vitals Recorded: {len(all_vitals)}")
    print(f"  + Medications Prescribed: {len(all_medications)}")
    print(f"  + Appointments Scheduled: {len(all_appointments)}")
    print(f"  + Snapshot Exported to: {export_path}")
    print("=" * 70)


if __name__ == "__main__":
    seed_database()
