import { create } from 'zustand';
import { Family, User } from '../types';
import { clearSession, getStoredFamily, getStoredUser, saveSession, saveUser } from '../services/storageService';
import { authenticate, AuthFormData } from '../services/authService';

interface AuthState {
  currentUser: User | null;
  currentFamily: Family | null;
  selectedMember: User | null;
  authMode: 'login' | 'signup';
  loading: boolean;
  showLanding: boolean;

  // Actions
  setCurrentUser: (user: User | null) => void;
  setCurrentFamily: (family: Family | null) => void;
  setSelectedMember: (member: User | null) => void;
  setAuthMode: (mode: 'login' | 'signup') => void;
  setLoading: (loading: boolean) => void;
  setShowLanding: (show: boolean) => void;
  initSession: () => { user: User | null; family: Family | null };
  login: (formData: AuthFormData) => Promise<{ user: User; family: Family | null }>;
  signup: (formData: AuthFormData) => Promise<{ user: User; family: Family | null }>;
  logout: () => void;
  updateUserPoints: (newPoints: number) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: null,
  currentFamily: null,
  selectedMember: null,
  authMode: 'login',
  loading: false,
  showLanding: !getStoredUser(),

  setCurrentUser: (user) => {
    if (user) saveUser(user);
    set({ currentUser: user });
  },

  setCurrentFamily: (family) => set({ currentFamily: family }),

  setSelectedMember: (member) => set({ selectedMember: member }),

  setAuthMode: (mode) => set({ authMode: mode }),

  setLoading: (loading) => set({ loading }),

  setShowLanding: (show) => set({ showLanding: show }),

  initSession: () => {
    const user = getStoredUser();
    const family = getStoredFamily();
    if (user) {
      set({
        currentUser: user,
        currentFamily: family,
        selectedMember: user,
        showLanding: false
      });
    }
    return { user, family };
  },

  login: async (formData) => {
    set({ loading: true });
    try {
      const result = await authenticate(formData, true);
      saveSession(result.user, result.family);
      set({
        currentUser: result.user,
        currentFamily: result.family,
        selectedMember: result.user,
        showLanding: false,
        loading: false
      });
      return result;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  signup: async (formData) => {
    set({ loading: true });
    try {
      const result = await authenticate(formData, false);
      saveSession(result.user, result.family);
      set({
        currentUser: result.user,
        currentFamily: result.family,
        selectedMember: result.user,
        showLanding: false,
        loading: false
      });
      return result;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  logout: () => {
    clearSession();
    set({
      currentUser: null,
      currentFamily: null,
      selectedMember: null,
      showLanding: true,
      authMode: 'login'
    });
  },

  updateUserPoints: (newPoints: number) => {
    const { currentUser } = get();
    if (!currentUser) return;
    const updated = { ...currentUser, points: newPoints };
    saveUser(updated);
    set({ currentUser: updated });
  }
}));

