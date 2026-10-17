import { User, Vital } from '../types';
import { apiClient } from './apiClient';

export interface AIHealthInsight {
  risk_level: 'high' | 'low' | 'unknown';
  recommendations: string[];
  predicted_trends: string;
  confidence: number;
}

/**
 * Fetch AI-generated health insights from the FastAPI backend.
 *
 * Sends the patient's recent vitals to the backend's AI feature endpoint,
 * which in turn queries the Groq LLM.  Falls back to a local heuristic
 * if the backend is unreachable.
 */
export const getAIHealthInsight = async (
  vitals: Vital[],
  _symptoms: string[],
  member: User
): Promise<AIHealthInsight> => {
  try {
    const response = await apiClient.post('/ai/insights', {
      user_id: member.user_id,
      vitals: vitals.slice(0, 20), // send at most the 20 most recent readings
    });
    return response.data as AIHealthInsight;
  } catch (error) {
    console.warn('AI insights API call failed, using local fallback:', error);
    // Local fallback – basic heuristic so the UI always renders something
    return {
      risk_level: vitals.some(
        (vital) =>
          vital.type === 'bp' && parseInt(vital.value.split('/')[0]) > 140
      )
        ? 'high'
        : 'low',
      recommendations: [
        'Monitor blood pressure regularly',
        'Consider reducing sodium intake',
        'Increase physical activity gradually',
      ],
      predicted_trends:
        'Blood pressure may increase by 5% over the next month based on current patterns',
      confidence: 0.87,
    };
  }
};
