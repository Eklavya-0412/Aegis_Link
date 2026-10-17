import React, { useEffect, useState } from 'react';
import { AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import LineChart from '../../components/charts/LineChart';
import { User } from '../../types';
import { useToastStore } from '../../store/toastStore';
import { useHealthDataStore } from '../../store/healthDataStore';
import { useAuthStore } from '../../store/authStore';

interface VitalManagerProps {
  selectedMember: User | null;
}

type VitalType = 'blood_pressure_systolic' | 'blood_pressure_diastolic' | 'heart_rate' | 'blood_glucose' | 'oxygen_saturation' | 'temperature' | 'weight';

interface VitalConfig {
  label: string;
  placeholder: string;
  defaultUnit: string;
  description: string;
  min: number;
  max: number;
}

const VITAL_CONFIGS: Record<VitalType, VitalConfig> = {
  blood_pressure_systolic: { label: 'BP – Systolic', placeholder: 'e.g. 120', defaultUnit: 'mmHg', description: 'Upper blood pressure reading', min: 70, max: 200 },
  blood_pressure_diastolic: { label: 'BP – Diastolic', placeholder: 'e.g. 80', defaultUnit: 'mmHg', description: 'Lower blood pressure reading', min: 40, max: 130 },
  heart_rate: { label: 'Heart Rate', placeholder: 'e.g. 72', defaultUnit: 'bpm', description: 'Beats per minute', min: 30, max: 220 },
  blood_glucose: { label: 'Blood Glucose', placeholder: 'e.g. 95', defaultUnit: 'mg/dL', description: 'Fasting / Post-meal blood sugar', min: 20, max: 600 },
  oxygen_saturation: { label: 'Oxygen Saturation (SpO₂)', placeholder: 'e.g. 98', defaultUnit: '%', description: 'Blood oxygen level', min: 50, max: 100 },
  temperature: { label: 'Body Temperature', placeholder: 'e.g. 98.6', defaultUnit: '°F', description: 'Body temperature', min: 90, max: 110 },
  weight: { label: 'Body Weight', placeholder: 'e.g. 70', defaultUnit: 'kg', description: 'Kilograms', min: 1, max: 400 },
};

// ── Sub-components ─────────────────────────────────────────────────────

const LoadingSpinner: React.FC<{ message?: string }> = ({ message = 'Loading vitals…' }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400 dark:text-gray-500">
    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
    <p className="text-sm font-medium">{message}</p>
  </div>
);

const ErrorBanner: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center py-10 gap-4">
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

const VitalManager: React.FC<VitalManagerProps> = ({ selectedMember }) => {
  const { currentUser } = useAuthStore();
  const { vitals, status, fetchVitals, addVital } = useHealthDataStore();
  const { showToast } = useToastStore();

  const memberId = selectedMember?.user_id || currentUser?.user_id || '';
  const memberVitals = vitals.filter((v) => v.member_id === memberId);

  const [selectedType, setSelectedType] = useState<VitalType>('blood_pressure_systolic');
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState(VITAL_CONFIGS['blood_pressure_systolic'].defaultUnit);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const vitalsStatus = status.vitals;

  // Fetch vitals when the selected member changes
  useEffect(() => {
    if (memberId) {
      fetchVitals(memberId);
    }
  }, [memberId, fetchVitals]);

  const handleTypeChange = (newType: VitalType) => {
    setSelectedType(newType);
    setUnit(VITAL_CONFIGS[newType].defaultUnit);
    setValue('');
    setError('');
  };

  const handleSubmit = async () => {
    if (!value.trim()) {
      setError('Vital value is required');
      return;
    }
    const numVal = parseFloat(value);
    if (isNaN(numVal)) {
      setError('Please enter a valid number');
      return;
    }
    setSubmitting(true);
    try {
      const vital = {
        id: `local_${Date.now()}`,
        type: selectedType,
        value: value.trim(),
        unit: unit || VITAL_CONFIGS[selectedType].defaultUnit,
        recorded_at: new Date().toISOString(),
        member_id: memberId,
      };
      await addVital(vital);
      setValue('');
      setError('');
      showToast(`${VITAL_CONFIGS[selectedType].label}: ${vital.value} ${vital.unit} logged`, 'success');
    } catch {
      showToast('Failed to log vital. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Build chart data from the currently selected vital type
  const chartVitals = memberVitals
    .filter((v) => v.type === selectedType)
    .slice(-12)
    .reverse();

  const chartData = chartVitals.map((v) => parseFloat(v.value) || 0);
  const chartLabels = chartVitals.map((v) =>
    new Date(v.recorded_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  );

  const config = VITAL_CONFIGS[selectedType];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 relative">
          <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 opacity-50 blur" />
          <div className="relative bg-white/90 dark:bg-gray-900/90 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl min-h-[260px]">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                {config.label} Trend
              </h3>
              <button
                onClick={() => fetchVitals(memberId)}
                disabled={vitalsStatus.loading}
                title="Refresh vitals"
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 transition disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${vitalsStatus.loading ? 'animate-spin' : ''}`} />
                {vitalsStatus.loading ? 'Loading…' : 'Refresh'}
              </button>
            </div>

            {vitalsStatus.loading ? (
              <LoadingSpinner />
            ) : vitalsStatus.error ? (
              <ErrorBanner message={vitalsStatus.error} onRetry={() => fetchVitals(memberId)} />
            ) : (
              <LineChart
                data={chartData.length ? chartData : [120, 118, 122, 119, 125]}
                labels={chartLabels.length ? chartLabels : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']}
                title={`${config.label} (${config.defaultUnit})`}
              />
            )}
          </div>
        </div>

        {/* Log Vital Form */}
        <div className="relative">
          <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-br from-emerald-400 via-cyan-300 to-blue-400 opacity-50 blur" />
          <div className="relative bg-white/90 dark:bg-gray-900/90 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl">
            <h4 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Log Vital Reading</h4>
            <div className="space-y-3">
              {/* Vital type */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">
                  Vital Type
                </label>
                <select
                  aria-label="Select Vital Type"
                  className="w-full min-h-[44px] p-3 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500"
                  value={selectedType}
                  onChange={(e) => handleTypeChange(e.target.value as VitalType)}
                >
                  {(Object.keys(VITAL_CONFIGS) as VitalType[]).map((k) => (
                    <option key={k} value={k} className="bg-white dark:bg-gray-800">
                      {VITAL_CONFIGS[k].label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Value */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">
                  Reading ({config.description})
                </label>
                <input
                  aria-label="Vital Reading Value"
                  type="number"
                  className={`w-full min-h-[44px] p-3 text-base bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                  placeholder={config.placeholder}
                  value={value}
                  min={config.min}
                  max={config.max}
                  onChange={(e) => { setValue(e.target.value); if (error) setError(''); }}
                  onBlur={(e) => setError(!e.target.value.trim() ? 'Vital value is required' : '')}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                />
                {error && <p className="text-xs text-red-600 font-medium mt-1">{error}</p>}
              </div>

              {/* Unit */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">
                  Unit
                </label>
                <input
                  aria-label="Measurement Unit"
                  className="w-full min-h-[44px] p-3 text-base bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting || vitalsStatus.loading}
                className="w-full min-h-[48px] bg-blue-600 hover:bg-blue-700 text-white font-bold text-base rounded-xl shadow-lg transition active:scale-95 disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Logging…
                  </>
                ) : (
                  'Log Vital Reading'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Vitals Log */}
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl">
        <h4 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Recent Vitals Log</h4>

        {vitalsStatus.loading ? (
          <LoadingSpinner message="Fetching your vitals history…" />
        ) : vitalsStatus.error ? (
          <ErrorBanner message={vitalsStatus.error} onRetry={() => fetchVitals(memberId)} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {memberVitals.slice(0, 12).map((vital) => (
              <div key={vital.id} className="relative p-[1px] rounded-2xl overflow-hidden group">
                <div className="absolute -inset-[1px] bg-gradient-to-br from-blue-400 via-indigo-300 to-emerald-400 opacity-60 blur-md group-hover:opacity-90 transition" />
                <div className="relative p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-gray-900 dark:text-white text-xs uppercase tracking-wider">
                      {VITAL_CONFIGS[vital.type as VitalType]?.label ?? vital.type.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(vital.recorded_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xl font-extrabold text-blue-600 dark:text-blue-400 my-1">
                    {vital.value}{' '}
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">{vital.unit}</span>
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(vital.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {memberVitals.length === 0 && (
              <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
                <p className="font-medium">No vital readings recorded yet.</p>
                <p className="text-sm mt-1">Use the form above to log your first reading.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VitalManager;
