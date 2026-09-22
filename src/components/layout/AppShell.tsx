import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useAuthStore, useHealthDataStore, useUIStore } from '../../store';
import { useToastStore } from '../../store/toastStore';
import AppHeader from './AppHeader';
import AppSidebar from './AppSidebar';
import LoadingFrame from './LoadingFrame';
import FamilyMemberSelector from './FamilyMemberSelector';
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
import Chatbot from '../../features/chatbot/Chatbot';
import TelemedicineModal from '../../features/telemedicine/TelemedicineModal';
import TelepharmacyModal from '../../features/telepharmacy/TelepharmacyModal';
import PointsStoreModal from '../../features/rewards/PointsStoreModal';
import AISymptomChecker from '../../features/symptom-checker';
import PredictiveHealthInsights from '../../features/insights/PredictiveHealthInsights';

export const AppShell: React.FC = () => {
  const { currentUser, currentFamily, selectedMember, setSelectedMember, logout, setCurrentUser } = useAuthStore();
  const {
    medications,
    setMedications,
    appointments,
    setAppointments,
    vitals,
    setVitals,
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
  const [showSosConfirm, setShowSosConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleSosConfirm = () => {
    showToast('🚨 Family Emergency SOS activated! All contacts and family notified.', 'error');
  };

  const handleLogoutConfirm = () => {
    logout();
    showToast('You have been logged out.', 'info');
  };

  const renderContent = () => {
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
      if (['dashboard', 'tasks', 'patients', 'alerts'].includes(activeTab)) {
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
    if (showFamilyView && (currentUser?.role === 'patient' || currentUser?.role === 'family_member')) {
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
        return (
          <MedicationManager
            selectedMember={selectedMember}
            medications={medications}
            setMedications={setMedications}
          />
        );
      case 'appointments':
        return (
          <AppointmentManager
            selectedMember={selectedMember}
            appointments={appointments}
            setAppointments={setAppointments}
          />
        );
      case 'vitals':
        return <VitalManager selectedMember={selectedMember} vitals={vitals} setVitals={setVitals} />;
      case 'insights':
        return (
          <div className="space-y-6">
            <div className="relative p-[2px] rounded-3xl overflow-hidden">
              <div className="absolute -inset-[2px] bg-gradient-to-r from-purple-400 via-pink-300 to-fuchsia-400 opacity-70 blur" />
              <div className="relative rounded-3xl bg-white/70 dark:bg-gray-800/80 backdrop-blur-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
                      AI Insights
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">Personalized, live health intelligence</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowSymptomChecker(true)}
                      className="relative group rounded-xl px-5 py-3 font-semibold text-white"
                    >
                      <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600" />
                      <span className="absolute -inset-[2px] rounded-xl bg-gradient-to-r from-purple-400/60 to-pink-400/60 blur opacity-70 group-hover:opacity-100 transition" />
                      <span className="relative z-10">Symptom Checker</span>
                    </button>
                    <button
                      onClick={() => setShowPredictiveInsights(true)}
                      className="relative group rounded-xl px-5 py-3 font-semibold text-white"
                    >
                      <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600" />
                      <span className="absolute -inset-[2px] rounded-xl bg-gradient-to-r from-indigo-400/60 to-blue-400/60 blur opacity-70 group-hover:opacity-100 transition" />
                      <span className="relative z-10">Predictive Insights</span>
                    </button>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-white/70 dark:bg-gray-800/70 border border-gray-100 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Risk Level</p>
                    <p className="text-xl font-bold text-purple-700 dark:text-purple-400">{aiInsights?.risk_level || 'low'}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/70 dark:bg-gray-800/70 border border-gray-100 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Confidence</p>
                    <p className="text-xl font-bold text-indigo-700 dark:text-indigo-400">
                      {aiInsights ? `${Math.round(aiInsights.confidence * 100)}%` : '—'}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/70 dark:bg-gray-800/70 border border-gray-100 dark:border-gray-700 md:col-span-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Trend</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{aiInsights?.predicted_trends || 'Stable'}</p>
                  </div>
                </div>

                <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800/60 border border-purple-200 dark:border-gray-700">
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">Recommendations</p>
                  <ul className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2">
                    {(aiInsights?.recommendations || ['Stay hydrated', 'Daily walk 20 min', 'Sleep 7-8h']).map(
                      (rec: string, i: number) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          <span>{rec}</span>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );
      case 'goals':
        return (
          <HealthGoalsManager
            selectedMember={selectedMember}
            healthGoals={healthGoals}
            setHealthGoals={setHealthGoals}
          />
        );
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
    <div className="min-h-screen bg-gradient-to-br from-yellow-50/30 via-blue-50/20 to-green-50/40 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300 pb-20 md:pb-8">
      <AppHeader
        currentUser={currentUser}
        currentFamily={currentFamily}
        selectedMember={selectedMember}
        onOpenSymptomChecker={() => setShowSymptomChecker(true)}
        onOpenTelemedicine={() => setShowTelemedicine(true)}
        onOpenTelepharmacy={() => setShowTelepharmacy(true)}
        onOpenPointsStore={() => setShowPointsStore(true)}
        onLogout={() => setShowLogoutConfirm(true)}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentUser?.role !== 'patient' && (
          <FamilyMemberSelector
            currentFamily={currentFamily}
            currentUser={currentUser}
            selectedMember={selectedMember}
            onSelectMember={setSelectedMember}
          />
        )}

        <div className="flex gap-8">
          <AppSidebar
            currentUser={currentUser}
            currentFamily={currentFamily}
            activeTab={activeTab}
            showFamilyView={showFamilyView}
            onNavigate={navigateTo}
            onToggleFamilyView={() => setShowFamilyView(!showFamilyView)}
          />

          <main className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab + (showFamilyView ? '-family' : '') + (currentUser?.role || '')}
                initial={{ opacity: 0, y: 8, scale: 0.997 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.997 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      <Chatbot
        currentUser={currentUser}
        selectedMember={selectedMember}
        currentFamily={currentFamily}
        medications={medications}
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

      {showTelepharmacy && (
        <TelepharmacyModal onClose={() => setShowTelepharmacy(false)} />
      )}

      {showPointsStore && (
        <PointsStoreModal
          onClose={() => setShowPointsStore(false)}
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
        />
      )}

      {showSymptomChecker && (
        <AISymptomChecker onClose={() => setShowSymptomChecker(false)} />
      )}

      {showPredictiveInsights && (
        <PredictiveHealthInsights onClose={() => setShowPredictiveInsights(false)} />
      )}

      <ConfirmDialog
        isOpen={showSosConfirm}
        onClose={() => setShowSosConfirm(false)}
        onConfirm={handleSosConfirm}
        title="Activate Emergency SOS?"
        message="Are you sure you want to activate the family emergency SOS? This will notify all family members and emergency contacts immediately with your location and recent health vitals."
        confirmText="Activate SOS"
        cancelText="Cancel"
        isDestructive={true}
      />

      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogoutConfirm}
        title="Sign Out"
        message="Are you sure you want to sign out of your Aegis Link account?"
        confirmText="Sign Out"
        cancelText="Stay Logged In"
      />

      <ToastContainer />
    </div>
  );
};

export default AppShell;

