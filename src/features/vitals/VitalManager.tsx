import React, { useEffect, useMemo, useState } from 'react';
import { Activity, AlertCircle, Info, Loader2, Plus, RefreshCw } from 'lucide-react';
import LineChart, { ChartReferenceLine } from '../../components/charts/LineChart';
import { CHART_COLORS } from '../../components/charts/ChartFrame';
import { User } from '../../types';
import { useToastStore } from '../../store/toastStore';
import { useHealthDataStore } from '../../store/healthDataStore';
import { useAuthStore } from '../../store/authStore';
import { Card, EmptyState, Field, PageHeader } from '../../components/ui';
import { SkeletonRows } from '../../components/common/RemoteState';
import {
  canonicalType,
  describeLimits,
  isSimulatedReading,
  latestByType,
  LOGGABLE_TYPES,
  primaryValue,
  seriesOf,
  sortByRecordedDesc,
  VITAL_DEFINITIONS,
  VITAL_ORDER,
  VitalType,
  vitalLabel
} from '../../constants/vitals';
import { axisLabels, formatDate, formatTime } from '../../utils/format';
import VitalReadingTile, { ReadingSource, ReadingStatusBadge } from './VitalReadingTile';

interface VitalManagerProps {
  selectedMember: User | null;
}

const PAGE_SIZE = 20;

const ErrorState: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
  <div className="flex flex-col items-center px-6 py-10 text-center" role="alert">
    <span className="icon-tile mb-3 h-10 w-10 bg-red-50 text-red-600 dark:bg-red-950/60">
      <AlertCircle aria-hidden />
    </span>
    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Couldn't load vital signs</p>
    <p className="mt-1 max-w-md text-13 text-slate-500">{message}</p>
    <button type="button" onClick={onRetry} className="btn btn-secondary btn-sm mt-4">
      <RefreshCw />
      Try again
    </button>
  </div>
);

