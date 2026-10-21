import React from 'react';
import { Apple, FilePlus2, FileText } from 'lucide-react';
import { User } from '../../../types';
import { Avatar, Card, EmptyState } from '../../../components/ui';
import { formatDateTime, titleCase } from '../../../utils/format';
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
  /** Built-in demonstration record, not loaded from the server. */
  sample?: boolean;
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
    <>
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

      <Card
        title="Treatment & diet plans"
        subtitle={`${plans.length} ${plans.length === 1 ? "plan" : "plans"}`}
        flush
        actions={
          <button type="button" onClick={() => setShowCreatePlan(true)} className="btn btn-primary btn-sm">
            <FilePlus2 />
            Create plan
          </button>
        }
      >
        {plans.length === 0 ? (
          <EmptyState icon={FileText} title="No treatment plans yet" description="Select a patient and create a plan with treatment directives and dietary guidance." />
        ) : (
          <ul className="divide-list">
            {plans.map((p) => {
              const patient = patients.find((m) => m.user_id === p.patient_id);
              const status = p.status || 'active';
              return (
                <li key={p.id} className="px-5 py-4">
                  <div className="flex flex-wrap items-start gap-x-3 gap-y-2">
                    <Avatar name={patient?.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{p.title || 'Care plan'}</p>
                      <p className="text-xs text-slate-500">
                        {patient?.name || 'Assigned patient'}
                        {p.doctor_name ? ` · ${p.doctor_name}` : ''} ·{' '}
                        <time className="tabular-nums" dateTime={p.created_at}>
                          {formatDateTime(p.created_at)}
                        </time>
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {p.sample ? (
                        <span className="badge badge-warning" title="Built-in demonstration plan, not saved on the server">Sample data</span>
                      ) : (
                        <span className="badge badge-brand">Clinician-authored</span>
                      )}
                      <span className={`badge ${status === 'active' ? 'badge-success' : 'badge-neutral'}`}>{titleCase(status)}</span>
                    </div>
                  </div>

                  <div className="mt-3 space-y-3 pl-10">
                    {p.diagnosis && (
                      <p className="text-13">
                        <span className="text-slate-500">Diagnosis: </span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">{p.diagnosis}</span>
                      </p>
                    )}
                    {(p.plan_details || p.text) && (
                      <div>
                        <p className="eyebrow mb-1 flex items-center gap-1">
                          <FileText className="h-3 w-3" aria-hidden />
                          Treatment directives
                        </p>
                        <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700 dark:text-slate-300">{p.plan_details || p.text}</p>
                      </div>
                    )}
                    {p.dietary_guidelines && (
                      <div>
                        <p className="eyebrow mb-1 flex items-center gap-1">
                          <Apple className="h-3 w-3" aria-hidden />
                          Diet & lifestyle
                        </p>
                        <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700 dark:text-slate-300">{p.dietary_guidelines}</p>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </>
  );
};

export default DoctorTreatmentsTab;
