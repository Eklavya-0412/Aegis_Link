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
  WellnessChallenge,
} from '../types';
import { AIHealthInsight, getAIHealthInsight } from '../services/aiInsightsService';
import { apiClient } from '../services/apiClient';
import { initializeSampleData } from '../data/initializeSampleData';

// ── Loading / Error state per data domain ─────────────────────────────
export interface DomainStatus {
  loading: boolean;
  error: string | null;
}

const idle: DomainStatus = { loading: false, error: null };
const pending: DomainStatus = { loading: true, error: null };
const failed = (msg: string): DomainStatus => ({ loading: false, error: msg });
const done: DomainStatus = { loading: false, error: null };

/**
 * Map a backend Vital (uses `vital_type`, numeric `value`) to the
 * frontend Vital type (uses `type`, string `value`, `member_id`).
 */
function normaliseVital(v: any, userId: string): Vital {
  return {
    id: v.id ?? String(Date.now()),
    type: v.vital_type ?? v.type ?? 'unknown',
    value: String(v.value ?? ''),
    unit: v.unit ?? '',
    recorded_at: v.recorded_at ?? v.created_at ?? new Date().toISOString(),
    member_id: v.user_id ?? v.member_id ?? userId,
  };
}

/**
 * Map a backend Medication to the frontend Medication type.
 * Backend uses `is_active`, `time_slots`, `user_id`.
 */
function normaliseMedication(m: any, userId: string): Medication {
  return {
    id: m.id ?? String(Date.now()),
    name: m.name ?? '',
    dosage: m.dosage ?? '',
    frequency: m.frequency ?? '',
    times: m.time_slots ?? m.times ?? [],
    start_date: m.start_date ?? '',
    end_date: m.end_date,
    active: m.is_active ?? m.active ?? true,
    taken_today: m.taken_today ?? false,
    member_id: m.user_id ?? m.member_id ?? userId,
  };
}

/**
 * Map a backend Appointment to the frontend Appointment type.
 */
function normaliseAppointment(a: any, userId: string): Appointment {
  const dateStr = a.appointment_date
    ? `${a.appointment_date}T${a.appointment_time ?? '00:00:00'}`
    : a.appointment_date ?? '';
  return {
    id: a.id ?? String(Date.now()),
    title: a.title ?? '',
    type: a.type ?? 'doctor',
    doctor_name: a.doctor_name,
    appointment_date: dateStr,
    location: a.location,
    notes: a.notes,
    member_id: a.user_id ?? a.member_id ?? userId,
    status: a.status ?? 'scheduled',
  };
}

// ── Store interface ────────────────────────────────────────────────────
interface HealthDataState {
  medications: Medication[];
  appointments: Appointment[];
  vitals: Vital[];
  menstrualData: MenstrualData[];
  emergencyContacts: EmergencyContact[];
  healthGoals: HealthGoal[];
  wellnessChallenges: WellnessChallenge[];
  aiInsights: AIHealthInsight | null;

  // Async status per domain
  status: {
    vitals: DomainStatus;
    medications: DomainStatus;
    appointments: DomainStatus;
    menstrual: DomainStatus;
  };

  // ── Fetch actions ──────────────────────────────────────────────────
  fetchVitals: (userId: string) => Promise<void>;
  fetchMedications: (userId: string) => Promise<void>;
  fetchAppointments: (userId: string) => Promise<void>;
  fetchMenstrual: (userId: string) => Promise<void>;
  fetchAll: (user: User) => Promise<void>;

  // ── Setter / CRUD actions ──────────────────────────────────────────
  setMedications: (medications: Medication[] | ((prev: Medication[]) => Medication[])) => void;
  addMedication: (medication: Medication) => Promise<void>;
  updateMedication: (id: string, updates: Partial<Medication>) => Promise<void>;
  deleteMedication: (id: string) => Promise<void>;

  setAppointments: (appointments: Appointment[] | ((prev: Appointment[]) => Appointment[])) => void;
  addAppointment: (appointment: Appointment) => Promise<void>;
  cancelAppointment: (id: string) => Promise<void>;

  setVitals: (vitals: Vital[] | ((prev: Vital[]) => Vital[])) => void;
  addVital: (vital: Vital) => Promise<void>;

  setMenstrualData: (data: MenstrualData[] | ((prev: MenstrualData[]) => MenstrualData[])) => void;
  addMenstrualData: (record: MenstrualData) => Promise<void>;

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

  /**
   * @deprecated Use `fetchAll(user)` instead.
   * Kept for compatibility during migration; uses sample fallback.
   */
  loadSampleData: (user: User, family: Family | null) => any;
  resetHealthData: () => void;
}

