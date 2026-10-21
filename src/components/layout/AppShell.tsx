import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore, useHealthDataStore, useUIStore } from '../../store';
import { useToastStore } from '../../store/toastStore';
import AppHeader from './AppHeader';
import AppSidebar from './AppSidebar';
import LoadingFrame from './LoadingFrame';
import { labelForTab } from './navigation';
import ToastContainer from '../common/ToastContainer';
import ConfirmDialog from '../common/ConfirmDialog';
import DoctorDashboard from '../../pages/DoctorDashboard';
import CaregiverDashboard from '../../pages/CaregiverDashboard';
import PatientDashboard from '../../pages/PatientDashboard';
import FamilyDashboard from '../../features/family/FamilyDashboard';
import MedicationManager from '../../features/medications/MedicationManager';
import AppointmentManager from '../../features/appointments/AppointmentManager';
import VitalManager from '../../features/vitals/VitalManager';
import HealthGoalsManager from '../../features/goals/HealthGoalsManager';
import EmergencyContactsManager from '../../features/emergency/EmergencyContactsManager';
import InsightsPanel from '../../features/insights/InsightsPanel';
import MedicalVault from '../../features/vault/MedicalVault';
import ConsentCenter from '../../features/consent/ConsentCenter';
import AuditTrail from '../../features/audit/AuditTrail';
import Chatbot from '../../features/chatbot/Chatbot';
import TelemedicineModal from '../../features/telemedicine/TelemedicineModal';
import TelepharmacyModal from '../../features/telepharmacy/TelepharmacyModal';
import PointsStoreModal from '../../features/rewards/PointsStoreModal';
import AISymptomChecker from '../../features/symptom-checker';
import PredictiveHealthInsights from '../../features/insights/PredictiveHealthInsights';
import { useIdleTimer } from '../../hooks/useIdleTimer';
import IdleWarningModal from '../common/IdleWarningModal';

