export interface LabPanelItem {
  value: number;
  unit: string;
  normal: string;
  status: 'normal' | 'high' | 'low' | 'borderline';
}

export interface LabResult {
  id: string;
  patient_id: string;
  patient_name: string;
  test_date: string;
  ordered_by: string;
  results: {
    cbc?: Record<string, LabPanelItem>;
    metabolic?: Record<string, LabPanelItem>;
    lipid?: Record<string, LabPanelItem>;
  };
}

export interface TreatmentPlan {
  id: string;
  patient_id: string;
  text: string;
  created_at: string;
}

