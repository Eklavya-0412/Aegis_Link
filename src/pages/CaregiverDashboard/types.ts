export interface CaregiverPatient {
  id: string;
  name: string;
  medication_count: number;
  appointment_count: number;
  linked_at: string;
}

export interface AlertItem {
  id: string;
  patient_name: string;
  priority: 'emergency' | 'high' | 'normal' | 'low';
  message: string;
  created_at: string;
  acknowledged?: boolean;
  /** Built-in demonstration record, not loaded from the server. */
  sample?: boolean;
}

export interface CareTask {
  id: string;
  text: string;
  priority: 'low' | 'normal' | 'high';
  patient?: string;
  completed: boolean;
  /** Built-in demonstration record, not loaded from the server. */
  sample?: boolean;
}

