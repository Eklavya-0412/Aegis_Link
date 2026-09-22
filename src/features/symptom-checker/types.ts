export interface BodyPart {
  id: string;
  name: string;
  x: number;
  y: number;
  symptoms: string[];
}

export interface SymptomAssessment {
  severity: 'High' | 'Medium' | 'Low';
  recommendation: string;
  actions: string[];
  color: string;
  bgColor: string;
  confidence: number;
  patterns: string | null;
}

export interface SymptomHistoryEntry {
  symptoms: string[];
  severity: number;
  date: string;
  assessment: SymptomAssessment;
}

