import React, { useEffect, useState } from 'react';
import { FileText, Loader2, Lock, ShieldCheck, Video } from 'lucide-react';
import { PageHeader } from '../../components/ui';
import { describeApiError } from '../../services/governanceService';
import { Appointment, Family, Medication, User, Vital } from '../../types';
import { LabResult } from './types';
import DoctorOverviewTab from './tabs/DoctorOverviewTab';
import DoctorPatientsTab from './tabs/DoctorPatientsTab';
import DoctorTelemedicineTab from './tabs/DoctorTelemedicineTab';
import DoctorTreatmentsTab, { TreatmentPlanItem } from './tabs/DoctorTreatmentsTab';
import LabResultsModal from './modals/LabResultsModal';
import PrescriptionModal from './modals/PrescriptionModal';
import CreatePlanModal from './modals/CreatePlanModal';
import {
  checkAccessConsent,
  createTreatmentPlan,
  fetchPatientLabResults,
  fetchPatientTreatmentPlans,
  grantAccessConsent,
  prescribePatientMedication
} from '../../services/clinicalService';
import { useAuthStore } from '../../store/authStore';
import { useHealthDataStore } from '../../store/healthDataStore';
import { useToastStore } from '../../store/toastStore';

export interface DoctorDashboardProps {
  currentFamily: Family | null;
  medications: Medication[];
  appointments: Appointment[];
  vitals: Vital[];
  activeTab?: string;
  onOpenTelemedicine?: () => void;
}

