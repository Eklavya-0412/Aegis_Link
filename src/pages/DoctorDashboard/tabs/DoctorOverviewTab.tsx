import React, { useMemo } from 'react';
import { AlertTriangle, Calendar, FlaskConical, HeartPulse, Pill, Send, Users, Video } from 'lucide-react';
import { Appointment, Medication, User, Vital } from '../../../types';
import LineChart from '../../../components/charts/LineChart';
import { CHART_COLORS } from '../../../components/charts/ChartFrame';
import { Avatar, Card, EmptyState, StatTile, StatusBadge } from '../../../components/ui';
import VitalReadingTile, { ReadingStatusBadge } from '../../../features/vitals/VitalReadingTile';
import { evaluateReading, latestByType, primaryValue, READING_STATUS_LABEL, sortByRecordedDesc, vitalDefinition, VITAL_ORDER, systolicSeries, latestBloodPressure } from '../../../constants/vitals';
import { axisLabels, formatDateTime, formatRelative, roleLabel } from '../../../utils/format';

interface DoctorOverviewTabProps {
  patients: User[];
  selectedPatient: User | null;
  vitals: Vital[];
  medications: Medication[];
  appointments: Appointment[];
  onOpenTelemedicine: () => void;
  onOpenLabResults: () => void;
  onOpenPrescription: () => void;
}

export const DoctorOverviewTab: React.FC<DoctorOverviewTabProps> = ({
  patients,
  selectedPatient,
  vitals,
  medications,
  appointments,
  onOpenTelemedicine,
  onOpenLabResults,
  onOpenPrescription
}) => {
  const patient = selectedPatient || patients[0] || null;
  const activePatientId = patient?.user_id;

  const patientVitals = useMemo(
    () => sortByRecordedDesc(vitals.filter((v) => v.member_id === activePatientId)),
    [vitals, activePatientId]
  );
  const latest = useMemo(() => latestByType(patientVitals), [patientVitals]);
  const flagged = useMemo(
    () => patientVitals.filter((v) => ['outside', 'critical'].includes(evaluateReading(v))).slice(0, 6),
    [patientVitals]
  );
  const bpSeries = useMemo(() => systolicSeries(patientVitals), [patientVitals]);

  const patientMeds = medications.filter((m) => m.member_id === activePatientId);
  const upcomingAppts = appointments.filter(
    (a) => a.member_id === activePatientId && a.status === 'scheduled' && new Date(a.appointment_date).getTime() >= Date.now()
  );

  if (!patient) {
    return (
      <div className="card">
        <EmptyState icon={Users} title="No patients on your panel" description="Add a patient using their patient code to begin." />
      </div>
    );
  }

  const latestBp = latestBloodPressure(patientVitals);
  const bpStatus = latestBp ? evaluateReading(latestBp) : 'unknown';

  return (
    <div className="space-y-6">
      {/* Patient banner */}
      <div className="card flex flex-col gap-4 p-5 md:flex-row md:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <Avatar name={patient.name} size="lg" />
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold text-slate-900 dark:text-slate-50">{patient.name}</p>
            <p className="text-13 text-slate-500">
              {patient.age} y · <span className="capitalize">{patient.gender}</span> · {roleLabel(patient.role)}
              {patient.patient_id && (
                <>
                  {' · '}
                  <span className="font-mono text-xs">{patient.patient_id}</span>
                </>
              )}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={onOpenLabResults} className="btn btn-secondary btn-sm">
            <FlaskConical />
            Lab results
          </button>
          <button type="button" onClick={onOpenPrescription} className="btn btn-secondary btn-sm">
            <Send />
            Prescribe
          </button>
          <button type="button" onClick={onOpenTelemedicine} className="btn btn-secondary btn-sm">
            <Video />
            Virtual visit
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatTile
          label="Latest blood pressure"
          value={latestBp ? latestBp.value : '—'}
          unit={latestBp?.unit}
          icon={HeartPulse}
          tone={bpStatus === 'critical' ? 'danger' : bpStatus === 'outside' ? 'warning' : 'brand'}
          meta={latestBp ? `${formatRelative(latestBp.recorded_at)} · ${READING_STATUS_LABEL[bpStatus]}` : 'No readings'}
        />
        <StatTile
          label="Flagged readings"
          value={flagged.length}
          icon={AlertTriangle}
          tone={flagged.length ? 'warning' : 'success'}
          meta="Outside system alert limits"
        />
        <StatTile label="Active medications" value={patientMeds.length} icon={Pill} tone="neutral" />
        <StatTile label="Upcoming appointments" value={upcomingAppts.length} icon={Calendar} tone="info" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card title="Measured vital signs" subtitle="Device and manually recorded readings" className="xl:col-span-2">
          {VITAL_ORDER.some((t) => latest[t]) ? (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {VITAL_ORDER.filter((t) => latest[t]).map((t) => (
                  <VitalReadingTile key={t} vital={latest[t]!} />
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
                height={200}
                referenceLines={[
                  { y: 140, label: 'Alert > 140', tone: 'warning' },
                  { y: 90, label: 'Alert < 90', tone: 'warning' }
                ]}
                emptyMessage="No blood pressure readings"
              />
            </div>
          ) : (
            <EmptyState compact icon={HeartPulse} title="No vital signs recorded for this patient" />
          )}
        </Card>

        <div className="space-y-6">
          <Card title="Flagged readings" subtitle="Requires clinical review" flush>
            {flagged.length === 0 ? (
              <EmptyState compact icon={HeartPulse} title="No flagged readings" description="All recorded values are within system alert limits." />
            ) : (
              <ul className="divide-list">
                {flagged.map((v) => (
                  <li key={v.id} className="list-row">
                    <div className="min-w-0 flex-1">
                      <p className="text-13 font-medium text-slate-900 dark:text-slate-100">
                        {vitalDefinition(v.type)?.label || v.type}{' '}
                        <span className="tabular-nums">
                          {v.value} <span className="text-xs font-normal text-slate-500">{v.unit}</span>
                        </span>
                      </p>
                      <p className="text-xs tabular-nums text-slate-500">{formatDateTime(v.recorded_at)}</p>
                    </div>
                    <ReadingStatusBadge vital={v} />
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card
            title="Current prescriptions"
            flush
            actions={
              <button type="button" className="btn-link" onClick={onOpenPrescription}>
                Prescribe
              </button>
            }
          >
            {patientMeds.length === 0 ? (
              <EmptyState compact icon={Pill} title="No active prescriptions" />
            ) : (
              <ul className="divide-list">
                {patientMeds.map((m) => (
                  <li key={m.id} className="list-row">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-13 font-medium text-slate-900 dark:text-slate-100">
                        {m.name} <span className="font-normal tabular-nums text-slate-500">{m.dosage}</span>
                      </p>
                      <p className="truncate text-xs capitalize text-slate-500">
                        {m.frequency} · {m.times.join(', ')}
                      </p>
                    </div>
                    <StatusBadge severity={m.taken_today ? 'success' : 'warning'}>{m.taken_today ? 'Taken today' : 'Due'}</StatusBadge>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DoctorOverviewTab;
