import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, Check, ClipboardList, EyeOff, HeartPulse, Lock, Pill, Trophy, Users } from 'lucide-react';
import { Appointment, Family, Medication, WellnessChallenge } from '../../types';
import { Avatar, Card, EmptyState, PageHeader, ProgressBar, StatTile, StatusBadge } from '../../components/ui';
import { SkeletonRows } from '../../components/common/RemoteState';
import { CaregiverCheckin, fetchPatientCheckins } from '../../services/clinicalService';
import { formatDateTime, formatShortDate, roleLabel, titleCase } from '../../utils/format';
import { vitalLabel } from '../../constants/vitals';

interface FamilyDashboardProps {
  currentFamily: Family | null;
  medications: Medication[];
  appointments: Appointment[];
  wellnessChallenges: WellnessChallenge[];
}

const SHARED = [
  'Medication schedules and whether today’s doses were taken',
  'Upcoming appointments',
  'Caregiver visit notes and check-ins',
  'Family wellness challenges'
];
const NOT_SHARED = [
  { label: 'Detailed vital-sign history', reason: 'Visible on each member’s own record' },
  { label: 'Menstrual health logs', reason: 'Sensitive — never included in the family view' },
  { label: 'Medical vault documents', reason: 'Require the member’s explicit consent' }
];

