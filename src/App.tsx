import React, { useEffect } from 'react';
import { useAuthStore, useHealthDataStore, useToastStore } from './store';
import { useLiveVitals } from './hooks/useLiveVitals';
import { useAlertSocket } from './hooks/useAlertSocket';
import LandingPage from './features/auth/LandingPage';
import AuthForm from './features/auth/AuthForm';
import AppShell from './components/layout/AppShell';
import { AuthFormData } from './services/authService';

const AegisLink: React.FC = () => {
  const {
    currentUser,
    currentFamily,
    authMode,
    setAuthMode,
    loading,
    showLanding,
    setShowLanding,
    initSession,
    login,
    signup,
  } = useAuthStore();

  // fetchAll replaces the old loadSampleData – it fetches real data from FastAPI
  // and falls back to sample data if the backend is unreachable.
  const { setVitals, fetchAll, loadSampleData } = useHealthDataStore();
  const { showToast } = useToastStore();

  // On mount: restore session from refresh token, then load data
  useEffect(() => {
    const runInit = async () => {
      const res = await initSession();
      if (res?.user) {
        const { user, family } = res;
        // fetchAll = parallel fetch of vitals, medications, appointments, menstrual
        fetchAll(user).catch(() => loadSampleData(user, family));
      }
    };
    runInit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useLiveVitals(currentFamily, setVitals);
  useAlertSocket();

  const handleAuthSubmit = async (formData: AuthFormData) => {
    try {
      const result = authMode === 'login' ? await login(formData) : await signup(formData);
      // Load real data from backend; fall back to sample if the call fails
      fetchAll(result.user).catch(() => loadSampleData(result.user, result.family));
    } catch {
      showToast('Authentication failed. Please check your credentials and try again.', 'error');
    }
  };

  if (!currentUser || !currentFamily) {
    if (showLanding) {
      return <LandingPage onGetStarted={() => setShowLanding(false)} />;
    }
    return (
      <AuthForm
        authMode={authMode}
        onAuthModeChange={setAuthMode}
        loading={loading}
        onSubmit={handleAuthSubmit}
      />
    );
  }

  return <AppShell />;
};

export default AegisLink;