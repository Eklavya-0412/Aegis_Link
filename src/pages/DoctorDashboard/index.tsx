import React, { useState } from 'react';
import { FileText, Video } from 'lucide-react';
import { Appointment, Family, Medication, User, Vital } from '../../types';
import { LabResult, TreatmentPlan } from './types';
import DoctorOverviewTab from './tabs/DoctorOverviewTab';
import DoctorPatientsTab from './tabs/DoctorPatientsTab';
import DoctorTelemedicineTab from './tabs/DoctorTelemedicineTab';
import DoctorTreatmentsTab from './tabs/DoctorTreatmentsTab';
import LabResultsModal from './modals/LabResultsModal';
import PrescriptionModal from './modals/PrescriptionModal';
import CreatePlanModal from './modals/CreatePlanModal';

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
    id: '1',
    patient_id: 'user1',
    patient_name: 'John Doe',
    test_date: '2025-09-10T10:30:00',
    ordered_by: 'Dr. Smith',
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
    id: '2',
    patient_id: 'user2',
    patient_name: 'Jane Smith',
    test_date: '2025-09-08T14:15:00',
    ordered_by: 'Dr. Smith',
    results: {
      cbc: {
        wbc: { value: 8.5, unit: 'K/μL', normal: '4.0-10.0', status: 'normal' },
        rbc: { value: 4.5, unit: 'M/μL', normal: '4.2-5.4', status: 'normal' },
        hgb: { value: 12.8, unit: 'g/dL', normal: '12.0-16.0', status: 'normal' },
        hct: { value: 38.9, unit: '%', normal: '36-46', status: 'normal' },
        platelets: { value: 320, unit: 'K/μL', normal: '150-450', status: 'normal' }
      },
      metabolic: {
        glucose: { value: 108, unit: 'mg/dL', normal: '70-100', status: 'high' },
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
  const [selectedPatient, setSelectedPatient] = useState<User | null>(null);
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [showLabResults, setShowLabResults] = useState(false);
  const [showPrescription, setShowPrescription] = useState(false);
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [doctorPatients, setDoctorPatients] = useState<User[]>([]);
  const [plans, setPlans] = useState<TreatmentPlan[]>([]);
  const [labResults] = useState<LabResult[]>(INITIAL_LAB_RESULTS);

  const familyMembers = currentFamily?.members.filter((m) => m.role !== 'doctor') || [];
  const allPatients = [...familyMembers, ...doctorPatients];

  const handleAddPatientByCode = (code: string) => {
    const mockPatient: User = {
      user_id: `patient_${Date.now()}`,
      name: `Patient ${code}`,
      age: Math.floor(Math.random() * 50) + 20,
      email: `patient${code}@example.com`,
      role: 'patient',
      relationship: 'patient',
      code,
      gender: 'male',
      family_id: 'temp_family',
      access_token: ''
    };
    setDoctorPatients((prev) => [...prev, mockPatient]);
    setShowAddPatient(false);
    alert(`Patient ${mockPatient.name} added successfully!`);
  };

  const handleSavePlan = (patient: User, text: string) => {
    setPlans((prev) => [
      {
        id: Date.now().toString(),
        patient_id: patient.user_id,
        text,
        created_at: new Date().toISOString()
      },
      ...prev
    ]);
    alert(`Treatment plan created for ${patient.name}`);
  };

  const handleSendPrescription = (data: { patient: User | null; medication: string; dosage: string; instructions: string }) => {
    alert(`Prescription sent for ${data.patient?.name || 'patient'}: ${data.medication} (${data.dosage})`);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">Doctor Dashboard</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={onOpenTelemedicine}
            className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-4 py-2 rounded-xl hover:from-blue-600 hover:to-green-600 transition-all duration-300 font-medium shadow-lg"
          >
            <Video className="h-4 w-4 inline mr-2" />
            Attend Video Calls
          </button>
          <button
            onClick={() => setShowCreatePlan(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 font-medium shadow-lg"
          >
            <FileText className="h-4 w-4 inline mr-2" />
            Treatment Plans
          </button>
        </div>
      </div>

      <div className="bg-white/80 p-4 rounded-2xl border flex items-center space-x-3">
        <span className="text-sm text-gray-700 font-medium">Switch Patient:</span>
        <select
          className="p-2 border rounded-lg"
          value={selectedPatient?.user_id || ''}
          onChange={(e) => setSelectedPatient(allPatients.find((m) => m.user_id === e.target.value) || null)}
        >
          <option value="">Select</option>
          {allPatients.map((m) => (
            <option key={m.user_id} value={m.user_id}>
              {m.name} ({m.age})
            </option>
          ))}
        </select>
        {selectedPatient && <span className="text-xs text-gray-500">Viewing: {selectedPatient.name}</span>}
      </div>

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

      {(activeTab === 'dashboard' || activeTab === 'patients') && (
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

