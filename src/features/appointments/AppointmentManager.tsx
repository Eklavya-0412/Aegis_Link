import React, { useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import { CalendarClock, CalendarPlus, FlaskConical, Loader2, MapPin, Stethoscope, Video } from 'lucide-react';
import { Appointment, User } from '../../types';
import { useToastStore } from '../../store/toastStore';
import { Card, EmptyState, Field, PageHeader, StatusBadge } from '../../components/ui';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { formatDate, formatTime, titleCase } from '../../utils/format';

interface AppointmentManagerProps {
  selectedMember: User | null;
  appointments: Appointment[];
  setAppointments: Dispatch<SetStateAction<Appointment[]>>;
  onOpenTelemedicine?: () => void;
}

type AppointmentType = 'doctor' | 'telemedicine' | 'lab_test';

const TYPE_META: Record<AppointmentType, { label: string; icon: typeof Video }> = {
  doctor: { label: 'In-person visit', icon: Stethoscope },
  telemedicine: { label: 'Video consultation', icon: Video },
  lab_test: { label: 'Lab test', icon: FlaskConical }
};

const STATUS_SEVERITY: Record<Appointment['status'], 'info' | 'success' | 'neutral'> = {
  scheduled: 'info',
  completed: 'success',
  cancelled: 'neutral'
};

const AppointmentRow: React.FC<{ appointment: Appointment; past?: boolean; onCancel?: () => void }> = ({ appointment, past, onCancel }) => {
  const meta = TYPE_META[appointment.type] || TYPE_META.doctor;
  const d = new Date(appointment.appointment_date);
  return (
    <li className={`flex flex-col gap-3 px-5 py-3.5 sm:flex-row sm:items-center ${past ? 'opacity-75' : ''}`}>
      <div className="flex min-w-0 flex-1 items-center gap-3.5">
        <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          <span className="text-2xs font-semibold uppercase leading-none text-brand-700 dark:text-brand-300">
            {d.toLocaleDateString(undefined, { month: 'short' })}
          </span>
          <span className="text-base font-semibold leading-tight tabular-nums">{d.getDate()}</span>
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{appointment.title}</p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <meta.icon className="h-3.5 w-3.5" aria-hidden />
              {meta.label}
            </span>
            <span className="tabular-nums">
              {formatDate(appointment.appointment_date)} · {formatTime(appointment.appointment_date)}
            </span>
            {appointment.doctor_name && <span>{appointment.doctor_name}</span>}
            {appointment.location && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" aria-hidden />
                {appointment.location}
              </span>
            )}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 pl-[3.6rem] sm:pl-0">
        <StatusBadge severity={STATUS_SEVERITY[appointment.status] || 'info'}>{titleCase(appointment.status)}</StatusBadge>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn btn-ghost btn-sm text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/40">
            Cancel
          </button>
        )}
      </div>
    </li>
  );
};

