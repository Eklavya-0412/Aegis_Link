export interface User {
  user_id: string;
  role: 'patient' | 'caregiver' | 'family_member' | 'doctor';
  name: string;
  email: string;
  phone?: string;
  age: number;
  gender: 'male' | 'female';
  family_id: string;
  relationship?: string;
  access_token: string;
  points?: number;
  patient_id?: string;
  code?: string;
}

export interface Family {
  family_id: string;
  family_name: string;
  members: User[];
  created_at: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  start_date: string;
  end_date?: string;
  active: boolean;
  taken_today?: boolean;
  member_id: string;
}

export interface Appointment {
  id: string;
  title: string;
  type: 'doctor' | 'telemedicine' | 'lab_test';
  doctor_name?: string;
  appointment_date: string;
  location?: string;
  notes?: string;
  member_id: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface Vital {
  id: string;
  type: string;
  value: string;
  unit: string;
  recorded_at: string;
  member_id: string;
}

export interface MenstrualData {
  id: string;
  cycle_start: string;
  cycle_length: number;
  symptoms: string[];
  flow_intensity: string;
  member_id: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  priority: 'primary' | 'secondary';
  family_id: string;
}

export interface HealthGoal {
  id: string;
  title: string;
  target_value: number;
  current_value: number;
  unit: string;
  deadline: string;
  member_id: string;
  completed: boolean;
}

export interface WellnessChallenge {
  id: string;
  name: string;
  description: string;
  progress: number;
  points: number;
  family_progress?: { [key: string]: number };
  participants: string[];
}

export interface Coupon {
  id: string;
  title: string;
  description: string;
  points_required: number;
  category: string;
  expires_at: string;
}

export interface AIHealthInsight {
  risk_level: 'high' | 'low' | 'unknown';
  recommendations: string[];
  predicted_trends: string;
  confidence: number;
}

export type AIInsight = AIHealthInsight;