// ═══════════════════════════════════════════════════════════════════════
export const useHealthDataStore = create<HealthDataState>((set, get) => ({
  medications: [],
  appointments: [],
  vitals: [],
  menstrualData: [],
  emergencyContacts: [],
  healthGoals: [],
  wellnessChallenges: [],
  aiInsights: null,

  status: {
    vitals: idle,
    medications: idle,
    appointments: idle,
    menstrual: idle,
  },

  // ── Fetch: Vitals ──────────────────────────────────────────────────
  fetchVitals: async (userId: string) => {
    set((s) => ({ status: { ...s.status, vitals: pending } }));
    try {
      const { data } = await apiClient.get('/vitals');
      const rows: Vital[] = Array.isArray(data)
        ? data.map((v: any) => normaliseVital(v, userId))
        : [];
      set((s) => ({
        vitals: rows,
        status: { ...s.status, vitals: done },
      }));
    } catch (err: any) {
      const msg = err?.response?.data?.detail ?? err?.message ?? 'Failed to load vitals';
      set((s) => ({ status: { ...s.status, vitals: failed(msg) } }));
    }
  },

  // ── Fetch: Medications ─────────────────────────────────────────────
  fetchMedications: async (userId: string) => {
    set((s) => ({ status: { ...s.status, medications: pending } }));
    try {
      const { data } = await apiClient.get('/medications');
      const rows: Medication[] = Array.isArray(data)
        ? data.map((m: any) => normaliseMedication(m, userId))
        : [];
      set((s) => ({
        medications: rows,
        status: { ...s.status, medications: done },
      }));
    } catch (err: any) {
      const msg = err?.response?.data?.detail ?? err?.message ?? 'Failed to load medications';
      set((s) => ({ status: { ...s.status, medications: failed(msg) } }));
    }
  },

  // ── Fetch: Appointments ────────────────────────────────────────────
  fetchAppointments: async (userId: string) => {
    set((s) => ({ status: { ...s.status, appointments: pending } }));
    try {
      const { data } = await apiClient.get('/appointments');
      const rows: Appointment[] = Array.isArray(data)
        ? data.map((a: any) => normaliseAppointment(a, userId))
        : [];
      set((s) => ({
        appointments: rows,
        status: { ...s.status, appointments: done },
      }));
    } catch (err: any) {
      const msg = err?.response?.data?.detail ?? err?.message ?? 'Failed to load appointments';
      set((s) => ({ status: { ...s.status, appointments: failed(msg) } }));
    }
  },

  // ── Fetch: Menstrual ───────────────────────────────────────────────
  fetchMenstrual: async (userId: string) => {
    set((s) => ({ status: { ...s.status, menstrual: pending } }));
    try {
      const { data } = await apiClient.get('/menstrual');
      const rows: MenstrualData[] = Array.isArray(data) ? data : [];
      set((s) => ({
        menstrualData: rows,
        status: { ...s.status, menstrual: done },
      }));
    } catch (err: any) {
      const msg = err?.response?.data?.detail ?? err?.message ?? 'Failed to load menstrual data';
      set((s) => ({ status: { ...s.status, menstrual: failed(msg) } }));
    }
  },

  // ── Fetch all in parallel ──────────────────────────────────────────
  fetchAll: async (user: User) => {
    const uid = user.user_id;
    await Promise.all([
      get().fetchVitals(uid),
      get().fetchMedications(uid),
      get().fetchAppointments(uid),
      get().fetchMenstrual(uid),
      get().fetchAiInsights(user),
    ]);
  },

  // ── Medication CRUD ────────────────────────────────────────────────
  setMedications: (updater) =>
    set((s) => ({
      medications: typeof updater === 'function' ? updater(s.medications) : updater,
    })),

  addMedication: async (medication) => {
    // Optimistic update
    set((s) => ({ medications: [...s.medications, medication] }));
    try {
      await apiClient.post('/medications', medication);
    } catch (e) {
      console.warn('API sync failed for addMedication:', e);
    }
  },

  updateMedication: async (id, updates) => {
    set((s) => ({
      medications: s.medications.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    }));
    try {
      await apiClient.put(`/medications/${id}`, updates);
    } catch (e) {
      console.warn('API sync failed for updateMedication:', e);
    }
  },

  deleteMedication: async (id) => {
    set((s) => ({ medications: s.medications.filter((m) => m.id !== id) }));
    try {
      await apiClient.delete(`/medications/${id}`);
    } catch (e) {
      console.warn('API sync failed for deleteMedication:', e);
    }
  },

  // ── Appointment CRUD ───────────────────────────────────────────────
  setAppointments: (updater) =>
    set((s) => ({
      appointments: typeof updater === 'function' ? updater(s.appointments) : updater,
    })),

  addAppointment: async (appointment) => {
    set((s) => ({ appointments: [...s.appointments, appointment] }));
    try {
      await apiClient.post('/appointments', appointment);
    } catch (e) {
      console.warn('API sync failed for addAppointment:', e);
    }
  },

  cancelAppointment: async (id) => {
    set((s) => ({
      appointments: s.appointments.map((a) =>
        a.id === id ? { ...a, status: 'cancelled' as const } : a
      ),
    }));
    try {
      await apiClient.put(`/appointments/${id}`, { status: 'cancelled' });
    } catch (e) {
      console.warn('API sync failed for cancelAppointment:', e);
    }
  },

  // ── Vitals CRUD ────────────────────────────────────────────────────
  setVitals: (updater) =>
    set((s) => ({
      vitals: typeof updater === 'function' ? updater(s.vitals) : updater,
    })),

  addVital: async (vital) => {
    set((s) => ({ vitals: [vital, ...s.vitals] }));
    try {
      await apiClient.post('/vitals', vital);
    } catch (e) {
      console.warn('API sync failed for addVital:', e);
    }
  },

  // ── Menstrual CRUD ─────────────────────────────────────────────────
  setMenstrualData: (updater) =>
    set((s) => ({
      menstrualData: typeof updater === 'function' ? updater(s.menstrualData) : updater,
    })),

  addMenstrualData: async (record) => {
    set((s) => ({ menstrualData: [record, ...s.menstrualData] }));
    try {
      await apiClient.post('/menstrual', record);
    } catch (e) {
      console.warn('API sync failed for addMenstrualData:', e);
    }
  },

  // ── Emergency contacts (local only) ───────────────────────────────
  setEmergencyContacts: (updater) =>
    set((s) => ({
      emergencyContacts: typeof updater === 'function' ? updater(s.emergencyContacts) : updater,
    })),
  addEmergencyContact: (contact) =>
    set((s) => ({ emergencyContacts: [...s.emergencyContacts, contact] })),
  deleteEmergencyContact: (id) =>
    set((s) => ({ emergencyContacts: s.emergencyContacts.filter((c) => c.id !== id) })),

  // ── Health Goals (local only) ──────────────────────────────────────
  setHealthGoals: (updater) =>
    set((s) => ({
      healthGoals: typeof updater === 'function' ? updater(s.healthGoals) : updater,
    })),
  addHealthGoal: (goal) =>
    set((s) => ({ healthGoals: [...s.healthGoals, goal] })),
  updateHealthGoalProgress: (id, progress) =>
    set((s) => ({
      healthGoals: s.healthGoals.map((g) =>
        g.id === id ? { ...g, current_value: progress, completed: progress >= g.target_value } : g
      ),
    })),

  // ── Wellness challenges (local only) ──────────────────────────────
  setWellnessChallenges: (updater) =>
    set((s) => ({
      wellnessChallenges: typeof updater === 'function' ? updater(s.wellnessChallenges) : updater,
    })),
  addWellnessChallenge: (challenge) =>
    set((s) => ({ wellnessChallenges: [...s.wellnessChallenges, challenge] })),
  updateChallengeProgress: (id, progress, memberId) =>
    set((s) => ({
      wellnessChallenges: s.wellnessChallenges.map((c) => {
        if (c.id !== id) return c;
        const fp = { ...c.family_progress };
        if (memberId) fp[memberId] = progress;
        return { ...c, progress, family_progress: fp };
      }),
    })),

  // ── AI insights ────────────────────────────────────────────────────
  setAiInsights: (insights) => set({ aiInsights: insights }),

  fetchAiInsights: async (user: User) => {
    const { vitals } = get();
    const memberVitals = vitals.filter((v) => v.member_id === user.user_id);
    const insights = await getAIHealthInsight(memberVitals, [], user);
    set({ aiInsights: insights });
    return insights;
  },

  // ── loadSampleData (legacy compatibility) ──────────────────────────
  loadSampleData: (user: User, family: Family | null) => {
    const sample = initializeSampleData(user, family);
    // Set local-only data immediately
    set({
      emergencyContacts: sample.emergencyContacts,
      healthGoals: sample.healthGoals,
      wellnessChallenges: sample.wellnessChallenges,
      menstrualData: sample.menstrualData,
    });
    // Kick off async fetch from backend (will replace sample data if successful)
    get().fetchAll(user).catch(console.warn);
    return sample;
  },

  // ── Reset ──────────────────────────────────────────────────────────
  resetHealthData: () =>
    set({
      medications: [],
      appointments: [],
      vitals: [],
      menstrualData: [],
      emergencyContacts: [],
      healthGoals: [],
      wellnessChallenges: [],
      aiInsights: null,
      status: { vitals: idle, medications: idle, appointments: idle, menstrual: idle },
    }),
}));