export const AppShell: React.FC = () => {
  const { currentUser, currentFamily, selectedMember, setSelectedMember, logout, setCurrentUser } = useAuthStore();
  const {
    medications,
    appointments,
    setAppointments,
    vitals,
    healthGoals,
    setHealthGoals,
    emergencyContacts,
    setEmergencyContacts,
    wellnessChallenges,
    menstrualData,
    setMenstrualData,
    aiInsights
  } = useHealthDataStore();

  const {
    activeTab,
    frameLoading,
    showChatbot,
    setShowChatbot,
    showTelemedicine,
    setShowTelemedicine,
    showTelepharmacy,
    setShowTelepharmacy,
    showPointsStore,
    setShowPointsStore,
    showFamilyView,
    setShowFamilyView,
    showSymptomChecker,
    setShowSymptomChecker,
    showPredictiveInsights,
    setShowPredictiveInsights,
    navigateTo
  } = useUIStore();

  const { showToast } = useToastStore();
  const { showWarning, secondsRemaining, extendSession } = useIdleTimer();
  const [showSosConfirm, setShowSosConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Navigation state lives in a global store and would otherwise survive sign-out, landing the
  // next user (possibly in a different role) on a section their role does not have.
  useEffect(() => {
    useUIStore.getState().setActiveTab('dashboard');
    useUIStore.getState().setShowFamilyView(false);
  }, [currentUser?.user_id]);

  const isPersonal = currentUser?.role === 'patient' || currentUser?.role === 'family_member';
  const familyViewActive = showFamilyView && isPersonal;
  const sectionLabel = familyViewActive ? 'Family overview' : labelForTab(currentUser?.role, activeTab);

  const handleSosConfirm = () => {
    showToast('Emergency SOS activated. Your family and emergency contacts have been notified.', 'error');
  };

  const handleLogoutConfirm = () => {
    logout();
    showToast('You have been signed out.', 'info');
  };

  const renderContent = () => {
    // Shared, role-agnostic record screens. Access is enforced server-side.
    if (activeTab === 'audit') {
      return <AuditTrail currentUser={currentUser} />;
    }

    if (currentUser?.role === 'doctor') {
      return (
        <DoctorDashboard
          currentFamily={currentFamily}
          medications={medications}
          appointments={appointments}
          vitals={vitals}
          activeTab={activeTab}
          onOpenTelemedicine={() => setShowTelemedicine(true)}
        />
      );
    }

    if (currentUser?.role === 'caregiver') {
      if (['dashboard', 'tasks', 'patients', 'alerts', 'logs'].includes(activeTab)) {
        return (
          <CaregiverDashboard
            currentFamily={currentFamily}
            medications={medications}
            appointments={appointments}
            vitals={vitals}
            activeTab={activeTab}
            navigateTo={navigateTo}
          />
        );
      }
      if (activeTab === 'family') {
        return (
          <FamilyDashboard
            currentFamily={currentFamily}
            medications={medications}
            appointments={appointments}
            wellnessChallenges={wellnessChallenges}
          />
        );
      }
      if (activeTab === 'emergency') {
        return (
          <EmergencyContactsManager
            currentFamily={currentFamily}
            emergencyContacts={emergencyContacts}
            setEmergencyContacts={setEmergencyContacts}
          />
        );
      }
    }

    // Patient & Family Member
    if (familyViewActive) {
      return (
        <FamilyDashboard
          currentFamily={currentFamily}
          medications={medications}
          appointments={appointments}
          wellnessChallenges={wellnessChallenges}
        />
      );
    }

    switch (activeTab) {
      case 'medications':
        return <MedicationManager selectedMember={selectedMember} />;
      case 'appointments':
        return (
          <AppointmentManager
            selectedMember={selectedMember}
            appointments={appointments}
            setAppointments={setAppointments}
            onOpenTelemedicine={() => setShowTelemedicine(true)}
          />
        );
      case 'vitals':
        return <VitalManager selectedMember={selectedMember} />;
      case 'insights':
        return (
          <InsightsPanel
            aiInsights={aiInsights}
            selectedMember={selectedMember}
            onOpenSymptomChecker={() => setShowSymptomChecker(true)}
            onOpenPredictiveInsights={() => setShowPredictiveInsights(true)}
            onOpenAssistant={() => setShowChatbot(true)}
          />
        );
      case 'goals':
        return <HealthGoalsManager selectedMember={selectedMember} healthGoals={healthGoals} setHealthGoals={setHealthGoals} />;
      case 'vault':
        return <MedicalVault currentUser={currentUser} />;
      case 'consent':
        return <ConsentCenter currentUser={currentUser} currentFamily={currentFamily} />;
      case 'emergency':
        return (
          <EmergencyContactsManager
            currentFamily={currentFamily}
            emergencyContacts={emergencyContacts}
            setEmergencyContacts={setEmergencyContacts}
          />
        );
      default:
        return (
          <PatientDashboard
            currentUser={currentUser}
            selectedMember={selectedMember}
            medications={medications}
            appointments={appointments}
            healthGoals={healthGoals}
            vitals={vitals}
            menstrualData={menstrualData}
            setMenstrualData={setMenstrualData}
            aiInsights={aiInsights}
            navigateTo={navigateTo}
            onEmergencySOS={() => setShowSosConfirm(true)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[80] focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-13 focus:shadow-pop"
      >
        Skip to content
      </a>

      <AppSidebar
        currentUser={currentUser}
        currentFamily={currentFamily}
        activeTab={activeTab}
        showFamilyView={showFamilyView}
        onNavigate={navigateTo}
        onToggleFamilyView={() => setShowFamilyView(!showFamilyView)}
        onLogout={() => setShowLogoutConfirm(true)}
        mobileOpen={mobileNavOpen}
        onMobileOpenChange={setMobileNavOpen}
      />

      <div className="md:pl-sidebar">
        <AppHeader
          currentUser={currentUser}
          currentFamily={currentFamily}
          selectedMember={selectedMember}
          sectionLabel={sectionLabel}
          onSelectMember={setSelectedMember}
          onOpenSymptomChecker={() => setShowSymptomChecker(true)}
          onOpenTelemedicine={() => setShowTelemedicine(true)}
          onOpenTelepharmacy={() => setShowTelepharmacy(true)}
          onOpenPointsStore={() => setShowPointsStore(true)}
          onOpenMobileNav={() => setMobileNavOpen(true)}
        />

        <main id="main-content" className="mx-auto max-w-[1280px] px-4 pb-28 pt-6 sm:px-6 md:pb-12 lg:px-8">
          <motion.div
            key={activeTab + (familyViewActive ? '-family' : '') + (currentUser?.role || '')}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          >
            {renderContent()}
          </motion.div>
        </main>
      </div>

      <Chatbot
        currentUser={currentUser}
        selectedMember={selectedMember}
        currentFamily={currentFamily}
        medications={medications}
        vitals={vitals}
        appointments={appointments}
        showChatbot={showChatbot}
        setShowChatbot={setShowChatbot}
      />

      <LoadingFrame visible={frameLoading.visible} label={frameLoading.label} />

      {showTelemedicine && (
        <TelemedicineModal
          onClose={() => setShowTelemedicine(false)}
          selectedMember={selectedMember}
          appointments={appointments}
          setAppointments={setAppointments}
        />
      )}

      {showTelepharmacy && <TelepharmacyModal onClose={() => setShowTelepharmacy(false)} />}

      {showPointsStore && (
        <PointsStoreModal onClose={() => setShowPointsStore(false)} currentUser={currentUser} setCurrentUser={setCurrentUser} />
      )}

      {showSymptomChecker && <AISymptomChecker onClose={() => setShowSymptomChecker(false)} />}

      {showPredictiveInsights && <PredictiveHealthInsights onClose={() => setShowPredictiveInsights(false)} />}

      <ConfirmDialog
        isOpen={showSosConfirm}
        onClose={() => setShowSosConfirm(false)}
        onConfirm={handleSosConfirm}
        title="Activate emergency SOS?"
        message="This immediately notifies all family members and emergency contacts with your location and most recent vital signs. If this is a medical emergency, also call your local emergency number."
        confirmText="Activate SOS"
        cancelText="Cancel"
        isDestructive
      />

      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogoutConfirm}
        title="Sign out of Aegis Link?"
        message="You'll need to sign in again to view health information."
        confirmText="Sign out"
        cancelText="Stay signed in"
      />

      {showWarning && <IdleWarningModal secondsRemaining={secondsRemaining} onExtend={extendSession} />}

      <ToastContainer />
    </div>
  );
};

export default AppShell;