const VitalManager: React.FC<VitalManagerProps> = ({ selectedMember }) => {
  const { currentUser } = useAuthStore();
  const { vitals, status, fetchVitals, addVital } = useHealthDataStore();
  const { showToast } = useToastStore();

  const memberId = selectedMember?.user_id || currentUser?.user_id || '';
  const memberVitals = useMemo(() => sortByRecordedDesc(vitals.filter((v) => v.member_id === memberId)), [vitals, memberId]);
  const latest = useMemo(() => latestByType(memberVitals), [memberVitals]);

  const [selectedType, setSelectedType] = useState<VitalType>('blood_pressure_systolic');
  const [chartType, setChartType] = useState<VitalType>('blood_pressure_systolic');
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState(VITAL_DEFINITIONS.blood_pressure_systolic.unit);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<'all' | VitalType>('all');
  const [visible, setVisible] = useState(PAGE_SIZE);

  const vitalsStatus = status.vitals;

  // Fetch vitals when the selected member changes
  useEffect(() => {
    if (memberId) {
      fetchVitals(memberId);
    }
  }, [memberId, fetchVitals]);

  const handleTypeChange = (newType: VitalType) => {
    setSelectedType(newType);
    setUnit(VITAL_DEFINITIONS[newType].unit);
    setValue('');
    setError('');
  };

  const selectForChart = (type: VitalType) => {
    setChartType(type);
    if (VITAL_DEFINITIONS[type].loggable) handleTypeChange(type);
  };

  const handleSubmit = async () => {
    if (!value.trim()) {
      setError('Enter a reading value');
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
        unit: unit || VITAL_DEFINITIONS[selectedType].unit,
        recorded_at: new Date().toISOString(),
        member_id: memberId
      };
      await addVital(vital);
      setValue('');
      setError('');
      showToast(`Logged ${VITAL_DEFINITIONS[selectedType].label}: ${vital.value} ${vital.unit}`, 'success');
    } catch {
      showToast('Failed to log vital. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const formDef = VITAL_DEFINITIONS[selectedType];
  const chartDef = VITAL_DEFINITIONS[chartType];
  const series = useMemo(() => seriesOf(memberVitals, chartType), [memberVitals, chartType]);

  const referenceLines: ChartReferenceLine[] = [];
  if (chartDef.limits?.high !== undefined) referenceLines.push({ y: chartDef.limits.high, label: `Alert > ${chartDef.limits.high}`, tone: 'warning' });
  if (chartDef.limits?.low !== undefined) referenceLines.push({ y: chartDef.limits.low, label: `Alert < ${chartDef.limits.low}`, tone: 'warning' });

  const limitsText = describeLimits(chartType);
  const history = historyFilter === 'all' ? memberVitals : memberVitals.filter((v) => canonicalType(v.type) === historyFilter);
  // Show the combined BP tile only when such readings exist (live feed / sample data).
  const tileTypes = VITAL_ORDER.filter((t) => t !== 'bp' || latest.bp);

  return (
    <div className="page">
      <PageHeader
        eyebrow="Care"
        title="Vital signs"
        description={`Measurements recorded for ${selectedMember?.name || 'this member'}. Select a measurement to see its trend.`}
        actions={
          <button type="button" className="btn btn-secondary" onClick={() => fetchVitals(memberId)} disabled={vitalsStatus.loading}>
            <RefreshCw className={vitalsStatus.loading ? 'animate-spin' : ''} />
            {vitalsStatus.loading ? 'Loading…' : 'Refresh'}
          </button>
        }
      />

      {vitalsStatus.error && !vitalsStatus.loading && (
        <div className="card">
          <ErrorState message={vitalsStatus.error} onRetry={() => fetchVitals(memberId)} />
        </div>
      )}

      {/* Latest reading per measurement */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        {tileTypes.map((type) => {
          const reading = latest[type];
          if (reading) {
            return <VitalReadingTile key={type} vital={reading} selected={chartType === type} onClick={() => selectForChart(type)} />;
          }
          return (
            <button
              key={type}
              type="button"
              onClick={() => selectForChart(type)}
              aria-pressed={chartType === type}
              className={`rounded-lg border border-dashed bg-white p-3 text-left transition-colors hover:border-slate-400 dark:bg-slate-900 ${
                chartType === type ? 'border-brand-500 ring-1 ring-brand-500' : 'border-slate-300 dark:border-slate-700'
              }`}
            >
              <p className="text-xs font-medium text-slate-500">{VITAL_DEFINITIONS[type].label}</p>
              <p className="mt-1 text-xl font-semibold text-slate-300 dark:text-slate-600">—</p>
              <p className="mt-2 text-xs text-slate-400">{vitalsStatus.loading ? 'Loading…' : 'No readings yet'}</p>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card
          title={`${chartDef.label} trend`}
          subtitle={series.length ? `Last ${series.length} reading${series.length === 1 ? '' : 's'} · ${chartDef.unit}` : chartDef.description}
          className="xl:col-span-2"
        >
          {vitalsStatus.loading && series.length === 0 ? (
            <div className="flex h-[240px] items-center justify-center text-slate-400">
              <Loader2 className="h-6 w-6 animate-spin" aria-label="Loading readings" />
            </div>
          ) : (
            <LineChart
              bare
              data={series.map((v) => primaryValue(v) ?? 0)}
              labels={axisLabels(series.map((v) => v.recorded_at))}
              unit={chartDef.unit}
              color={CHART_COLORS.brand}
              height={240}
              referenceLines={referenceLines}
              emptyMessage={`No ${chartDef.label} readings recorded yet`}
            />
          )}
          <div className="mt-4 flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            <p>
              {limitsText ? (
                <>
                  System alert limits: <span className="font-medium tabular-nums text-slate-700 dark:text-slate-300">{limitsText}</span>
                  {chartType === 'bp' && ' (systolic)'}. Readings outside these limits trigger an alert to the care team. They are
                  platform defaults, not personal targets set by your physician.
                </>
              ) : (
                <>No automatic alert limits are configured for {chartDef.label}.</>
              )}
            </p>
          </div>
        </Card>

        <Card title="Log a reading" subtitle="Manual entry">
          <div className="space-y-4">
            <Field label="Measurement" htmlFor="vital-type">
              <select id="vital-type" className="select" value={selectedType} onChange={(e) => handleTypeChange(e.target.value as VitalType)}>
                {LOGGABLE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {VITAL_DEFINITIONS[type].label} ({VITAL_DEFINITIONS[type].unit})
                  </option>
                ))}
              </select>
            </Field>

            <div className="grid grid-cols-[minmax(0,1fr)_96px] gap-3">
              <Field label="Value" htmlFor="vital-value" error={error} helper={formDef.description}>
                <input
                  id="vital-value"
                  type="number"
                  inputMode="decimal"
                  min={formDef.min}
                  max={formDef.max}
                  className={`input tabular-nums ${error ? 'input-invalid' : ''}`}
                  placeholder={formDef.placeholder}
                  value={value}
                  onChange={(e) => {
                    setValue(e.target.value);
                    if (error) setError('');
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  aria-invalid={!!error}
                />
              </Field>
              <Field label="Unit" htmlFor="vital-unit">
                <input id="vital-unit" className="input" value={unit} onChange={(e) => setUnit(e.target.value)} />
              </Field>
            </div>

            <button type="button" onClick={handleSubmit} disabled={submitting || vitalsStatus.loading} className="btn btn-primary w-full">
              {submitting ? <Loader2 className="animate-spin" /> : <Plus />}
              {submitting ? 'Saving…' : 'Save reading'}
            </button>
            <p className="text-xs text-slate-500">Recorded with the current date and time.</p>
          </div>
        </Card>
      </div>

      <Card
        title="Reading history"
        subtitle={`${history.length} readings`}
        flush
        actions={
          <select
            className="select input-sm w-44 text-13"
            aria-label="Filter readings by measurement"
            value={historyFilter}
            onChange={(e) => {
              setHistoryFilter(e.target.value as 'all' | VitalType);
              setVisible(PAGE_SIZE);
            }}
          >
            <option value="all">All measurements</option>
            {VITAL_ORDER.map((type) => (
              <option key={type} value={type}>
                {VITAL_DEFINITIONS[type].label}
              </option>
            ))}
          </select>
        }
      >
        {vitalsStatus.loading && history.length === 0 ? (
          <SkeletonRows rows={4} />
        ) : history.length === 0 ? (
          <EmptyState icon={Activity} title="No readings recorded yet" description="Use the form above to log the first reading." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Measurement</th>
                    <th className="text-right">Reading</th>
                    <th>Status</th>
                    <th>Recorded</th>
                    <th className="hidden sm:table-cell">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {history.slice(0, visible).map((vital) => (
                    <tr key={vital.id}>
                      <td className="font-medium text-slate-900 dark:text-slate-100">{vitalLabel(vital.type)}</td>
                      <td className="whitespace-nowrap text-right tabular-nums">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">{vital.value}</span>{' '}
                        <span className="text-xs text-slate-500">{vital.unit}</span>
                      </td>
                      <td>
                        <ReadingStatusBadge vital={vital} />
                      </td>
                      <td className="whitespace-nowrap tabular-nums">
                        {formatDate(vital.recorded_at)} <span className="text-slate-400">·</span> {formatTime(vital.recorded_at)}
                      </td>
                      <td className="hidden sm:table-cell">
                        {isSimulatedReading(vital) ? <ReadingSource vital={vital} /> : <span className="text-xs text-slate-500">Recorded entry</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {history.length > visible && (
              <div className="border-t border-slate-100 px-5 py-3 text-center dark:border-slate-800">
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                  Show {Math.min(PAGE_SIZE, history.length - visible)} more
                </button>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
};

export default VitalManager;