const AppointmentManager: React.FC<AppointmentManagerProps> = ({ selectedMember, appointments, setAppointments, onOpenTelemedicine }) => {
  const memberId = selectedMember?.user_id || '';
  const memberAppointments = appointments.filter((appointment) => appointment.member_id === memberId);
  const [newAppointment, setNewAppointment] = useState({ title: '', type: 'doctor' as AppointmentType, when: '' });
  const [errors, setErrors] = useState<{ title?: string; when?: string }>({});
  const [loading, setLoading] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);
  const { showToast } = useToastStore();

  const { upcoming, past } = useMemo(() => {
    const now = Date.now();
    const sorted = [...memberAppointments].sort(
      (a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime()
    );
    return {
      upcoming: sorted.filter((a) => new Date(a.appointment_date).getTime() >= now),
      past: sorted.filter((a) => new Date(a.appointment_date).getTime() < now).reverse()
    };
  }, [memberAppointments]);

  const handleBlur = (field: 'title' | 'when', val: string) => {
    if (!val.trim()) {
      setErrors((prev) => ({ ...prev, [field]: `${field === 'title' ? 'Title' : 'Date & time'} is required` }));
    } else {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const addAppointment = async () => {
    if (!newAppointment.title.trim()) {
      setErrors((prev) => ({ ...prev, title: 'Title is required' }));
      return;
    }
    setLoading(true);
    try {
      const appointment: Appointment = {
        id: Date.now().toString(),
        title: newAppointment.title,
        type: newAppointment.type,
        appointment_date: newAppointment.when || new Date().toISOString(),
        member_id: memberId,
        status: 'scheduled'
      };
      setAppointments([...appointments, appointment]);
      setNewAppointment({ title: '', type: 'doctor', when: '' });
      setErrors({});
      showToast(`Appointment "${appointment.title}" booked.`, 'success');
    } catch {
      showToast('Failed to book appointment. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = (id: string, title: string) => {
    setAppointments(appointments.filter((item) => item.id !== id));
    showToast(`Appointment "${title}" cancelled.`, 'info');
  };

  return (
    <div className="page">
      <PageHeader
        eyebrow="Care"
        title="Appointments"
        description={`Visits, consultations and tests for ${selectedMember?.name || 'this member'}.`}
        actions={
          onOpenTelemedicine && (
            <button type="button" className="btn btn-secondary" onClick={onOpenTelemedicine}>
              <Video />
              Book video consultation
            </button>
          )
        }
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card title="Upcoming" subtitle={`${upcoming.length} scheduled`} flush>
            {upcoming.length === 0 ? (
              <EmptyState icon={CalendarClock} title="No upcoming appointments" description="Book a visit using the form on this page." />
            ) : (
              <ul className="divide-list">
                {upcoming.map((a) => (
                  <AppointmentRow key={a.id} appointment={a} onCancel={() => setCancelTarget(a)} />
                ))}
              </ul>
            )}
          </Card>

          {past.length > 0 && (
            <Card title="Past appointments" subtitle={`${past.length} on record`} flush>
              <ul className="divide-list">
                {past.map((a) => (
                  <AppointmentRow key={a.id} appointment={a} past />
                ))}
              </ul>
            </Card>
          )}
        </div>

        <Card title="Book an appointment" icon={CalendarPlus} className="h-fit">
          <div className="space-y-4">
            <Field label="Reason for visit" htmlFor="appt-title" error={errors.title} required>
              <input
                id="appt-title"
                className={`input ${errors.title ? 'input-invalid' : ''}`}
                placeholder="e.g. Blood pressure follow-up"
                value={newAppointment.title}
                onChange={(event) => setNewAppointment({ ...newAppointment, title: event.target.value })}
                onBlur={(event) => handleBlur('title', event.target.value)}
              />
            </Field>
            <Field label="Visit type" htmlFor="appt-type">
              <select
                id="appt-type"
                className="select"
                value={newAppointment.type}
                onChange={(event) => setNewAppointment({ ...newAppointment, type: event.target.value as AppointmentType })}
              >
                <option value="doctor">In-person visit</option>
                <option value="telemedicine">Video consultation</option>
                <option value="lab_test">Lab test</option>
              </select>
            </Field>
            <Field label="Date & time" htmlFor="appt-when" error={errors.when} required>
              <input
                id="appt-when"
                type="datetime-local"
                className={`input tabular-nums ${errors.when ? 'input-invalid' : ''}`}
                value={newAppointment.when}
                onChange={(event) => setNewAppointment({ ...newAppointment, when: event.target.value })}
                onBlur={(event) => handleBlur('when', event.target.value)}
              />
            </Field>
            <button type="button" onClick={addAppointment} disabled={loading} className="btn btn-primary w-full">
              {loading ? <Loader2 className="animate-spin" /> : <CalendarPlus />}
              {loading ? 'Booking…' : 'Book appointment'}
            </button>
          </div>
        </Card>
      </div>

      <ConfirmDialog
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={() => cancelTarget && cancelAppointment(cancelTarget.id, cancelTarget.title)}
        title="Cancel this appointment?"
        message={cancelTarget ? `"${cancelTarget.title}" on ${formatDate(cancelTarget.appointment_date)} will be removed from the schedule.` : ''}
        confirmText="Cancel appointment"
        cancelText="Keep appointment"
        isDestructive
      />
    </div>
  );
};

export default AppointmentManager;
