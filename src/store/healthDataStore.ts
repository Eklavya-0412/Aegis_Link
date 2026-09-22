import { create } from 'zustand';
import {
  Appointment,
  EmergencyContact,
  Family,
  HealthGoal,
  Medication,
  MenstrualData,
  User,
  Vital,
  WellnessChallenge
} from '../types';
import { initializeSampleData, SampleData } from '../data/initializeSampleData';
import { AIHealthInsight, getAIHealthInsight } from '../services/aiInsightsService';

interface HealthDataState {
  medications: Medication[];
  appointments: Appointment[];
  vitals: Vital[];
  menstrualData: MenstrualData[];
  emergencyContacts: EmergencyContact[];
  healthGoals: HealthGoal[];
  wellnessChallenges: WellnessChallenge[];
  aiInsights: AIHealthInsight | null;

  // Actions
  setMedications: (medications: Medication[] | ((prev: Medication[]) => Medication[])) => void;
  addMedication: (medication: Medication) => void;
  updateMedication: (id: string, updates: Partial<Medication>) => void;
  deleteMedication: (id: string) => void;

  setAppointments: (appointments: Appointment[] | ((prev: Appointment[]) => Appointment[])) => void;
  addAppointment: (appointment: Appointment) => void;
  cancelAppointment: (id: string) => void;

  setVitals: (vitals: Vital[] | ((prev: Vital[]) => Vital[])) => void;
  addVital: (vital: Vital) => void;

  setMenstrualData: (data: MenstrualData[] | ((prev: MenstrualData[]) => MenstrualData[])) => void;
  addMenstrualData: (record: MenstrualData) => void;

  setEmergencyContacts: (contacts: EmergencyContact[] | ((prev: EmergencyContact[]) => EmergencyContact[])) => void;
  addEmergencyContact: (contact: EmergencyContact) => void;
  deleteEmergencyContact: (id: string) => void;

  setHealthGoals: (goals: HealthGoal[] | ((prev: HealthGoal[]) => HealthGoal[])) => void;
  addHealthGoal: (goal: HealthGoal) => void;
  updateHealthGoalProgress: (id: string, progress: number) => void;

  setWellnessChallenges: (challenges: WellnessChallenge[] | ((prev: WellnessChallenge[]) => WellnessChallenge[])) => void;
  addWellnessChallenge: (challenge: WellnessChallenge) => void;
  updateChallengeProgress: (id: string, progress: number, memberId?: string) => void;

  setAiInsights: (insights: AIHealthInsight | null) => void;
  fetchAiInsights: (user: User) => Promise<AIHealthInsight>;
  loadSampleData: (user: User, family: Family | null) => SampleData;
  resetHealthData: () => void;
}

export const useHealthDataStore = create<HealthDataState>((set, get) => ({
  medications: [],
  appointments: [],
  vitals: [],
  menstrualData: [],
  emergencyContacts: [],
  healthGoals: [],
  wellnessChallenges: [],
  aiInsights: null,

  setMedications: (updater) =>
    set((state) => ({
      medications: typeof updater === 'function' ? updater(state.medications) : updater
    })),

  addMedication: (medication) =>
    set((state) => ({ medications: [...state.medications, medication] })),

  updateMedication: (id, updates) =>
    set((state) => ({
      medications: state.medications.map((m) => (m.id === id ? { ...m, ...updates } : m))
    })),

  deleteMedication: (id) =>
    set((state) => ({
      medications: state.medications.filter((m) => m.id !== id)
    })),

  setAppointments: (updater) =>
    set((state) => ({
      appointments: typeof updater === 'function' ? updater(state.appointments) : updater
    })),

  addAppointment: (appointment) =>
    set((state) => ({ appointments: [...state.appointments, appointment] })),

  cancelAppointment: (id) =>
    set((state) => ({
      appointments: state.appointments.map((a) =>
        a.id === id ? { ...a, status: 'cancelled' as const } : a
      )
    })),

  setVitals: (updater) =>
    set((state) => ({
      vitals: typeof updater === 'function' ? updater(state.vitals) : updater
    })),

  addVital: (vital) =>
    set((state) => ({ vitals: [vital, ...state.vitals] })),

  setMenstrualData: (updater) =>
    set((state) => ({
      menstrualData: typeof updater === 'function' ? updater(state.menstrualData) : updater
    })),

  addMenstrualData: (record) =>
    set((state) => ({ menstrualData: [record, ...state.menstrualData] })),

  setEmergencyContacts: (updater) =>
    set((state) => ({
      emergencyContacts: typeof updater === 'function' ? updater(state.emergencyContacts) : updater
    })),

  addEmergencyContact: (contact) =>
    set((state) => ({ emergencyContacts: [...state.emergencyContacts, contact] })),

  deleteEmergencyContact: (id) =>
    set((state) => ({
      emergencyContacts: state.emergencyContacts.filter((c) => c.id !== id)
    })),

  setHealthGoals: (updater) =>
    set((state) => ({
      healthGoals: typeof updater === 'function' ? updater(state.healthGoals) : updater
    })),

  addHealthGoal: (goal) =>
    set((state) => ({ healthGoals: [...state.healthGoals, goal] })),

  updateHealthGoalProgress: (id, progress) =>
    set((state) => ({
      healthGoals: state.healthGoals.map((g) =>
        g.id === id ? { ...g, current_value: progress, completed: progress >= g.target_value } : g
      )
    })),

  setWellnessChallenges: (updater) =>
    set((state) => ({
      wellnessChallenges: typeof updater === 'function' ? updater(state.wellnessChallenges) : updater
    })),

  addWellnessChallenge: (challenge) =>
    set((state) => ({ wellnessChallenges: [...state.wellnessChallenges, challenge] })),

  updateChallengeProgress: (id, progress, memberId) =>
    set((state) => ({
      wellnessChallenges: state.wellnessChallenges.map((c) => {
        if (c.id !== id) return c;
        const newFamProgress = { ...c.family_progress };
        if (memberId) {
          newFamProgress[memberId] = progress;
        }
        return { ...c, progress, family_progress: newFamProgress };
      })
    })),

  setAiInsights: (insights) => set({ aiInsights: insights }),

  fetchAiInsights: async (user: User) => {
    const { vitals } = get();
    const memberVitals = vitals.filter((v) => v.member_id === user.user_id);
    const insights = await getAIHealthInsight(memberVitals, [], user);
    set({ aiInsights: insights });
    return insights;
  },

  loadSampleData: (user: User, family: Family | null) => {
    const data = initializeSampleData(user, family);
    set({
      medications: data.medications,
      appointments: data.appointments,
      vitals: data.vitals,
      emergencyContacts: data.emergencyContacts,
      healthGoals: data.healthGoals,
      wellnessChallenges: data.wellnessChallenges,
      menstrualData: data.menstrualData
    });
    get().fetchAiInsights(user);
    return data;
  },

  resetHealthData: () =>
    set({
      medications: [],
      appointments: [],
      vitals: [],
      menstrualData: [],
      emergencyContacts: [],
      healthGoals: [],
      wellnessChallenges: [],
      aiInsights: null
    })
}));

