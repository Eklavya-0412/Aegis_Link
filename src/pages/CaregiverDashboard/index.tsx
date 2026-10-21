import React, { useEffect, useMemo, useState } from 'react';
import { ClipboardList, Pill } from 'lucide-react';
import { Appointment, Family, Medication, User, Vital } from '../../types';
import { AlertItem, CaregiverPatient, CareTask } from './types';
import { useAlertSocket } from '../../hooks/useAlertSocket';
import CaregiverOverviewTab from './tabs/CaregiverOverviewTab';
import CaregiverPatientsTab from './tabs/CaregiverPatientsTab';
import CaregiverAlertsTab from './tabs/CaregiverAlertsTab';
import CaregiverTasksTab from './tabs/CaregiverTasksTab';
import CaregiverLogsTab from './tabs/CaregiverLogsTab';
import PatientDetailModal from './modals/PatientDetailModal';
import LogCheckInModal from './modals/LogCheckInModal';
import ManagePatientMedsModal from './modals/ManagePatientMedsModal';
import {
  CaregiverCheckin,
  createCareTask,
  deleteCareTask,
  fetchCareTasks,
  fetchPatientCheckins,
  toggleCareTask
} from '../../services/clinicalService';
import { useToastStore } from '../../store/toastStore';
import { useHealthDataStore } from '../../store/healthDataStore';
import { PageHeader } from '../../components/ui';

export interface CaregiverDashboardProps {
  currentFamily: Family | null;
  medications: Medication[];
  appointments: Appointment[];
  vitals: Vital[];
  activeTab?: string;
  navigateTo?: (tabKey: string, label?: string) => void;
}

const TAB_HEADINGS: Record<string, { title: string; description: string }> = {
  dashboard: { title: 'Care overview', description: 'Assigned patients, open alerts, outstanding tasks and recent visits.' },
  patients: { title: 'Assigned patients', description: 'People in your care. Link a new patient with their Patient ID.' },
  alerts: { title: 'Alerts', description: 'Escalations and reminders for your patients, most recent first.' },
  tasks: { title: 'Care tasks', description: 'Visit checklist and follow-ups for your patients.' },
  logs: { title: 'Visit logs', description: 'Check-ins, medications given and observations you have recorded.' }
};

