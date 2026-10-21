import React, { useEffect, useState } from 'react';
import { AlertCircle, Check, Info, Loader2, Pill, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { User } from '../../types';
import { useToastStore } from '../../store/toastStore';
import { useAuthStore } from '../../store/authStore';
import { useHealthDataStore } from '../../store/healthDataStore';
import { Card, EmptyState, Field, PageHeader, StatTile, StatusBadge } from '../../components/ui';
import { SkeletonRows } from '../../components/common/RemoteState';
import { formatDate } from '../../utils/format';

interface MedicationManagerProps {
  selectedMember: User | null;
}

const FREQUENCY_OPTIONS = [
  { value: 'once_daily', label: 'Once daily' },
  { value: 'twice_daily', label: 'Twice daily' },
  { value: 'three_times_daily', label: 'Three times daily' },
  { value: 'four_times_daily', label: 'Four times daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'as_needed', label: 'As needed' }
];

const frequencyLabel = (value: string) =>
  FREQUENCY_OPTIONS.find((o) => o.value === value)?.label || value.replace(/_/g, ' ');

const MedicationManager: React.FC<MedicationManagerProps> = ({ selectedMember }) => {
  const { currentUser } = useAuthStore();
  const { medications, status, fetchMedications, addMedication, updateMedication, deleteMedication } = useHealthDataStore();
  const { showToast } = useToastStore();

  const isPatient = currentUser?.role === 'patient';
  const memberId = selectedMember?.user_id || currentUser?.user_id || '';
  const memberMedications = medications.filter((m) => m.member_id === memberId);

  const [form, setForm] = useState({ name: '', dosage: '', frequency: 'once_daily', time: '08:00' });
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; dosage?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const medStatus = status.medications;
  const takenCount = memberMedications.filter((m) => m.taken_today).length;

  // Fetch medications when selected member changes
  useEffect(() => {
    if (memberId) {
      fetchMedications(memberId);
    }
  }, [memberId, fetchMedications]);

  const handleBlur = (field: 'name' | 'dosage', val: string) => {
    if (!val.trim()) {
      setFieldErrors((p) => ({ ...p, [field]: `${field === 'name' ? 'Medication name' : 'Dosage'} is required` }));
    } else {
      setFieldErrors((p) => ({ ...p, [field]: undefined }));
    }
  };

  const handleAdd = async () => {
    const errors: typeof fieldErrors = {};
    if (!form.name.trim()) errors.name = 'Medication name is required';
    if (!form.dosage.trim()) errors.dosage = 'Dosage is required';
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      await addMedication({
        id: `local_${Date.now()}`,
        name: form.name.trim(),
        dosage: form.dosage.trim(),
        frequency: form.frequency,
        times: [form.time],
        start_date: new Date().toISOString().slice(0, 10),
        active: true,
        taken_today: false,
        member_id: memberId
      });
      setForm({ name: '', dosage: '', frequency: 'once_daily', time: '08:00' });
      setFieldErrors({});
      showToast(`"${form.name}" added to the medication schedule.`, 'success');
    } catch {
      showToast('Failed to add medication. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkTaken = async (id: string, name: string) => {
    await updateMedication(id, { taken_today: true });
    showToast(`Marked "${name}" as taken.`, 'success');
  };

  const handleRemove = async (id: string, name: string) => {
    await deleteMedication(id);
    showToast(`Removed "${name}" from the schedule.`, 'info');
  };

  return (
    <div className="page">
      <PageHeader
        eyebrow="Care"
        title="Medications"
        description={`Active prescriptions and today's doses for ${selectedMember?.name || 'this member'}.`}
        actions={
          <button type="button" className="btn btn-secondary" onClick={() => fetchMedications(memberId)} disabled={medStatus.loading}>
            <RefreshCw className={medStatus.loading ? 'animate-spin' : ''} />
            {medStatus.loading ? 'Loading…' : 'Refresh'}
          </button>
        }
      />

      {isPatient && (
        <div className="callout callout-info">
          <Info aria-hidden />
          <p>Your medications are prescribed by your physician and managed by your care team. Contact them to request changes.</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile label="Active medications" value={memberMedications.length} icon={Pill} tone="brand" />
        <StatTile label="Taken today" value={takenCount} icon={Check} tone="success" />
        <StatTile
          label="Still due today"
          value={memberMedications.length - takenCount}
          icon={Pill}
          tone={memberMedications.length - takenCount > 0 ? 'warning' : 'neutral'}
        />
      </div>

      <Card title="Medication schedule" subtitle={`${memberMedications.length} on file`} flush>
        {medStatus.loading ? (
          <SkeletonRows rows={3} />
        ) : medStatus.error ? (
          <div className="flex flex-col items-center px-6 py-10 text-center" role="alert">
            <span className="icon-tile mb-3 h-10 w-10 bg-red-50 text-red-600 dark:bg-red-950/60">
              <AlertCircle aria-hidden />
            </span>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Couldn't load medications</p>
            <p className="mt-1 max-w-md text-13 text-slate-500">{medStatus.error}</p>
            <button type="button" onClick={() => fetchMedications(memberId)} className="btn btn-secondary btn-sm mt-4">
              <RefreshCw />
              Try again
            </button>
          </div>
        ) : memberMedications.length === 0 ? (
          <EmptyState
            icon={Pill}
            title="No medications on file"
            description={isPatient ? undefined : 'Add a medication using the form below.'}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Medication</th>
                  <th>Schedule</th>
                  <th className="hidden md:table-cell">Started</th>
                  <th>Today</th>
                  <th className="w-0 text-right">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {memberMedications.map((med) => (
                  <tr key={med.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <span className="icon-tile h-8 w-8 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                          <Pill aria-hidden />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-slate-900 dark:text-slate-100">{med.name}</p>
                          <p className="text-xs tabular-nums text-slate-500">
                            {med.dosage}
                            {!med.active && <span className="ml-2 font-medium text-slate-500">· Inactive</span>}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <p className="text-slate-800 dark:text-slate-200">{frequencyLabel(med.frequency)}</p>
                      <p className="text-xs tabular-nums text-slate-500">{(med.times ?? []).join(', ') || '—'}</p>
                    </td>
                    <td className="hidden whitespace-nowrap tabular-nums md:table-cell">{formatDate(med.start_date)}</td>
                    <td>
                      {med.taken_today ? <StatusBadge severity="success">Taken</StatusBadge> : <StatusBadge severity="warning">Due</StatusBadge>}
                    </td>
                    <td>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleMarkTaken(med.id, med.name)}
                          disabled={med.taken_today}
                          className="btn btn-secondary btn-sm"
                        >
                          <Check />
                          <span className="hidden sm:inline">Mark taken</span>
                          <span className="sr-only sm:hidden">Mark {med.name} taken</span>
                        </button>
                        {!isPatient && (
                          <button
                            type="button"
                            onClick={() => handleRemove(med.id, med.name)}
                            className="btn btn-ghost btn-icon btn-sm text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/40"
                            aria-label={`Remove ${med.name}`}
                            title="Remove"
                          >
                            <Trash2 />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {!isPatient && (
        <Card title="Add medication" subtitle="Only physicians and caregivers can prescribe or adjust schedules.">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Medication name" htmlFor="med-name" error={fieldErrors.name} required>
              <input
                id="med-name"
                className={`input ${fieldErrors.name ? 'input-invalid' : ''}`}
                placeholder="e.g. Metformin"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                onBlur={(e) => handleBlur('name', e.target.value)}
              />
            </Field>
            <Field label="Dosage" htmlFor="med-dosage" error={fieldErrors.dosage} required>
              <input
                id="med-dosage"
                className={`input ${fieldErrors.dosage ? 'input-invalid' : ''}`}
                placeholder="e.g. 500 mg"
                value={form.dosage}
                onChange={(e) => setForm({ ...form, dosage: e.target.value })}
                onBlur={(e) => handleBlur('dosage', e.target.value)}
              />
            </Field>
            <Field label="Frequency" htmlFor="med-frequency">
              <select id="med-frequency" className="select" value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })}>
                {FREQUENCY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="First dose time" htmlFor="med-time">
              <input id="med-time" type="time" className="input tabular-nums" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
            </Field>
          </div>
          <div className="mt-5 flex justify-end">
            <button type="button" onClick={handleAdd} disabled={submitting || medStatus.loading} className="btn btn-primary">
              {submitting ? <Loader2 className="animate-spin" /> : <Plus />}
              {submitting ? 'Adding…' : 'Add to schedule'}
            </button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default MedicationManager;
