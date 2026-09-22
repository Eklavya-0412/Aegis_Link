import React from 'react';
import { User } from '../../../types';
import { TreatmentPlan } from '../types';
import CreatePlanModal from '../modals/CreatePlanModal';

interface DoctorTreatmentsTabProps {
  patients: User[];
  plans: TreatmentPlan[];
  selectedPatient: User | null;
  onSelectPatient: (patient: User | null) => void;
  showCreatePlan: boolean;
  setShowCreatePlan: (show: boolean) => void;
  onSavePlan: (patient: User, text: string) => void;
}

export const DoctorTreatmentsTab: React.FC<DoctorTreatmentsTabProps> = ({
  patients,
  plans,
  selectedPatient,
  onSelectPatient,
  showCreatePlan,
  setShowCreatePlan,
  onSavePlan
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-gray-800">Treatments</h3>
        <button
          onClick={() => setShowCreatePlan(true)}
          className="px-4 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition-colors font-medium"
        >
          Create Plan
        </button>
      </div>

      {showCreatePlan && (
        <CreatePlanModal
          patients={patients}
          selectedPatient={selectedPatient}
          onSelectPatient={onSelectPatient}
          onCreatePlan={(patient, text) => {
            onSavePlan(patient, text);
            setShowCreatePlan(false);
          }}
          onClose={() => setShowCreatePlan(false)}
        />
      )}

      <div className="bg-white/80 p-6 rounded-2xl border">
        <h4 className="font-bold mb-4">Existing Plans</h4>
        <div className="space-y-3">
          {plans.map((p) => {
            const patient = patients.find((m) => m.user_id === p.patient_id);
            return (
              <div key={p.id} className="p-4 bg-gray-50 rounded-xl border">
                <div className="flex justify-between items-center mb-1">
                  <p className="font-semibold text-gray-800">{patient?.name || 'Unknown Patient'}</p>
                  <p className="text-xs text-gray-500">{new Date(p.created_at).toLocaleString()}</p>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-line">{p.text}</p>
              </div>
            );
          })}
          {plans.length === 0 && <p className="text-sm text-gray-500">No plans yet</p>}
        </div>
      </div>
    </div>
  );
};

export default DoctorTreatmentsTab;