const INITIAL_LAB_RESULTS: LabResult[] = [
  {
    id: 'lab_01',
    sample: true,
    patient_id: 'user1',
    patient_name: 'Priya Sharma',
    test_date: '2025-09-10T10:30:00',
    ordered_by: 'Dr. Ananya Iyer',
    results: {
      cbc: {
        wbc: { value: 6.2, unit: 'K/μL', normal: '4.0-10.0', status: 'normal' },
        rbc: { value: 4.8, unit: 'M/μL', normal: '4.2-5.4', status: 'normal' },
        hgb: { value: 13.9, unit: 'g/dL', normal: '12.0-16.0', status: 'normal' },
        hct: { value: 41.2, unit: '%', normal: '36-46', status: 'normal' },
        platelets: { value: 280, unit: 'K/μL', normal: '150-450', status: 'normal' }
      },
      metabolic: {
        glucose: { value: 96, unit: 'mg/dL', normal: '70-100', status: 'normal' },
        creatinine: { value: 0.9, unit: 'mg/dL', normal: '0.6-1.2', status: 'normal' },
        bun: { value: 18, unit: 'mg/dL', normal: '7-20', status: 'normal' },
        sodium: { value: 142, unit: 'mEq/L', normal: '136-145', status: 'normal' },
        potassium: { value: 4.1, unit: 'mEq/L', normal: '3.5-5.0', status: 'normal' }
      },
      lipid: {
        total_cholesterol: { value: 185, unit: 'mg/dL', normal: '<200', status: 'normal' },
        ldl: { value: 110, unit: 'mg/dL', normal: '<100', status: 'borderline' },
        hdl: { value: 48, unit: 'mg/dL', normal: '>40', status: 'normal' },
        triglycerides: { value: 135, unit: 'mg/dL', normal: '<150', status: 'normal' }
      }
    }
  },
  {
    id: 'lab_02',
    sample: true,
    patient_id: 'user2',
    patient_name: 'Arjun Mehta',
    test_date: '2025-09-08T14:15:00',
    ordered_by: 'Dr. Ananya Iyer',
    results: {
      cbc: {
        wbc: { value: 8.5, unit: 'K/μL', normal: '4.0-10.0', status: 'normal' },
        rbc: { value: 4.5, unit: 'M/μL', normal: '4.2-5.4', status: 'normal' },
        hgb: { value: 12.8, unit: 'g/dL', normal: '12.0-16.0', status: 'normal' },
        hct: { value: 38.9, unit: '%', normal: '36-46', status: 'normal' },
        platelets: { value: 320, unit: 'K/μL', normal: '150-450', status: 'normal' }
      },
      metabolic: {
        glucose: { value: 118, unit: 'mg/dL', normal: '70-100', status: 'high' },
        creatinine: { value: 0.8, unit: 'mg/dL', normal: '0.6-1.2', status: 'normal' },
        bun: { value: 22, unit: 'mg/dL', normal: '7-20', status: 'high' },
        sodium: { value: 140, unit: 'mEq/L', normal: '136-145', status: 'normal' },
        potassium: { value: 3.8, unit: 'mEq/L', normal: '3.5-5.0', status: 'normal' }
      }
    }
  }
];

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({
  currentFamily,
  medications,
  appointments,
  vitals,
  activeTab = 'dashboard',
  onOpenTelemedicine
}) => {
  const { currentUser } = useAuthStore();
  const { setMedications } = useHealthDataStore();
  const { showToast } = useToastStore();

  const familyMembers = currentFamily?.members.filter((m) => m.role !== 'doctor') || [];
  const [doctorPatients, setDoctorPatients] = useState<User[]>([]);
  const allPatients = [...familyMembers, ...doctorPatients];

  const [selectedPatient, setSelectedPatient] = useState<User | null>(allPatients[0] || null);
  const [hasConsent, setHasConsent] = useState<boolean>(true);
  const [checkingConsent, setCheckingConsent] = useState<boolean>(false);

  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [showLabResults, setShowLabResults] = useState(false);
  const [showPrescription, setShowPrescription] = useState(false);
  const [showAddPatient, setShowAddPatient] = useState(false);

  const [plans, setPlans] = useState<TreatmentPlanItem[]>([
    {
      id: 'tp_01',
      sample: true,
      patient_id: allPatients[0]?.user_id || 'p1',
      title: 'Hypertension Management & Glycemic Stabilization',
      diagnosis: 'Stage 1 Hypertension & Impaired Fasting Glucose',
      plan_details: 'Maintain low-sodium DASH diet. Continue twice-daily BP logging. Target resting BP < 130/80 mmHg.',
      dietary_guidelines: 'Restrict sodium to < 2.0g daily. Increase dark leafy greens, whole grains, and lean poultry.',
      status: 'active',
      created_at: new Date(Date.now() - 4 * 864e5).toISOString()
    }
  ]);

  const [labResults, setLabResults] = useState<LabResult[]>(INITIAL_LAB_RESULTS);

  // Check consent when selected patient changes (EXP6 Sequence Diagram Phase 2)
  useEffect(() => {
    if (!selectedPatient || !currentUser) return;
    const verifyConsent = async () => {
      setCheckingConsent(true);
      try {
        const permitted = await checkAccessConsent(selectedPatient.user_id, currentUser.user_id, '*');
        setHasConsent(permitted !== false);

        // Fetch patient plans from backend
        const remotePlans = await fetchPatientTreatmentPlans(selectedPatient.user_id);
        if (remotePlans && remotePlans.length > 0) {
          setPlans(remotePlans.map((rp) => ({
            id: rp.id,
            patient_id: rp.patient_id,
            doctor_id: rp.doctor_id,
            doctor_name: rp.doctor_name,
            title: rp.title,
            diagnosis: rp.diagnosis,
            plan_details: rp.plan_details,
            dietary_guidelines: rp.dietary_guidelines,
            status: rp.status,
            created_at: rp.created_at
          })));
        }

        // Fetch lab results
        const remoteLabs = await fetchPatientLabResults(selectedPatient.user_id);
        if (remoteLabs && remoteLabs.length > 0) {
          setLabResults((prev) => [
            ...remoteLabs.map((l) => ({
              id: l.id,
              patient_id: l.patient_id,
              patient_name: l.patient_name || selectedPatient.name,
              test_date: l.test_date,
              ordered_by: l.doctor_name || 'Dr. Ananya Iyer',
              results: l.panel_results as any
            })),
            ...prev
          ]);
        }
      } catch (err: any) {
        if (err?.message === 'CONSENT_REQUIRED') {
          setHasConsent(false);
        }
      } finally {
        setCheckingConsent(false);
      }
    };
    verifyConsent();
  }, [selectedPatient, currentUser]);

  const handleGrantConsentSimulation = async () => {
    if (!selectedPatient || !currentUser) return;
    try {
      await grantAccessConsent(selectedPatient.user_id, currentUser.user_id, '*');
      setHasConsent(true);
      showToast(`Access consent granted by ${selectedPatient.name}.`, 'success');
    } catch (err) {
      // The server only accepts consent granted by the patient themself; never show access as granted when it refused.
      showToast(
        `Consent was not recorded: ${describeApiError(err).message} ${selectedPatient.name} can grant access from their Consent & access page.`,
        'warning'
      );
    }
  };

  const handleAddPatientByCode = (code: string) => {
    const mockPatient: User = {
      user_id: `patient_${Date.now()}`,
      name: `Patient ${code.toUpperCase()}`,
      age: 45,
      email: `patient.${code.toLowerCase()}@aegislink.demo`,
      role: 'patient',
      relationship: 'patient',
      code,
      gender: 'male',
      family_id: 'family_1',
      access_token: ''
    };
    setDoctorPatients((prev) => [...prev, mockPatient]);
    setSelectedPatient(mockPatient);
    setShowAddPatient(false);
    showToast(`Patient ${mockPatient.name} linked to clinical registry.`, 'success');
  };

  const handleSavePlan = async (
    patient: User,
    planData: { title: string; diagnosis: string; plan_details: string; dietary_guidelines: string }
  ) => {
    try {
      const created = await createTreatmentPlan({
        patient_id: patient.user_id,
        title: planData.title,
        diagnosis: planData.diagnosis,
        plan_details: planData.plan_details,
        dietary_guidelines: planData.dietary_guidelines
      });

      const newPlanItem: TreatmentPlanItem = {
        id: created.id,
        patient_id: patient.user_id,
        title: planData.title,
        diagnosis: planData.diagnosis,
        plan_details: planData.plan_details,
        dietary_guidelines: planData.dietary_guidelines,
        status: 'active',
        created_at: new Date().toISOString()
      };

      setPlans((prev) => [newPlanItem, ...prev]);
      showToast(`Treatment plan saved for ${patient.name}.`, 'success');
    } catch (err) {
      // Fallback
      const newPlanItem: TreatmentPlanItem = {
        id: Date.now().toString(),
        patient_id: patient.user_id,
        title: planData.title,
        diagnosis: planData.diagnosis,
        plan_details: planData.plan_details,
        dietary_guidelines: planData.dietary_guidelines,
        status: 'active',
        created_at: new Date().toISOString()
      };
      setPlans((prev) => [newPlanItem, ...prev]);
      showToast(`Treatment plan for ${patient.name} saved on this device only — the server could not be reached.`, 'warning');
    }
  };

  const handleSendPrescription = async (data: {
    patient: User | null;
    medication: string;
    dosage: string;
    instructions: string;
  }) => {
    const targetPatient = data.patient || selectedPatient;
    if (!targetPatient) return;

    try {
      const created = await prescribePatientMedication(targetPatient.user_id, {
        name: data.medication,
        dosage: data.dosage,
        frequency: 'once_daily',
        notes: data.instructions
      });

      const newMed: Medication = {
        id: created?.id || `med_${Date.now()}`,
        name: data.medication,
        dosage: data.dosage,
        frequency: 'once daily',
        times: ['08:00'],
        start_date: new Date().toISOString().slice(0, 10),
        active: true,
        taken_today: false,
        member_id: targetPatient.user_id
      };

      setMedications((prev) => [newMed, ...prev]);
      showToast(`Prescribed ${data.medication} (${data.dosage}) for ${targetPatient.name}. Recorded in the activity log.`, 'success');
    } catch (err) {
      const newMed: Medication = {
        id: `med_${Date.now()}`,
        name: data.medication,
        dosage: data.dosage,
        frequency: 'once daily',
        times: ['08:00'],
        start_date: new Date().toISOString().slice(0, 10),
        active: true,
        taken_today: false,
        member_id: targetPatient.user_id
      };
      setMedications((prev) => [newMed, ...prev]);
      showToast(`Prescription for ${targetPatient.name} saved on this device only — the server could not be reached.`, 'warning');
    }
  };

  const TAB_HEADINGS: Record<string, { title: string; description: string }> = {
    dashboard: { title: 'Clinical overview', description: 'Vital-sign trends, flagged readings and prescriptions for the patient in focus.' },
    patients: { title: 'Patients', description: 'Your patient panel. Select a patient to bring them into focus.' },
    treatments: { title: 'Treatment plans', description: 'Treatment and dietary plans, newest first.' },
    telemedicine: { title: 'Telemedicine', description: 'Scheduled video consultations.' }
  };
  const heading = TAB_HEADINGS[activeTab] || TAB_HEADINGS.dashboard;

  return (
    <div className="page">
      <PageHeader
        eyebrow="Clinical workspace"
        title={heading.title}
        description={heading.description}
        actions={
          <>
            <button type="button" onClick={() => setShowCreatePlan(true)} className="btn btn-secondary">
              <FileText />
              New treatment plan
            </button>
            <button type="button" onClick={onOpenTelemedicine} className="btn btn-primary">
              <Video />
              Start video visit
            </button>
          </>
        }
      />

      {/* Patient in focus + consent status */}
      <div className="card flex flex-col gap-3 px-4 py-3 md:flex-row md:items-center">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label htmlFor="doctor-patient-focus" className="text-13 font-medium text-slate-600 dark:text-slate-300">
            Patient in focus
          </label>
          <select
            id="doctor-patient-focus"
            className="select input-sm sm:w-64"
            value={selectedPatient?.user_id || ''}
            onChange={(e) => setSelectedPatient(allPatients.find((m) => m.user_id === e.target.value) || null)}
          >
            {allPatients.length === 0 && <option value="">No patients</option>}
            {allPatients.map((m) => (
              <option key={m.user_id} value={m.user_id}>
                {m.name} ({m.age} y, {m.gender})
              </option>
            ))}
          </select>
        </div>
        <div className="md:ml-auto" aria-live="polite">
          {checkingConsent ? (
            <span className="badge badge-neutral">
              <Loader2 className="animate-spin" aria-hidden />
              Checking consent…
            </span>
          ) : hasConsent ? (
            <span className="badge badge-success">
              <ShieldCheck aria-hidden />
              Patient consent on file
            </span>
          ) : (
            <span className="badge badge-warning">
              <Lock aria-hidden />
              Consent required
            </span>
          )}
        </div>
      </div>

      {!hasConsent && !checkingConsent && selectedPatient && (
        <div className="callout callout-warning" role="alert">
          <Lock aria-hidden />
          <div className="flex-1">
            <p className="font-medium">{selectedPatient.name} hasn't granted you access to their record</p>
            <p className="mt-0.5">
              Diagnostic documents, vital-sign history and reproductive records require the patient's explicit consent. The server
              enforces this on every request.
            </p>
            <button type="button" onClick={handleGrantConsentSimulation} className="btn btn-secondary btn-sm mt-3">
              Simulate patient authorization (demo)
            </button>
          </div>
        </div>
      )}

      {/* The treatments tab renders its own plan modal; avoid opening two. */}
      {showCreatePlan && activeTab !== 'treatments' && (
        <CreatePlanModal
          patients={allPatients}
          selectedPatient={selectedPatient}
          onSelectPatient={setSelectedPatient}
          onCreatePlan={handleSavePlan}
          onClose={() => setShowCreatePlan(false)}
        />
      )}

      {activeTab === 'patients' && (
        <DoctorPatientsTab
          patients={allPatients}
          selectedPatient={selectedPatient}
          onSelectPatient={setSelectedPatient}
          showAddPatient={showAddPatient}
          setShowAddPatient={setShowAddPatient}
          onAddPatient={handleAddPatientByCode}
          onOpenLabResults={(p) => {
            setSelectedPatient(p);
            setShowLabResults(true);
          }}
          onOpenPrescription={(p) => {
            setSelectedPatient(p);
            setShowPrescription(true);
          }}
        />
      )}

      {activeTab === 'telemedicine' && (
        <DoctorTelemedicineTab
          appointments={appointments}
          onNewVisit={() => onOpenTelemedicine && onOpenTelemedicine()}
        />
      )}

      {activeTab === 'treatments' && (
        <DoctorTreatmentsTab
          patients={allPatients}
          plans={plans}
          selectedPatient={selectedPatient}
          onSelectPatient={setSelectedPatient}
          showCreatePlan={showCreatePlan}
          setShowCreatePlan={setShowCreatePlan}
          onSavePlan={handleSavePlan}
        />
      )}

      {(!activeTab || activeTab === 'dashboard') && (
        <DoctorOverviewTab
          patients={allPatients}
          selectedPatient={selectedPatient}
          vitals={vitals}
          medications={medications}
          appointments={appointments}
          onOpenTelemedicine={() => onOpenTelemedicine && onOpenTelemedicine()}
          onOpenLabResults={() => setShowLabResults(true)}
          onOpenPrescription={() => setShowPrescription(true)}
        />
      )}

      {showLabResults && (
        <LabResultsModal
          patients={allPatients}
          selectedPatient={selectedPatient}
          onSelectPatient={setSelectedPatient}
          labResults={labResults}
          onClose={() => setShowLabResults(false)}
        />
      )}

      {showPrescription && (
        <PrescriptionModal
          patients={allPatients}
          selectedPatient={selectedPatient}
          onSelectPatient={setSelectedPatient}
          onSendPrescription={handleSendPrescription}
          onClose={() => setShowPrescription(false)}
        />
      )}
    </div>
  );
};

export default DoctorDashboard;
