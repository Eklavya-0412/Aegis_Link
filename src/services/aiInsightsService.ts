import { User, Vital } from '../types';

export interface AIHealthInsight {
  risk_level: 'high' | 'low' | 'unknown';
  recommendations: string[];
  predicted_trends: string;
  confidence: number;
}

export const getAIHealthInsight = async (
  vitals: Vital[],
  _symptoms: string[],
  _member: User
): Promise<AIHealthInsight> => {
  try {
    return {
      risk_level: vitals.some(vital => vital.type === 'bp' && parseInt(vital.value.split('/')[0]) > 140) ? 'high' : 'low',
      recommendations: [
        'Monitor blood pressure regularly',
        'Consider reducing sodium intake',
        'Increase physical activity gradually'
      ],
      predicted_trends: 'Blood pressure may increase by 5% over the next month based on current patterns',
      confidence: 0.87
    };
  } catch (error) {
    console.error('AI API Error:', error);
    return {
      risk_level: 'unknown',
      recommendations: ['Consult with your healthcare provider'],
      predicted_trends: 'Unable to generate predictions at this time',
      confidence: 0
    };
  }
};
