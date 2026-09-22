import React, { useEffect } from 'react';
import { useAuthStore, useHealthDataStore, useToastStore } from './store';
import { useLiveVitals } from './hooks/useLiveVitals';
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
    signup
  } = useAuthStore();

  const { setVitals, loadSampleData, fetchAiInsights } = useHealthDataStore();
  const { showToast } = useToastStore();

  useEffect(() => {
    const { user, family } = initSession();
    if (user) {
      loadSampleData(user, family);
      fetchAiInsights(user);
    }
  }, [initSession, loadSampleData, fetchAiInsights]);

  useLiveVitals(currentFamily, setVitals);

  const handleAuthSubmit = async (formData: AuthFormData) => {
    try {
      const result = authMode === 'login' ? await login(formData) : await signup(formData);
      loadSampleData(result.user, result.family);
      fetchAiInsights(result.user);
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