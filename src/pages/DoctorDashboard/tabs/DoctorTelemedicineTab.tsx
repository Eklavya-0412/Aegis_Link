import React from 'react';
import { Video } from 'lucide-react';
import { Appointment } from '../../../types';
import { Card, EmptyState, StatusBadge } from '../../../components/ui';
import { formatDate, formatTime, titleCase } from '../../../utils/format';

interface DoctorTelemedicineTabProps {
  appointments: Appointment[];
  onNewVisit: () => void;
}

export const DoctorTelemedicineTab: React.FC<DoctorTelemedicineTabProps> = ({ appointments, onNewVisit }) => {
  const teleAppointments = [...appointments.filter((a) => a.type === 'telemedicine')].sort(
    (a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime()
  );

  return (
    <Card
      title="Scheduled video consultations"
      subtitle={`${teleAppointments.length} visits`}
      flush
      actions={
        <button type="button" onClick={onNewVisit} className="btn btn-primary btn-sm">
          <Video />
          New visit
        </button>
      }
    >
      {teleAppointments.length === 0 ? (
        <EmptyState icon={Video} title="No video consultations scheduled" />
      ) : (
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Visit</th>
                <th>Date</th>
                <th className="hidden sm:table-cell">Clinician</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {teleAppointments.map((a) => (
                <tr key={a.id}>
                  <td>
                    <p className="font-medium text-slate-900 dark:text-slate-100">{a.title}</p>
                    {a.notes && <p className="max-w-xs truncate text-xs text-slate-500">{a.notes}</p>}
                  </td>
                  <td className="whitespace-nowrap tabular-nums">
                    {formatDate(a.appointment_date)} · {formatTime(a.appointment_date)}
                  </td>
                  <td className="hidden sm:table-cell">{a.doctor_name || '—'}</td>
                  <td>
                    <StatusBadge severity={a.status === 'completed' ? 'success' : a.status === 'cancelled' ? 'neutral' : 'info'}>
                      {titleCase(a.status)}
                    </StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};

export default DoctorTelemedicineTab;
