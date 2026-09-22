import { create } from 'zustand';

interface UIState {
  activeTab: string;
  frameLoading: { visible: boolean; label: string };
  showChatbot: boolean;
  showTelemedicine: boolean;
  showTelepharmacy: boolean;
  showPointsStore: boolean;
  showFamilyView: boolean;
  showSymptomChecker: boolean;
  showPredictiveInsights: boolean;

  // Actions
  setActiveTab: (tab: string) => void;
  navigateTo: (tabKey: string, label?: string) => void;
  setFrameLoading: (loading: { visible: boolean; label: string }) => void;
  setShowChatbot: (show: boolean) => void;
  setShowTelemedicine: (show: boolean) => void;
  setShowTelepharmacy: (show: boolean) => void;
  setShowPointsStore: (show: boolean) => void;
  setShowFamilyView: (show: boolean) => void;
  setShowSymptomChecker: (show: boolean) => void;
  setShowPredictiveInsights: (show: boolean) => void;
  closeAllModals: () => void;
}

let navTimeout: number | null = null;

export const useUIStore = create<UIState>((set) => ({
  activeTab: 'dashboard',
  frameLoading: { visible: false, label: '' },
  showChatbot: false,
  showTelemedicine: false,
  showTelepharmacy: false,
  showPointsStore: false,
  showFamilyView: false,
  showSymptomChecker: false,
  showPredictiveInsights: false,

  setActiveTab: (tab) => set({ activeTab: tab }),

  navigateTo: (tabKey, label = 'Loading') => {
    if (navTimeout) {
      clearTimeout(navTimeout);
      navTimeout = null;
    }
    set({ frameLoading: { visible: true, label } });
    navTimeout = window.setTimeout(() => {
      set({ activeTab: tabKey, frameLoading: { visible: false, label: '' } });
      navTimeout = null;
    }, 550);
  },

  setFrameLoading: (frameLoading) => set({ frameLoading }),

  setShowChatbot: (show) => set({ showChatbot: show }),
  setShowTelemedicine: (show) => set({ showTelemedicine: show }),
  setShowTelepharmacy: (show) => set({ showTelepharmacy: show }),
  setShowPointsStore: (show) => set({ showPointsStore: show }),
  setShowFamilyView: (show) => set({ showFamilyView: show }),
  setShowSymptomChecker: (show) => set({ showSymptomChecker: show }),
  setShowPredictiveInsights: (show) => set({ showPredictiveInsights: show }),

  closeAllModals: () =>
    set({
      showChatbot: false,
      showTelemedicine: false,
      showTelepharmacy: false,
      showPointsStore: false,
      showSymptomChecker: false,
      showPredictiveInsights: false
    })
}));

