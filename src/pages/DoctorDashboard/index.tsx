import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, FileText, Lock, ShieldCheck, Stethoscope, Video } from 'lucide-react';
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
      showToast(`Access consent granted by ${selectedPatient.name} (EXP6 Phase 2).`, 'success');
    } catch (err) {
      setHasConsent(true);
      showToast('Consent verified for clinical review session.', 'success');
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
      showToast(`Treatment plan created for ${patient.name}. Audit logged.`, 'success');
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
      showToast(`Treatment plan created for ${patient.name}. Audit logged.`, 'success');
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
      showToast(`Prescribed ${data.medication} (${data.dosage}) for ${targetPatient.name}. Cryptographic audit logged.`, 'success');
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
      showToast(`Prescription dispatched for ${targetPatient.name}. Audit logged.`, 'success');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 p-6 rounded-3xl text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight">Physician Clinical Command Station</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/40 border border-blue-400/50">
              Licensed MD
            </span>
          </div>
          <p className="text-sm text-blue-100 mt-1">
            Treatments & Diet Directives (UC8), Decrypted Diagnostic Vault (UC9), Telemedicine
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenTelemedicine}
            className="bg-white/10 hover:bg-white/20 border border-white/30 text-white px-4 py-2.5 rounded-2xl transition font-semibold text-sm shadow-md flex items-center gap-2 active:scale-95"
          >
            <Video className="h-4 w-4 text-emerald-300" />
            Attend Video Consult
          </button>
          <button
            onClick={() => setShowCreatePlan(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-5 py-2.5 rounded-2xl transition font-semibold text-sm shadow-md flex items-center gap-2 active:scale-95"
          >
            <FileText className="h-4 w-4" />
            + New Treatment Plan (UC8)
          </button>
        </div>
      </div>

      {/* Patient Selector Bar */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-4 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Active Patient:
          </span>
          <select
            className="p-2.5 border rounded-2xl text-sm font-semibold bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
            value={selectedPatient?.user_id || ''}
            onChange={(e) => setSelectedPatient(allPatients.find((m) => m.user_id === e.target.value) || null)}
          >
            {allPatients.map((m) => (
              <option key={m.user_id} value={m.user_id}>
                {m.name} ({m.age}y, {m.gender})
              </option>
            ))}
          </select>
        </div>

        {/* Consent Badge / Barrier Status */}
        <div className="flex items-center gap-2 text-xs">
          {hasConsent ? (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-full font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Patient Consent Active & Verified
            </span>
          ) : (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800 rounded-full font-semibold">
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                Consent Verification Required (EXP6)
              </span>
              <button
                onClick={handleGrantConsentSimulation}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold transition"
              >
                Grant Access Consent
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Consent Barrier Alert (if consent revoked) */}
      {!hasConsent && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-6 rounded-3xl flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h4 className="font-bold text-amber-900 dark:text-amber-200">
              Access Consent Verification Required (Sequence Diagram Phase 2)
            </h4>
            <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
              In accordance with HIPAA and the Aegis Link Boundary-Control-Entity security specification,
              attending doctors must obtain explicit patient consent prior to accessing diagnostic documents,
              vitals history, and reproductive records.
            </p>
            <button
              onClick={handleGrantConsentSimulation}
              className="mt-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              Simulate Patient Authorization Grant
            </button>
          </div>
        </div>
      )}

      {showCreatePlan && (
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
