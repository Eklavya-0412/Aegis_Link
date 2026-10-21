import React from 'react';
import { Calendar, ClipboardList, HeartPulse, Pill, UserRound } from 'lucide-react';
import { Appointment, Medication, User, Vital } from '../../../types';
import Modal from '../../../components/common/Modal';
import { EmptyState, KeyValue, StatusBadge } from '../../../components/ui';
import { ReadingStatusBadge } from '../../../features/vitals/VitalReadingTile';
import { sortByRecordedDesc, vitalLabel } from '../../../constants/vitals';
import { formatDateTime } from '../../../utils/format';
import { maskId } from '../../../utils/piiMasker';

interface PatientDetailModalProps {
  patient: User;
  medications: Medication[];
  appointments: Appointment[];
  vitals: Vital[];
  onClose: () => void;
  onOpenCheckIn?: (patientId: string) => void;
  onOpenManageMeds?: (patient: User) => void;
}

const SectionTitle: React.FC<{ icon: typeof Pill; children: React.ReactNode; count?: number }> = ({ icon: Icon, children, count }) => (
  <h3 className="mb-2 flex items-center gap-2 text-13 font-semibold text-slate-800 dark:text-slate-200">
    <Icon className="h-4 w-4 text-slate-400" aria-hidden />
    {children}
    {count !== undefined && <span className="font-normal tabular-nums text-slate-400">{count}</span>}
  </h3>
);

export const PatientDetailModal: React.FC<PatientDetailModalProps> = ({
  patient,
  medications,
  appointments,
  vitals,
  onClose,
  onOpenCheckIn,
  onOpenManageMeds
}) => {
  const patientMeds = medications.filter((m) => m.member_id === patient.user_id);
  const patientAppts = appointments.filter((a) => a.member_id === patient.user_id);
  const patientVitals = sortByRecordedDesc(vitals.filter((v) => v.member_id === patient.user_id)).slice(0, 6);

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={patient.name}
      description={`${patient.age} y · ${patient.gender}`}
      icon={UserRound}
      maxWidth="max-w-3xl"
      footer={
        (onOpenCheckIn || onOpenManageMeds) && (
          <>
            {onOpenManageMeds && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  onClose();
                  onOpenManageMeds(patient);
                }}
              >
                <Pill />
                Manage medications
              </button>
            )}
            {onOpenCheckIn && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  onClose();
                  onOpenCheckIn(patient.user_id);
                }}
              >
                <ClipboardList />
                Log visit
              </button>
            )}
          </>
        )
      }
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[200px_minmax(0,1fr)]">
        <dl className="h-fit divide-y divide-slate-100 rounded-lg border border-slate-200 px-3 dark:divide-slate-800 dark:border-slate-800">
          <KeyValue label="Patient ID" mono>
            {maskId(patient.patient_id || patient.user_id)}
          </KeyValue>
          <KeyValue label="Medications">{patientMeds.length}</KeyValue>
          <KeyValue label="Appointments">{patientAppts.length}</KeyValue>
        </dl>

        <div className="space-y-6">
          <section>
            <SectionTitle icon={HeartPulse} count={patientVitals.length}>
              Recent vital signs
            </SectionTitle>
            {patientVitals.length === 0 ? (
              <EmptyState compact title="No vitals recorded" />
            ) : (
              <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
                <table className="data-table">
                  <tbody>
                    {patientVitals.map((v) => (
                      <tr key={v.id}>
                        <td className="font-medium text-slate-800 dark:text-slate-200">{vitalLabel(v.type)}</td>
                        <td className="whitespace-nowrap tabular-nums">
                          <span className="font-semibold text-slate-900 dark:text-slate-100">{v.value}</span>{' '}
                          <span className="text-xs text-slate-500">{v.unit}</span>
                        </td>
                        <td className="hidden whitespace-nowrap text-xs tabular-nums text-slate-500 sm:table-cell">{formatDateTime(v.recorded_at)}</td>
                        <td className="text-right">
                          <ReadingStatusBadge vital={v} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section>
            <SectionTitle icon={Pill} count={patientMeds.length}>
              Medications
            </SectionTitle>
            {patientMeds.length === 0 ? (
              <EmptyState compact title="No medications" />
            ) : (
              <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
                {patientMeds.map((m) => (
                  <li key={m.id} className="flex items-center gap-3 px-3 py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-13 font-medium text-slate-900 dark:text-slate-100">{m.name}</p>
                      <p className="text-xs capitalize text-slate-500">
                        {m.dosage} · {m.frequency}
                      </p>
                    </div>
                    <StatusBadge severity={m.taken_today ? 'success' : 'warning'}>{m.taken_today ? 'Taken' : 'Due'}</StatusBadge>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <SectionTitle icon={Calendar} count={patientAppts.length}>
              Appointments
            </SectionTitle>
            {patientAppts.length === 0 ? (
              <EmptyState compact title="No appointments" />
            ) : (
              <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
                {patientAppts.map((a) => (
                  <li key={a.id} className="px-3 py-2.5">
                    <p className="text-13 font-medium text-slate-900 dark:text-slate-100">{a.title}</p>
                    <p className="text-xs tabular-nums text-slate-500">
                      {formatDateTime(a.appointment_date)} · <span className="capitalize">{a.type.replace('_', ' ')}</span>
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </Modal>
  );
};

export default PatientDetailModal;
