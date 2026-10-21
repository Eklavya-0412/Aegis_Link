import React from 'react';
import { ClipboardPlus, Eye } from 'lucide-react';
import { CaregiverPatient } from '../types';
import { maskId } from '../../../utils/piiMasker';
import { Avatar } from '../../../components/ui';

interface PatientCardProps {
  patient: CaregiverPatient;
  /** Today's medication adherence in percent, or null when nothing is scheduled. */
  adherence?: number | null;
  onOpenDetails: (patientId: string) => void;
  onCreateTask: (patientName: string) => void;
}

export const PatientCard: React.FC<PatientCardProps> = ({ patient, adherence, onOpenDetails, onCreateTask }) => (
  <div className="card flex flex-col p-4">
    <div className="flex items-start gap-3">
      <Avatar name={patient.name} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{patient.name}</p>
        <p className="font-mono text-xs text-slate-500">ID {maskId(patient.id)}</p>
      </div>
      <span className="badge badge-success">Active</span>
    </div>

    <dl className="mt-4 grid grid-cols-3 divide-x divide-slate-100 rounded-lg border border-slate-100 dark:divide-slate-800 dark:border-slate-800">
      <div className="px-3 py-2">
        <dt className="text-2xs font-medium text-slate-500">Medications</dt>
        <dd className="text-base font-semibold tabular-nums text-slate-900 dark:text-slate-100">{patient.medication_count || 0}</dd>
      </div>
      <div className="px-3 py-2">
        <dt className="text-2xs font-medium text-slate-500">Appointments</dt>
        <dd className="text-base font-semibold tabular-nums text-slate-900 dark:text-slate-100">{patient.appointment_count || 0}</dd>
      </div>
      <div className="px-3 py-2">
        <dt className="text-2xs font-medium text-slate-500">Adherence</dt>
        <dd className="text-base font-semibold tabular-nums text-slate-900 dark:text-slate-100">
          {adherence === null || adherence === undefined ? '—' : `${adherence}%`}
        </dd>
      </div>
    </dl>

    <div className="mt-4 grid grid-cols-2 gap-2">
      <button type="button" onClick={() => onOpenDetails(patient.id)} className="btn btn-secondary btn-sm">
        <Eye />
        View record
      </button>
      <button type="button" onClick={() => onCreateTask(patient.name)} className="btn btn-secondary btn-sm">
        <ClipboardPlus />
        Add task
      </button>
    </div>
  </div>
);

export default PatientCard;