export const FamilyDashboard: React.FC<FamilyDashboardProps> = ({ currentFamily, medications, appointments, wellnessChallenges }) => {
  const members = useMemo(() => currentFamily?.members || [], [currentFamily?.members]);
  const [selectedMemberId, setSelectedMemberId] = useState<string>(currentFamily?.members[0]?.user_id || '');
  const [oversightLogs, setOversightLogs] = useState<CaregiverCheckin[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // Fetch caregiver check-in / visit logs for the observed member (UC12)
  useEffect(() => {
    const loadLogs = async () => {
      const patientId = selectedMemberId || currentFamily?.members[0]?.user_id;
      if (patientId) {
        setLogsLoading(true);
        const logs = await fetchPatientCheckins(patientId);
        setOversightLogs(Array.isArray(logs) ? logs : []);
        setLogsLoading(false);
      }
    };
    loadLogs();
  }, [selectedMemberId, currentFamily]);

  const rows = useMemo(() => {
    const now = Date.now();
    return members.map((m) => {
      const meds = medications.filter((x) => x.member_id === m.user_id);
      const upcoming = appointments
        .filter((x) => x.member_id === m.user_id && x.status !== 'cancelled' && new Date(x.appointment_date).getTime() >= now)
        .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime());
      const challengeProgress = wellnessChallenges.length
        ? Math.round(
            wellnessChallenges.reduce((sum, c) => sum + (c.family_progress?.[m.user_id] ?? c.progress), 0) / wellnessChallenges.length
          )
        : null;
      return {
        member: m,
        meds,
        taken: meds.filter((x) => x.taken_today).length,
        next: upcoming[0],
        upcomingCount: upcoming.length,
        challengeProgress
      };
    });
  }, [members, medications, appointments, wellnessChallenges]);

  const totalMeds = rows.reduce((s, r) => s + r.meds.length, 0);
  const totalUpcoming = rows.reduce((s, r) => s + r.upcomingCount, 0);
  const familyProgress = wellnessChallenges.length
    ? Math.round(wellnessChallenges.reduce((sum, c) => sum + c.progress, 0) / wellnessChallenges.length)
    : null;
  const observed = members.find((m) => m.user_id === selectedMemberId);

  return (
    <div className="page">
      <PageHeader eyebrow="Family" title="Family overview" description={`Shared care activity across ${currentFamily?.family_name || 'your family'}.`} />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatTile label="Family members" value={members.length} icon={Users} tone="brand" />
        <StatTile label="Active medications" value={totalMeds} icon={Pill} tone="neutral" />
        <StatTile label="Upcoming appointments" value={totalUpcoming} icon={Calendar} tone="info" />
        <StatTile
          label="Challenge progress"
          value={familyProgress !== null ? `${familyProgress}%` : '—'}
          icon={Trophy}
          tone="warning"
          meta={wellnessChallenges.length ? `${wellnessChallenges.length} active challenges` : 'No active challenges'}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card title="Members" subtitle="Today's status for each person" flush className="xl:col-span-2">
          {rows.length === 0 ? (
            <EmptyState icon={Users} title="No family members yet" />
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Medications today</th>
                    <th>Next appointment</th>
                    <th className="hidden md:table-cell">Challenges</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(({ member, meds, taken, next, challengeProgress }) => (
                    <tr key={member.user_id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <Avatar name={member.name} size="sm" />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-slate-900 dark:text-slate-100">{member.name}</p>
                            <p className="text-xs capitalize text-slate-500">{member.relationship || roleLabel(member.role)}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        {meds.length === 0 ? (
                          <span className="text-slate-400">None</span>
                        ) : taken === meds.length ? (
                          <StatusBadge severity="success">All taken</StatusBadge>
                        ) : (
                          <StatusBadge severity="warning">
                            {taken} of {meds.length} taken
                          </StatusBadge>
                        )}
                      </td>
                      <td className="whitespace-nowrap">
                        {next ? (
                          <span>
                            <span className="tabular-nums">{formatShortDate(next.appointment_date)}</span>
                            <span className="text-slate-500"> · {next.title}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400">None scheduled</span>
                        )}
                      </td>
                      <td className="hidden w-40 md:table-cell">
                        {challengeProgress === null ? (
                          <span className="text-slate-400">—</span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="flex-1">
                              <ProgressBar value={challengeProgress} tone="success" label={`${member.name} challenge progress`} />
                            </div>
                            <span className="w-9 text-right text-xs tabular-nums text-slate-500">{challengeProgress}%</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card title="What the family view shows" icon={Lock}>
          <p className="eyebrow mb-2">Shared with family</p>
          <ul className="space-y-2">
            {SHARED.map((s) => (
              <li key={s} className="flex items-start gap-2 text-13 text-slate-700 dark:text-slate-300">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                {s}
              </li>
            ))}
          </ul>
          <p className="eyebrow mb-2 mt-5">Not shown here</p>
          <ul className="space-y-2.5">
            {NOT_SHARED.map((s) => (
              <li key={s.label} className="flex items-start gap-2 text-13">
                <EyeOff className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                <span>
                  <span className="block text-slate-700 dark:text-slate-300">{s.label}</span>
                  <span className="block text-xs text-slate-500">{s.reason}</span>
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Caregiver oversight & visit logs (UC12) */}
      <Card
        title="Caregiver visits"
        subtitle="Check-ins, medications given and observations recorded by the care team"
        icon={ClipboardList}
        flush
        actions={
          <label className="flex items-center gap-2">
            <span className="hidden text-xs font-medium text-slate-500 sm:inline">Member</span>
            <select
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="select input-sm w-44 text-13"
              aria-label="Show visits for member"
            >
              {members.map((m) => (
                <option key={m.user_id} value={m.user_id}>
                  {m.name}
                </option>
              ))}
            </select>
          </label>
        }
      >
        {logsLoading ? (
          <SkeletonRows rows={3} />
        ) : oversightLogs.length === 0 ? (
          <EmptyState compact icon={ClipboardList} title="No visits recorded yet" description={`Caregiver check-ins for ${observed?.name || 'this member'} will appear here.`} />
        ) : (
          <ul className="divide-list">
            {oversightLogs.map((log) => (
              <li key={log.id} className="px-5 py-4">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <p className="text-13 font-semibold text-slate-900 dark:text-slate-100">{log.caregiver_name || 'Care specialist'}</p>
                  <span className="badge badge-neutral">{titleCase(log.visit_type)}</span>
                  <time className="ml-auto text-xs tabular-nums text-slate-500" dateTime={log.checkin_time || log.created_at}>
                    {formatDateTime(log.checkin_time || log.created_at)}
                  </time>
                </div>
                {log.notes && <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-slate-700 dark:text-slate-300">{log.notes}</p>}
                {((log.medications_administered && log.medications_administered.length > 0) ||
                  (log.vitals_recorded && Object.keys(log.vitals_recorded).length > 0)) && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {log.medications_administered && log.medications_administered.length > 0 && (
                      <span className="badge badge-success">
                        <Pill aria-hidden />
                        Given: {log.medications_administered.join(', ')}
                      </span>
                    )}
                    {log.vitals_recorded && Object.keys(log.vitals_recorded).length > 0 && (
                      <span className="badge badge-info h-auto min-h-6 whitespace-normal py-1">
                        <HeartPulse aria-hidden />
                        {Object.entries(log.vitals_recorded)
                          .map(([k, v]) => `${vitalLabel(k)}: ${v}`)
                          .join(' · ')}
                      </span>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Wellness challenges" subtitle="Shared family goals" flush>
        {wellnessChallenges.length === 0 ? (
          <EmptyState compact icon={Trophy} title="No active challenges" />
        ) : (
          <ul className="grid grid-cols-1 divide-y divide-slate-100 dark:divide-slate-800 md:grid-cols-2 md:divide-y-0">
            {wellnessChallenges.map((c) => (
              <li key={c.id} className="px-5 py-4">
                <div className="mb-2 flex items-baseline justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-13 font-medium text-slate-900 dark:text-slate-100">{c.name}</p>
                    <p className="truncate text-xs text-slate-500">{c.description}</p>
                  </div>
                  <span className="shrink-0 text-13 font-semibold tabular-nums text-slate-700 dark:text-slate-200">{c.progress}%</span>
                </div>
                <ProgressBar value={c.progress} tone="success" label={`${c.name} progress`} />
                <p className="mt-1.5 text-xs tabular-nums text-slate-500">{c.points} points on completion</p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
};

export default FamilyDashboard;
