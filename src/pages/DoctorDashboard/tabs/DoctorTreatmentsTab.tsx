import React from 'react';
import { Apple, FileText, Plus, Stethoscope } from 'lucide-react';
import { User } from '../../../types';
import CreatePlanModal from '../modals/CreatePlanModal';

export interface TreatmentPlanItem {
  id: string;
  patient_id: string;
  doctor_id?: string;
  doctor_name?: string;
  title: string;
  diagnosis?: string;
  plan_details?: string;
  dietary_guidelines?: string;
  text?: string;
  status?: string;
  created_at: string;
}

interface DoctorTreatmentsTabProps {
  patients: User[];
  plans: TreatmentPlanItem[];
  selectedPatient: User | null;
  onSelectPatient: (patient: User | null) => void;
  showCreatePlan: boolean;
  setShowCreatePlan: (show: boolean) => void;
  onSavePlan: (patient: User, planData: { title: string; diagnosis: string; plan_details: string; dietary_guidelines: string }) => void;
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
        <div>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Treatment & Diet Management</h3>
          <p className="text-sm text-gray-500">Formulate and adjust clinical treatment plans & dietary recommendations (UC8)</p>
        </div>
        <button
          onClick={() => setShowCreatePlan(true)}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 font-semibold text-sm shadow-md transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Care Plan
        </button>
      </div>

      {showCreatePlan && (
        <CreatePlanModal
          patients={patients}
          selectedPatient={selectedPatient}
          onSelectPatient={onSelectPatient}
          onCreatePlan={(patient, planData) => {
            onSavePlan(patient, planData);
            setShowCreatePlan(false);
          }}
          onClose={() => setShowCreatePlan(false)}
        />
      )}

      <div className="space-y-4">
        {plans.map((p) => {
          const patient = patients.find((m) => m.user_id === p.patient_id);
          return (
            <div
              key={p.id}
              className="p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-purple-100 dark:border-gray-700 shadow-sm hover:shadow-md transition space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center font-bold">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 dark:text-gray-100 text-base">
                      {p.title || 'Clinical Care Plan'}
                    </h4>
                    <p className="text-xs text-gray-500">
                      Patient: <span className="font-semibold text-purple-700 dark:text-purple-300">{patient?.name || 'Assigned Patient'}</span> • {new Date(p.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {p.diagnosis && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 rounded-full text-xs font-semibold">
                      Dx: {p.diagnosis}
                    </span>
                  )}
                  <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold capitalize">
                    {p.status || 'Active'}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-purple-600" />
                  Treatment Directives
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line bg-gray-50 dark:bg-gray-700/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-600">
                  {p.plan_details || p.text}
                </p>
              </div>

              {p.dietary_guidelines && (
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Apple className="w-3.5 h-3.5 text-emerald-600" />
                    Dietary & Lifestyle Directives
                  </p>
                  <p className="text-sm text-emerald-900 dark:text-emerald-200 leading-relaxed whitespace-pre-line bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                    {p.dietary_guidelines}
                  </p>
                </div>
              )}
            </div>
          );
        })}

        {plans.length === 0 && (
          <div className="bg-white/80 dark:bg-gray-800/80 p-12 rounded-3xl border text-center">
            <Stethoscope className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h4 className="font-bold text-gray-700 dark:text-gray-300">No Treatment Plans Established</h4>
            <p className="text-sm text-gray-400 mt-1">Select a patient and click "Create Care Plan" to formulate medical directives.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorTreatmentsTab;
