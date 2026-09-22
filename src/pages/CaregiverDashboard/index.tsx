import React, { useMemo, useState } from 'react';
import { Appointment, Family, Medication, Vital } from '../../types';
import { AlertItem, CaregiverPatient, CareTask } from './types';
import CaregiverOverviewTab from './tabs/CaregiverOverviewTab';
import CaregiverPatientsTab from './tabs/CaregiverPatientsTab';
import CaregiverAlertsTab from './tabs/CaregiverAlertsTab';
import CaregiverTasksTab from './tabs/CaregiverTasksTab';
import PatientDetailModal from './modals/PatientDetailModal';

export interface CaregiverDashboardProps {
  currentFamily: Family | null;
  medications: Medication[];
  appointments: Appointment[];
  vitals: Vital[];
  activeTab?: string;
  navigateTo?: (tabKey: string, label?: string) => void;
}

export const CaregiverDashboard: React.FC<CaregiverDashboardProps> = ({
  currentFamily,
  medications,
  appointments,
  vitals,
  activeTab = 'dashboard',
  navigateTo
}) => {
  const familyPatients = useMemo(
    () => (currentFamily?.members || []).filter((m) => m.role !== 'caregiver' && m.role !== 'doctor'),
    [currentFamily?.members]
  );

  const patients: CaregiverPatient[] = useMemo(
    () =>
      familyPatients.map((m) => ({
        id: m.user_id,
        name: m.name,
        medication_count: medications.filter((x) => x.member_id === m.user_id).length,
        appointment_count: appointments.filter((x) => x.member_id === m.user_id).length,
        linked_at: new Date(Date.now() - Math.floor(Math.random() * 20) * 864e5).toISOString()
      })),
    [familyPatients, medications, appointments]
  );

  const [alerts, setAlerts] = useState<AlertItem[]>([
    { id: 'a1', patient_name: patients[0]?.name || 'Patient', priority: 'high', message: 'Missed morning medication', created_at: new Date().toISOString() },
    { id: 'a2', patient_name: patients[1]?.name || 'Patient', priority: 'normal', message: 'Vital check due', created_at: new Date(Date.now() - 3600e3).toISOString() },
    { id: 'a3', patient_name: patients[2]?.name || 'Patient', priority: 'emergency', message: 'Critical BP reading detected', created_at: new Date(Date.now() - 2 * 3600e3).toISOString() }
  ]);

  const [careTasks, setCareTasks] = useState<CareTask[]>([
    { id: 't1', text: 'Check BP for morning patients', priority: 'high', patient: patients[0]?.name, completed: false },
    { id: 't2', text: 'Refill pill organizer', priority: 'normal', patient: patients[1]?.name, completed: false }
  ]);

  const [showPatientModal, setShowPatientModal] = useState(false);
  const [patientModalId, setPatientModalId] = useState<string>('');

  const adherenceRateData = useMemo(() => patients.map(() => Math.floor(Math.random() * 40) + 60), [patients]);

  const openPatientModal = (id: string) => {
    setPatientModalId(id);
    setShowPatientModal(true);
  };

  const closePatientModal = () => {
    setShowPatientModal(false);
    setPatientModalId('');
  };

  const patientModalMember = familyPatients.find((m) => m.user_id === patientModalId) || null;

  const handleLinkPatient = (linkPid: string) => {
    const member = (currentFamily?.members || []).find(
      (m) => m.patient_id && m.patient_id.toLowerCase() === linkPid.toLowerCase()
    );
    if (member) {
      alert(`Linked to patient ${member.name}`);
    } else {
      alert('No patient found with that Patient ID');
    }
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a)));
    window.alert('Alert acknowledged');
  };

  const handleCreateTaskForPatient = (patientName: string) => {
    setCareTasks((prev) => [
      {
        id: Date.now().toString(),
        text: `Check in with ${patientName}`,
        priority: 'normal',
        patient: patientName,
        completed: false
      },
      ...prev
    ]);
    if (navigateTo) {
      navigateTo('tasks', 'Care Tasks');
    }
  };

  const handleAddTask = (task: { text: string; priority: 'low' | 'normal' | 'high'; patient?: string }) => {
    setCareTasks((prev) => [
      { id: Date.now().toString(), text: task.text, priority: task.priority, patient: task.patient, completed: false },
      ...prev
    ]);
  };

  const handleToggleTask = (id: string) => {
    setCareTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const handleRemoveTask = (id: string) => {
    setCareTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="space-y-8">
      {activeTab === 'patients' && (
        <CaregiverPatientsTab
          patients={patients}
          onLinkPatient={handleLinkPatient}
          onNavigateToAlerts={() => navigateTo && navigateTo('alerts', 'Alerts')}
          onOpenDetails={openPatientModal}
          onCreateTask={handleCreateTaskForPatient}
        />
      )}

      {activeTab === 'alerts' && (
        <CaregiverAlertsTab
          patients={patients}
          alerts={alerts}
          adherenceRateData={adherenceRateData}
          onAcknowledgeAlert={handleAcknowledgeAlert}
        />
      )}

      {activeTab === 'tasks' && (
        <CaregiverTasksTab
          patients={patients}
          careTasks={careTasks}
          onAddTask={handleAddTask}
          onToggleTask={handleToggleTask}
          onRemoveTask={handleRemoveTask}
        />
      )}

      {(!activeTab || activeTab === 'dashboard') && (
        <CaregiverOverviewTab
          patients={patients}
          alerts={alerts}
          adherenceRateData={adherenceRateData}
          onOpenDetails={openPatientModal}
          onCreateTask={handleCreateTaskForPatient}
          onAcknowledgeAlert={handleAcknowledgeAlert}
        />
      )}

      {showPatientModal && patientModalMember && (
        <PatientDetailModal
          patient={patientModalMember}
          medications={medications}
          appointments={appointments}
          vitals={vitals}
          onClose={closePatientModal}
        />
      )}
    </div>
  );
};

export default CaregiverDashboard;