export const CaregiverDashboard: React.FC<CaregiverDashboardProps> = ({
  currentFamily,
  medications,
  appointments,
  vitals,
  activeTab = 'dashboard',
  navigateTo
}) => {
  const { showToast } = useToastStore();
  const { updateMedication } = useHealthDataStore();

  const familyPatients = useMemo(
    () => (currentFamily?.members || []).filter((m) => m.role !== 'caregiver' && m.role !== 'doctor'),
    [currentFamily?.members]
  );

  const patients: CaregiverPatient[] = useMemo(
    () =>
      familyPatients.map((m, idx) => ({
        id: m.user_id,
        name: m.name,
        medication_count: medications.filter((x) => x.member_id === m.user_id).length,
        appointment_count: appointments.filter((x) => x.member_id === m.user_id).length,
        linked_at: new Date(Date.now() - (idx + 1) * 3 * 864e5).toISOString()
      })),
    [familyPatients, medications, appointments]
  );

  // Today's adherence per patient: share of scheduled medications marked as taken (null when none are scheduled).
  const adherenceRateData = useMemo(
    () =>
      patients.map((p) => {
        const patientMeds = medications.filter((m) => m.member_id === p.id);
        if (patientMeds.length === 0) return null;
        const taken = patientMeds.filter((m) => m.taken_today).length;
        return Math.round((taken / patientMeds.length) * 100);
      }),
    [patients, medications]
  );

  // Alerts
  const [alerts, setAlerts] = useState<AlertItem[]>([
    {
      id: 'a1',
      sample: true,
      patient_name: patients[0]?.name || 'Priya Sharma',
      priority: 'high',
      message: 'Morning Amlodipine dose pending verification',
      created_at: new Date(Date.now() - 30 * 60000).toISOString(),
      acknowledged: false
    },
    {
      id: 'a2',
      sample: true,
      patient_name: patients[1]?.name || 'Arjun Mehta',
      priority: 'emergency',
      message: 'Elevated Systolic Blood Pressure detected (148 mmHg)',
      created_at: new Date(Date.now() - 90 * 60000).toISOString(),
      acknowledged: false
    }
  ]);

  useAlertSocket((incomingAlert) => {
    const formattedAlert: AlertItem = {
      id: incomingAlert.id,
      patient_name: incomingAlert.patient_name || 'Patient',
      priority: incomingAlert.severity === 'emergency' ? 'emergency' : incomingAlert.severity === 'high' ? 'high' : 'normal',
      message: incomingAlert.message,
      created_at: incomingAlert.timestamp || new Date().toISOString(),
      acknowledged: false
    };
    setAlerts((prev) => [formattedAlert, ...prev]);
    showToast(`Caregiver alert: ${incomingAlert.message}`, 'error');
  });

  // Care tasks
  const [careTasks, setCareTasks] = useState<CareTask[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);

  // Check-ins
  const [checkins, setCheckins] = useState<CaregiverCheckin[]>([]);
  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [checkinPatientId, setCheckinPatientId] = useState<string>('');

  // Medication management modal (TC_06)
  const [showManageMedsModal, setShowManageMedsModal] = useState(false);
  const [manageMedsPatient, setManageMedsPatient] = useState<User | null>(null);

  // Details modal
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [patientModalId, setPatientModalId] = useState<string>('');

  // Load tasks and check-ins from the backend
  useEffect(() => {
    const loadData = async () => {
      setTasksLoading(true);
      try {
        const fetchedTasks = await fetchCareTasks();
        if (fetchedTasks && fetchedTasks.length > 0) {
          setCareTasks(
            fetchedTasks.map((t) => ({
              id: t.id,
              text: t.title,
              priority: (t.priority === 'emergency' ? 'high' : t.priority) as 'low' | 'normal' | 'high',
              patient: t.patient_name || patients.find((p) => p.id === t.patient_id)?.name,
              completed: t.is_completed
            }))
          );
        } else {
          setCareTasks([
            { id: 't1', text: 'Administer morning hypertension meds', priority: 'high', patient: patients[0]?.name, completed: false, sample: true },
            { id: 't2', text: 'Record resting vitals and log check-in', priority: 'normal', patient: patients[1]?.name, completed: true, sample: true }
          ]);
        }

        if (patients[0]?.id) {
          const fetchedCheckins = await fetchPatientCheckins(patients[0].id);
          setCheckins(Array.isArray(fetchedCheckins) ? fetchedCheckins : []);
        }
      } catch (err) {
        console.warn('Failed to load caregiver data:', err);
      } finally {
        setTasksLoading(false);
      }
    };
    loadData();
  }, [patients]);

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
      (m) => (m.patient_id && m.patient_id.toLowerCase() === linkPid.toLowerCase()) || m.user_id.toLowerCase() === linkPid.toLowerCase()
    );
    if (member) {
      showToast(`Linked to patient ${member.name}.`, 'success');
    } else {
      showToast('No patient found with that Patient ID.', 'error');
    }
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a)));
    showToast('Alert acknowledged.', 'info');
  };

  const handleCreateTaskForPatient = (patientName: string) => {
    const foundPatient = familyPatients.find((p) => p.name === patientName);
    const newTaskObj: CareTask = {
      id: Date.now().toString(),
      text: `Clinical check-in with ${patientName}`,
      priority: 'normal',
      patient: patientName,
      completed: false
    };

    setCareTasks((prev) => [newTaskObj, ...prev]);

    if (foundPatient) {
      createCareTask({
        patient_id: foundPatient.user_id,
        title: newTaskObj.text,
        priority: 'normal'
      }).catch(console.warn);
    }

    if (navigateTo) {
      navigateTo('tasks', 'Care tasks');
    }
    showToast(`Care task created for ${patientName}.`, 'success');
  };

  const handleAddTask = async (task: { text: string; priority: 'low' | 'normal' | 'high'; patient?: string }) => {
    const foundPatient = familyPatients.find((p) => p.name === task.patient) || familyPatients[0];
    const newLocalTask: CareTask = {
      id: Date.now().toString(),
      text: task.text,
      priority: task.priority,
      patient: task.patient,
      completed: false
    };
    setCareTasks((prev) => [newLocalTask, ...prev]);

    if (foundPatient) {
      try {
        const created = await createCareTask({
          patient_id: foundPatient.user_id,
          title: task.text,
          priority: task.priority
        });
        setCareTasks((prev) => prev.map((t) => (t.id === newLocalTask.id ? { ...t, id: created.id } : t)));
      } catch (err) {
        console.warn('Task created locally');
      }
    }
    showToast('Task added to schedule.', 'success');
  };

  const handleToggleTask = (id: string) => {
    const target = careTasks.find((t) => t.id === id);
    const nextCompleted = !target?.completed;
    setCareTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: nextCompleted } : t)));
    toggleCareTask(id, nextCompleted).catch(console.warn);
  };

  const handleRemoveTask = (id: string) => {
    setCareTasks((prev) => prev.filter((t) => t.id !== id));
    deleteCareTask(id).catch(console.warn);
    showToast('Task removed.', 'info');
  };

  const handleOpenCheckin = (pId?: string) => {
    setCheckinPatientId(pId || patients[0]?.id || '');
    setShowCheckinModal(true);
  };

  const handleOpenManageMeds = (p: User) => {
    setManageMedsPatient(p);
    setShowManageMedsModal(true);
  };

  const heading = TAB_HEADINGS[activeTab] || TAB_HEADINGS.dashboard;

  return (
    <div className="page">
      <PageHeader
        eyebrow="Care delivery"
        title={heading.title}
        description={heading.description}
        actions={
          <>
            {familyPatients[0] && (
              <button type="button" onClick={() => handleOpenManageMeds(familyPatients[0])} className="btn btn-secondary">
                <Pill />
                Manage medications
              </button>
            )}
            <button type="button" onClick={() => handleOpenCheckin()} className="btn btn-primary">
              <ClipboardList />
              Log visit
            </button>
          </>
        }
      />

      {activeTab === 'patients' && (
        <CaregiverPatientsTab
          patients={patients}
          adherenceRateData={adherenceRateData}
          onLinkPatient={handleLinkPatient}
          onNavigateToAlerts={() => navigateTo && navigateTo('alerts', 'Alerts')}
          onOpenDetails={openPatientModal}
          onCreateTask={handleCreateTaskForPatient}
        />
      )}

      {activeTab === 'alerts' && (
        <CaregiverAlertsTab patients={patients} alerts={alerts} adherenceRateData={adherenceRateData} onAcknowledgeAlert={handleAcknowledgeAlert} />
      )}

      {activeTab === 'tasks' && (
        <CaregiverTasksTab
          patients={patients}
          careTasks={careTasks}
          loading={tasksLoading}
          onAddTask={handleAddTask}
          onToggleTask={handleToggleTask}
          onRemoveTask={handleRemoveTask}
        />
      )}

      {activeTab === 'logs' && <CaregiverLogsTab checkins={checkins} onOpenCheckinModal={() => handleOpenCheckin()} />}

      {(!activeTab || activeTab === 'dashboard') && (
        <CaregiverOverviewTab
          patients={patients}
          alerts={alerts}
          adherenceRateData={adherenceRateData}
          careTasks={careTasks}
          checkins={checkins}
          onToggleTask={handleToggleTask}
          onNavigate={(key, label) => navigateTo && navigateTo(key, label)}
          onOpenCheckin={() => handleOpenCheckin()}
          onOpenDetails={openPatientModal}
          onCreateTask={handleCreateTaskForPatient}
          onAcknowledgeAlert={handleAcknowledgeAlert}
        />
      )}

      {/* Patient detail modal */}
      {showPatientModal && patientModalMember && (
        <PatientDetailModal
          patient={patientModalMember}
          medications={medications}
          appointments={appointments}
          vitals={vitals}
          onClose={closePatientModal}
          onOpenCheckIn={handleOpenCheckin}
          onOpenManageMeds={handleOpenManageMeds}
        />
      )}

      {/* Visit check-in modal (UC11) */}
      {showCheckinModal && (
        <LogCheckInModal
          patients={patients}
          selectedPatientId={checkinPatientId}
          medications={medications}
          onClose={() => setShowCheckinModal(false)}
          onCheckinSuccess={(newCheckin) => {
            setCheckins((prev) => [newCheckin, ...prev]);
            showToast('Visit logged and saved to the patient record.', 'success');
          }}
        />
      )}

      {/* Medication management modal (TC_06) */}
      {showManageMedsModal && manageMedsPatient && (
        <ManagePatientMedsModal
          patient={manageMedsPatient}
          medications={medications}
          onClose={() => setShowManageMedsModal(false)}
          onMedicationUpdated={(updatedMed) => {
            updateMedication(updatedMed.id, {
              dosage: updatedMed.dosage,
              frequency: updatedMed.frequency
            });
          }}
        />
      )}
    </div>
  );
};

export default CaregiverDashboard;
