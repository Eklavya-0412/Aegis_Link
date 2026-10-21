import React from 'react';
import { ClipboardList, HeartPulse, Pill, Plus } from 'lucide-react';
import { CaregiverCheckin } from '../../../services/clinicalService';
import { Card, EmptyState } from '../../../components/ui';
import { formatDateTime, titleCase } from '../../../utils/format';
import { maskId } from '../../../utils/piiMasker';
import { vitalLabel } from '../../../constants/vitals';

interface CaregiverLogsTabProps {
  checkins: CaregiverCheckin[];
  onOpenCheckinModal: () => void;
}

/** One caregiver visit / check-in entry. Shared by the logs tab and the overview. */
export const CheckinEntry: React.FC<{ entry: CaregiverCheckin; compact?: boolean }> = ({ entry, compact }) => (
  <li className="px-5 py-4">
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <p className="text-13 font-semibold text-slate-900 dark:text-slate-100">{entry.caregiver_name || 'Care specialist'}</p>
      <span className="badge badge-neutral">{titleCase(entry.visit_type)}</span>
      {!compact && <span className="font-mono text-xs text-slate-400">Patient {maskId(entry.patient_id)}</span>}
      <time className="ml-auto text-xs tabular-nums text-slate-500" dateTime={entry.checkin_time || entry.created_at}>
        {formatDateTime(entry.checkin_time || entry.created_at)}
      </time>
    </div>
    {entry.notes && (
      <p className={`mt-1.5 whitespace-pre-line text-sm leading-relaxed text-slate-700 dark:text-slate-300 ${compact ? 'line-clamp-2' : ''}`}>
        {entry.notes}
      </p>
    )}
    {((entry.vitals_recorded && Object.keys(entry.vitals_recorded).length > 0) ||
      (entry.medications_administered && entry.medications_administered.length > 0)) && (
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {entry.vitals_recorded && Object.keys(entry.vitals_recorded).length > 0 && (
          <span className="badge badge-info h-auto min-h-6 whitespace-normal py-1">
            <HeartPulse aria-hidden />
            {Object.entries(entry.vitals_recorded)
              .map(([k, v]) => `${vitalLabel(k)}: ${v}`)
              .join(' · ')}
          </span>
        )}
        {entry.medications_administered && entry.medications_administered.length > 0 && (
          <span className="badge badge-success h-auto min-h-6 whitespace-normal py-1">
            <Pill aria-hidden />
            Given: {entry.medications_administered.join(', ')}
          </span>
        )}
      </div>
    )}
  </li>
);

export const CaregiverLogsTab: React.FC<CaregiverLogsTabProps> = ({ checkins, onOpenCheckinModal }) => {
  return (
    <Card
      title="Visit history"
      subtitle={`${checkins.length} visits recorded`}
      icon={ClipboardList}
      flush
      actions={
        <button type="button" onClick={onOpenCheckinModal} className="btn btn-primary btn-sm">
          <Plus />
          Log visit
        </button>
      }
    >
      {checkins.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No visits logged yet"
          description="Record a check-in after each visit to document observations, vitals and medications given."
          action={
            <button type="button" onClick={onOpenCheckinModal} className="btn btn-primary">
              <Plus />
              Log first visit
            </button>
          }
        />
      ) : (
        <ul className="divide-list">
          {checkins.map((entry) => (
            <CheckinEntry key={entry.id} entry={entry} />
          ))}
        </ul>
      )}
    </Card>
  );
};

export default CaregiverLogsTab;
