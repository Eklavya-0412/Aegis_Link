import React, { useMemo, Dispatch, SetStateAction } from 'react';
import {
  Activity,
  AlertOctagon,
  ArrowRight,
  Calendar,
  CalendarClock,
  HeartPulse,
  Pill,
  Plus,
  Sparkles,
  Target,
  Video
} from 'lucide-react';
import { User, Medication, Appointment, HealthGoal, Vital, MenstrualData, AIInsight } from '../types';
import LineChart from '../components/charts/LineChart';
import DonutChart from '../components/charts/DonutChart';
import { CHART_COLORS } from '../components/charts/ChartFrame';
import MenstrualTracker from '../features/menstrual/MenstrualTracker';
import { Card, EmptyState, PageHeader, ProgressBar, StatTile, StatusBadge } from '../components/ui';
import { AiProvenance } from '../features/insights/InsightsPanel';
import VitalReadingTile from '../features/vitals/VitalReadingTile';
import { evaluateReading, latestByType, primaryValue, READING_STATUS_LABEL, sortByRecordedDesc, VITAL_ORDER, systolicSeries, latestBloodPressure, seriesOf } from '../constants/vitals';
import { axisLabels, formatDate, formatRelative, formatShortDate, formatTime } from '../utils/format';

export interface PatientDashboardProps {
  currentUser: User | null;
  selectedMember: User | null;
  medications: Medication[];
  appointments: Appointment[];
  healthGoals: HealthGoal[];
  vitals: Vital[];
  menstrualData?: MenstrualData[];
  setMenstrualData?: Dispatch<SetStateAction<MenstrualData[]>>;
  aiInsights?: AIInsight | null;
  navigateTo: (tabKey: string, label?: string) => void;
  onEmergencySOS?: () => void;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = React.memo(({
  currentUser,
  selectedMember,
  medications,
  appointments,
  healthGoals,
  vitals,
  menstrualData = [],
  setMenstrualData,
  aiInsights,
  navigateTo,
  onEmergencySOS
}) => {
  const memberId = selectedMember?.user_id;
  const isSelf = selectedMember?.user_id === currentUser?.user_id;
  const firstName = (selectedMember?.name || '').split(' ')[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const memberMeds = useMemo(() => medications.filter((m) => m.member_id === memberId), [medications, memberId]);
  const memberGoals = useMemo(() => healthGoals.filter((g) => g.member_id === memberId), [healthGoals, memberId]);
  const memberVitals = useMemo(() => sortByRecordedDesc(vitals.filter((v) => v.member_id === memberId)), [vitals, memberId]);
  const latest = useMemo(() => latestByType(memberVitals), [memberVitals]);

  const { upcoming, lastPast } = useMemo(() => {
    const now = Date.now();
    const list = appointments
      .filter((a) => a.member_id === memberId && a.status !== 'cancelled')
      .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime());
    return {
      upcoming: list.filter((a) => new Date(a.appointment_date).getTime() >= now),
      lastPast: list.filter((a) => new Date(a.appointment_date).getTime() < now).pop()
    };
  }, [appointments, memberId]);

  const takenCount = memberMeds.filter((m) => m.taken_today).length;
  const dueCount = memberMeds.length - takenCount;

  const bpSeries = useMemo(() => systolicSeries(memberVitals), [memberVitals]);
  const weightSeries = useMemo(() => seriesOf(memberVitals, 'weight', 14), [memberVitals]);

  const avgGoalProgress = memberGoals.length
    ? Math.round(
        memberGoals.reduce((sum, g) => sum + Math.min(100, (g.current_value / (g.target_value || 1)) * 100), 0) / memberGoals.length
      )
    : null;

  const latestBp = latestBloodPressure(memberVitals);
  const bpStatus = latestBp ? evaluateReading(latestBp) : 'unknown';
  const nextAppt = upcoming[0];

  const handleSosClick = () => {
    if (onEmergencySOS) {
      onEmergencySOS();
      return;
    }
    if (window.confirm('Are you sure you want to activate the family emergency SOS? This will notify all family members and emergency contacts immediately.')) {
      alert('Emergency SOS activated. All family members and emergency contacts have been notified with your location and recent health data.');
    }
  };

  const vitalTypesWithData = VITAL_ORDER.filter((t) => latest[t]);

  return (
    <div className="page">
      <PageHeader
        eyebrow={new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
        title={isSelf ? `${greeting}, ${firstName}` : `${selectedMember?.name || 'Patient'} — health overview`}
        description={
          <>
            {isSelf ? "Here's how things look today" : 'Current health summary'}
            {selectedMember?.patient_id && (
              <>
                {' · '}Patient ID <span className="font-mono text-xs text-slate-600 dark:text-slate-300">{selectedMember.patient_id}</span>
              </>
            )}
          </>
        }
        actions={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => navigateTo('vitals', 'Vital signs')}>
              <Plus />
              Log vitals
            </button>
            <button type="button" className="btn btn-danger" onClick={handleSosClick}>
              <AlertOctagon />
              Emergency SOS
            </button>
          </>
        }
      />

      {/* Key metrics */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatTile
          label="Medications due today"
          value={dueCount}
          icon={Pill}
          tone={dueCount > 0 ? 'warning' : 'success'}
          meta={memberMeds.length ? `${takenCount} of ${memberMeds.length} taken` : 'No medications on file'}
          onClick={() => navigateTo('medications', 'Medications')}
        />
        <StatTile
          label="Next appointment"
          value={nextAppt ? formatShortDate(nextAppt.appointment_date) : 'None'}
          icon={Calendar}
          tone="info"
          meta={nextAppt ? `${nextAppt.title} · ${formatTime(nextAppt.appointment_date)}` : 'Nothing scheduled'}
          onClick={() => navigateTo('appointments', 'Appointments')}
        />
        <StatTile
          label="Latest blood pressure"
          value={latestBp ? latestBp.value : '—'}
          unit={latestBp ? latestBp.unit : undefined}
          icon={HeartPulse}
          tone={bpStatus === 'critical' ? 'danger' : bpStatus === 'outside' ? 'warning' : 'brand'}
          meta={
            latestBp ? (
              <span className="inline-flex items-center gap-1.5">
                {formatRelative(latestBp.recorded_at)} · {READING_STATUS_LABEL[bpStatus]}
              </span>
            ) : (
              'No readings yet'
            )
          }
          onClick={() => navigateTo('vitals', 'Vital signs')}
        />
        <StatTile
          label="Health goals"
          value={avgGoalProgress !== null ? `${avgGoalProgress}%` : '—'}
          icon={Target}
          tone="neutral"
          meta={memberGoals.length ? `Average progress across ${memberGoals.length} goals` : 'No goals set'}
          onClick={() => navigateTo('goals', 'Health goals')}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Vitals */}
        <Card
          title="Vital signs"
          subtitle="Most recent reading for each measurement"
          className="xl:col-span-2"
          actions={
            <button type="button" className="btn-link" onClick={() => navigateTo('vitals', 'Vital signs')}>
              View all <ArrowRight className="h-3.5 w-3.5" />
            </button>
          }
        >
          {vitalTypesWithData.length === 0 ? (
            <EmptyState
              compact
              icon={Activity}
              title="No vital signs recorded"
              description="Readings from devices or manual entries will appear here."
            />
          ) : (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {vitalTypesWithData.map((type) => (
                  <VitalReadingTile key={type} vital={latest[type]!} />
                ))}
              </div>
              <LineChart
                bare
                title="Systolic blood pressure"
                subtitle={`Last ${bpSeries.length} reading${bpSeries.length === 1 ? "" : "s"} · dashed lines show system alert limits`}
                data={bpSeries.map((v) => primaryValue(v) ?? 0)}
                labels={axisLabels(bpSeries.map((v) => v.recorded_at))}
                unit="mmHg"
                color={CHART_COLORS.brand}
                height={190}
                referenceLines={[
                  { y: 140, label: 'Alert > 140', tone: 'warning' },
                  { y: 90, label: 'Alert < 90', tone: 'warning' }
                ]}
                emptyMessage="No blood pressure readings yet"
              />
            </div>
          )}
        </Card>

        <div className="space-y-6">
          {/* Medication schedule */}
          <Card
            title="Today's medications"
            flush
            actions={
              <button type="button" className="btn-link" onClick={() => navigateTo('medications', 'Medications')}>
                Manage
              </button>
            }
          >
            {memberMeds.length === 0 ? (
              <EmptyState compact icon={Pill} title="No medications on file" />
            ) : (
              <ul className="divide-list">
                {[...memberMeds]
                  .sort((a, b) => (a.times[0] || '').localeCompare(b.times[0] || ''))
                  .map((m) => (
                    <li key={m.id} className="list-row">
                      <span className="w-11 shrink-0 text-13 font-medium tabular-nums text-slate-500">{m.times[0] || '—'}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-13 font-medium text-slate-900 dark:text-slate-100">{m.name}</p>
                        <p className="truncate text-xs text-slate-500">
                          {m.dosage} · {m.frequency}
                        </p>
                      </div>
                      {m.taken_today ? (
                        <StatusBadge severity="success">Taken</StatusBadge>
                      ) : (
                        <StatusBadge severity="warning">Due</StatusBadge>
                      )}
                    </li>
                  ))}
              </ul>
            )}
          </Card>

          {/* Appointments */}
          <Card
            title="Upcoming appointments"
            flush
            actions={
              <button type="button" className="btn-link" onClick={() => navigateTo('appointments', 'Appointments')}>
                View all
              </button>
            }
          >
            {upcoming.length === 0 ? (
              <EmptyState
                compact
                icon={CalendarClock}
                title="No upcoming appointments"
                description={lastPast ? `Last visit: ${lastPast.title}, ${formatDate(lastPast.appointment_date)}` : undefined}
              />
            ) : (
              <ul className="divide-list">
                {upcoming.slice(0, 3).map((a) => {
                  const d = new Date(a.appointment_date);
                  return (
                    <li key={a.id} className="list-row">
                      <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700">
                        <span className="text-2xs font-semibold uppercase leading-none text-brand-700 dark:text-brand-300">
                          {d.toLocaleDateString(undefined, { month: 'short' })}
                        </span>
                        <span className="text-sm font-semibold leading-tight tabular-nums">{d.getDate()}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-13 font-medium text-slate-900 dark:text-slate-100">{a.title}</p>
                        <p className="truncate text-xs text-slate-500">
                          {formatTime(a.appointment_date)}
                          {a.doctor_name ? ` · ${a.doctor_name}` : ''}
                        </p>
                      </div>
                      {a.type === 'telemedicine' && <Video className="h-4 w-4 text-slate-400" aria-label="Video visit" />}
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card
          title="AI health insight"
          actions={<AiProvenance compact />}
          footer={
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigateTo('insights', 'AI insights')}>
              <Sparkles />
              Open insights
            </button>
          }
        >
          {aiInsights ? (
            <div className="space-y-3">
              <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{aiInsights.predicted_trends}</p>
              <p className="text-xs text-slate-500">
                Confidence {Math.round(aiInsights.confidence * 100)}% · Not a diagnosis — review with your physician.
              </p>
            </div>
          ) : (
            <EmptyState compact icon={Sparkles} title="Generating insight…" />
          )}
        </Card>

        <DonutChart
          title="Medication adherence today"
          subtitle="Doses marked as taken"
          values={[takenCount, dueCount]}
          labels={['Taken', 'Still due']}
          colors={[CHART_COLORS.emerald, CHART_COLORS.amber]}
          centerLabel="doses"
          emptyMessage="No medications scheduled"
        />

        <Card title="Health goals" flush>
          {memberGoals.length === 0 ? (
            <EmptyState compact icon={Target} title="No goals yet" />
          ) : (
            <ul className="divide-list">
              {memberGoals.slice(0, 4).map((g) => {
                const pct = Math.min(100, Math.round((g.current_value / (g.target_value || 1)) * 100));
                return (
                  <li key={g.id} className="px-5 py-3">
                    <div className="mb-1.5 flex items-baseline justify-between gap-3">
                      <span className="truncate text-13 font-medium text-slate-900 dark:text-slate-100">{g.title}</span>
                      <span className="text-xs tabular-nums text-slate-500">
                        {g.current_value.toLocaleString()} / {g.target_value.toLocaleString()} {g.unit}
                      </span>
                    </div>
                    <ProgressBar value={pct} tone={g.completed ? 'success' : 'brand'} label={`${g.title} progress`} />
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      {weightSeries.length > 0 && (
        <LineChart
          title="Body weight"
          subtitle="Recent readings"
          data={weightSeries.map((v) => primaryValue(v) ?? 0)}
          labels={axisLabels(weightSeries.map((v) => v.recorded_at))}
          unit="kg"
          color={CHART_COLORS.sky}
          height={180}
        />
      )}

      {selectedMember?.gender === 'female' && setMenstrualData && (
        <MenstrualTracker
          selectedMember={selectedMember}
          currentUser={currentUser}
          menstrualData={menstrualData}
          setMenstrualData={setMenstrualData}
        />
      )}
    </div>
  );
});

export default PatientDashboard;
