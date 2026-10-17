import React, { useEffect, useState } from 'react';
import { AlertCircle, Loader2, RefreshCw, CheckCircle2, Trash2 } from 'lucide-react';
import { User } from '../../types';
import { useToastStore } from '../../store/toastStore';
import { useAuthStore } from '../../store/authStore';
import { useHealthDataStore } from '../../store/healthDataStore';

interface MedicationManagerProps {
  selectedMember: User | null;
}

const FREQUENCY_OPTIONS = [
  { value: 'once_daily', label: 'Once Daily' },
  { value: 'twice_daily', label: 'Twice Daily' },
  { value: 'three_times_daily', label: 'Three Times Daily' },
  { value: 'four_times_daily', label: 'Four Times Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'as_needed', label: 'As Needed' },
];

// ── Sub-components ─────────────────────────────────────────────────────

const LoadingSpinner: React.FC<{ message?: string }> = ({ message = 'Loading medications…' }) => (
  <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-400 dark:text-gray-500">
    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
    <p className="text-sm font-medium">{message}</p>
  </div>
);

const ErrorBanner: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center py-8 gap-4">
    <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
      <AlertCircle className="w-5 h-5 flex-shrink-0" />
      <p className="text-sm font-semibold">{message}</p>
    </div>
    <button
      onClick={onRetry}
      className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition"
    >
      <RefreshCw className="w-4 h-4" />
      Retry
    </button>
  </div>
);

// ── Main Component ─────────────────────────────────────────────────────

const MedicationManager: React.FC<MedicationManagerProps> = ({ selectedMember }) => {
  const { currentUser } = useAuthStore();
  const {
    medications,
    status,
    fetchMedications,
    addMedication,
    updateMedication,
    deleteMedication,
  } = useHealthDataStore();
  const { showToast } = useToastStore();

  const isPatient = currentUser?.role === 'patient';
  const memberId = selectedMember?.user_id || currentUser?.user_id || '';
  const memberMedications = medications.filter((m) => m.member_id === memberId);

  const [form, setForm] = useState({
    name: '',
    dosage: '',
    frequency: 'once_daily',
    time: '08:00',
  });
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; dosage?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const medStatus = status.medications;

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
    if (Object.keys(errors).length) { setFieldErrors(errors); return; }

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
        member_id: memberId,
      });
      setForm({ name: '', dosage: '', frequency: 'once_daily', time: '08:00' });
      setFieldErrors({});
      showToast(`"${form.name}" added to medication list`, 'success');
    } catch {
      showToast('Failed to add medication. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkTaken = async (id: string, name: string) => {
    await updateMedication(id, { taken_today: true });
    showToast(`Marked "${name}" as taken ✓`, 'success');
  };

  const handleRemove = async (id: string, name: string) => {
    await deleteMedication(id);
    showToast(`Removed "${name}"`, 'info');
  };

  return (
    <div className="space-y-6">
      {/* Medication List */}
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
            Medications — {selectedMember?.name || 'Patient'}
          </h3>
          <div className="flex items-center gap-2">
            {isPatient && (
              <span className="text-xs bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 font-medium px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-800">
                Managed by Care Team
              </span>
            )}
            <button
              onClick={() => fetchMedications(memberId)}
              disabled={medStatus.loading}
              title="Refresh medications"
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${medStatus.loading ? 'animate-spin' : ''}`} />
              {medStatus.loading ? 'Loading…' : 'Refresh'}
            </button>
          </div>
        </div>

        {medStatus.loading ? (
          <LoadingSpinner />
        ) : medStatus.error ? (
          <ErrorBanner message={medStatus.error} onRetry={() => fetchMedications(memberId)} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {memberMedications.map((med) => (
              <div key={med.id} className="relative p-[1px] rounded-2xl overflow-hidden group">
                <div className="absolute -inset-[1px] bg-gradient-to-br from-blue-400 via-indigo-300 to-emerald-400 opacity-60 blur-md group-hover:opacity-90 transition" />
                <div className="relative p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-lg text-gray-800 dark:text-white truncate pr-2">{med.name}</span>
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0 ${
                          med.taken_today
                            ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300'
                        }`}
                      >
                        {med.taken_today ? '✓ Taken' : 'Due Today'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                      {med.dosage} • {med.frequency.replace(/_/g, ' ')}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Scheduled: {(med.times ?? []).join(', ') || '—'}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Since {med.start_date}
                      {!med.active && (
                        <span className="ml-2 text-red-500 font-semibold">· Inactive</span>
                      )}
                    </p>
                  </div>

                  <div className="flex gap-2 pt-3 mt-3 border-t border-gray-100 dark:border-gray-700">
                    {!med.taken_today && (
                      <button
                        onClick={() => handleMarkTaken(med.id, med.name)}
                        className="flex-1 flex items-center justify-center gap-1.5 min-h-[40px] bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Mark Taken
                      </button>
                    )}
                    {!isPatient && (
                      <button
                        onClick={() => handleRemove(med.id, med.name)}
                        className="flex items-center justify-center gap-1.5 min-h-[40px] px-4 bg-red-100 dark:bg-red-950/80 hover:bg-red-200 text-red-700 dark:text-red-300 font-semibold text-sm rounded-xl transition"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {memberMedications.length === 0 && (
              <div className="col-span-full text-center py-10 text-gray-500 dark:text-gray-400">
                <p className="font-medium">No medications found for {selectedMember?.name || 'this patient'}.</p>
                <p className="text-sm mt-1">Add medications using the form below.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Medication Form (doctors / caregivers only) */}
      {!isPatient && (
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl">
          <h4 className="text-xl font-bold mb-1 text-gray-800 dark:text-white">Prescribe New Medication</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
            Only authorized doctors and caregivers can prescribe medications.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Name */}
            <div>
              <input
                className={`w-full min-h-[44px] p-3 text-base bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 ${
                  fieldErrors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                }`}
                placeholder="Medication Name *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                onBlur={(e) => handleBlur('name', e.target.value)}
              />
              {fieldErrors.name && <p className="text-xs text-red-600 font-medium mt-1">{fieldErrors.name}</p>}
            </div>

            {/* Dosage */}
            <div>
              <input
                className={`w-full min-h-[44px] p-3 text-base bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 ${
                  fieldErrors.dosage ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                }`}
                placeholder="Dosage (e.g. 500 mg) *"
                value={form.dosage}
                onChange={(e) => setForm({ ...form, dosage: e.target.value })}
                onBlur={(e) => handleBlur('dosage', e.target.value)}
              />
              {fieldErrors.dosage && <p className="text-xs text-red-600 font-medium mt-1">{fieldErrors.dosage}</p>}
            </div>

            {/* Frequency */}
            <select
              className="w-full min-h-[44px] p-3 text-base bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500"
              value={form.frequency}
              onChange={(e) => setForm({ ...form, frequency: e.target.value })}
            >
              {FREQUENCY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-white dark:bg-gray-800">
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Time */}
            <input
              type="time"
              className="w-full min-h-[44px] p-3 text-base bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
            />
          </div>

          <button
            onClick={handleAdd}
            disabled={submitting || medStatus.loading}
            className="mt-5 flex items-center gap-2 min-h-[48px] px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base rounded-xl shadow-lg transition active:scale-95 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Adding…
              </>
            ) : (
              'Prescribe Medication'
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default MedicationManager;
