import { apiClient } from './apiClient';

export interface CaregiverCheckin {
  id: string;
  patient_id: string;
  caregiver_id: string;
  caregiver_name?: string;
  visit_type: string;
  notes: string;
  vitals_recorded?: Record<string, any>;
  medications_administered?: string[];
  checkin_time: string;
  created_at: string;
}

export interface TreatmentPlan {
  id: string;
  patient_id: string;
  doctor_id: string;
  doctor_name?: string;
  title: string;
  diagnosis?: string;
  plan_details: string;
  dietary_guidelines?: string;
  prescriptions?: Array<{ name: string; dosage: string; frequency?: string }>;
  status: string;
  created_at: string;
  updated_at?: string;
}

export interface LabPanelItem {
  value: number | string;
  unit: string;
  normal: string;
  status: 'normal' | 'high' | 'low' | 'borderline';
}

export interface LabResultRecord {
  id: string;
  patient_id: string;
  patient_name?: string;
  doctor_name?: string;
  test_name: string;
  category: string;
  test_date: string;
  panel_results: Record<string, Record<string, LabPanelItem>>;
  overall_status: 'normal' | 'borderline' | 'abnormal' | 'critical';
  notes?: string;
  is_encrypted?: boolean;
}

export interface CareTaskRecord {
  id: string;
  patient_id: string;
  caregiver_id?: string;
  patient_name?: string;
  title: string;
  description?: string;
  category: string;
  priority: 'low' | 'normal' | 'high' | 'emergency';
  due_time?: string;
  is_completed: boolean;
  created_at: string;
}

// ── Check-ins (UC11 & UC12) ──────────────────────────────────────────
export const fetchPatientCheckins = async (patientId: string): Promise<CaregiverCheckin[]> => {
  try {
    const { data } = await apiClient.get(`/checkins/patient/${patientId}`);
    return data;
  } catch (err) {
    console.warn('Failed to fetch checkins, returning empty array:', err);
    return [];
  }
};

export const createCaregiverCheckin = async (checkin: {
  patient_id: string;
  visit_type: string;
  notes: string;
  vitals_recorded?: Record<string, any>;
  medications_administered?: string[];
}): Promise<CaregiverCheckin> => {
  const { data } = await apiClient.post('/checkins/', checkin);
  return data;
};

// ── Treatment & Diet Plans (UC8) ─────────────────────────────────────
export const fetchPatientTreatmentPlans = async (patientId: string): Promise<TreatmentPlan[]> => {
  try {
    const { data } = await apiClient.get(`/treatment-plans/patient/${patientId}`);
    return data;
  } catch (err) {
    console.warn('Failed to fetch treatment plans:', err);
    return [];
  }
};

export const createTreatmentPlan = async (plan: {
  patient_id: string;
  title: string;
  diagnosis?: string;
  plan_details: string;
  dietary_guidelines?: string;
  prescriptions?: Array<{ name: string; dosage: string; frequency?: string }>;
}): Promise<TreatmentPlan> => {
  const { data } = await apiClient.post('/treatment-plans/', plan);
  return data;
};

export const updateTreatmentPlan = async (
  planId: string,
  updates: Partial<TreatmentPlan>
): Promise<TreatmentPlan> => {
  const { data } = await apiClient.put(`/treatment-plans/${planId}`, updates);
  return data;
};

// ── Lab Results (UC6 & UC9) ──────────────────────────────────────────
export const fetchPatientLabResults = async (patientId: string): Promise<LabResultRecord[]> => {
  try {
    const { data } = await apiClient.get(`/lab-results/patient/${patientId}`);
    return data;
  } catch (err: any) {
    if (err?.response?.status === 403) {
      throw new Error('CONSENT_REQUIRED');
    }
    console.warn('Failed to fetch lab results:', err);
    return [];
  }
};

// ── Care Tasks ───────────────────────────────────────────────────────
export const fetchCareTasks = async (patientId?: string): Promise<CareTaskRecord[]> => {
  try {
    const url = patientId ? `/tasks/?patient_id=${patientId}` : '/tasks/';
    const { data } = await apiClient.get(url);
    return data;
  } catch (err) {
    console.warn('Failed to fetch care tasks:', err);
    return [];
  }
};

export const createCareTask = async (task: {
  patient_id: string;
  title: string;
  description?: string;
  category?: string;
  priority?: string;
}): Promise<CareTaskRecord> => {
  const { data } = await apiClient.post('/tasks/', task);
  return data;
};

export const toggleCareTask = async (taskId: string, is_completed: boolean): Promise<CareTaskRecord> => {
  const { data } = await apiClient.patch(`/tasks/${taskId}`, { is_completed });
  return data;
};

export const deleteCareTask = async (taskId: string): Promise<void> => {
  await apiClient.delete(`/tasks/${taskId}`);
};

// ── Caretaker & Doctor Medication Management (TC_06) ─────────────────
export const updatePatientMedicationDosage = async (
  patientId: string,
  medicationId: string,
  updates: { dosage?: string; frequency?: string; times?: string[]; notes?: string }
): Promise<any> => {
  const { data } = await apiClient.put(`/medications/patient/${patientId}/${medicationId}`, updates);
  return data;
};

export const prescribePatientMedication = async (
  patientId: string,
  medData: {
    name: string;
    dosage: string;
    frequency?: string;
    time_slots?: string[];
    start_date?: string;
    notes?: string;
  }
): Promise<any> => {
  const { data } = await apiClient.post(`/medications/patient/${patientId}`, medData);
  return data;
};

// ── Access Consent (EXP6 Sequence Diagram) ───────────────────────────
export const checkAccessConsent = async (
  patientId: string,
  granteeId: string,
  scope: string = 'documents'
): Promise<boolean> => {
  try {
    const { data } = await apiClient.get('/consent/check', {
      params: { patient_id: patientId, grantee_id: granteeId, scope },
    });
    return data.allowed === true;
  } catch (err) {
    return false;
  }
};

export const grantAccessConsent = async (
  patientId: string,
  granteeId: string,
  scope: string = '*'
): Promise<any> => {
  const { data } = await apiClient.post('/consent/grant', {
    patient_id: patientId,
    grantee_id: granteeId,
    scope,
  });
  return data;
};
