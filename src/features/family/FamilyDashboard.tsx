import React, { useEffect, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Eye,
  Pill,
  Shield,
  Target,
  Users
} from 'lucide-react';
import { Appointment, Family, Medication, WellnessChallenge } from '../../types';
import BarChart from '../../components/charts/BarChart';
import LineChart from '../../components/charts/LineChart';
import { CaregiverCheckin, fetchPatientCheckins } from '../../services/clinicalService';

interface FamilyDashboardProps {
  currentFamily: Family | null;
  medications: Medication[];
  appointments: Appointment[];
  wellnessChallenges: WellnessChallenge[];
}

export const FamilyDashboard: React.FC<FamilyDashboardProps> = ({
  currentFamily,
  medications,
  appointments,
  wellnessChallenges
}) => {
  const [oversightLogs, setOversightLogs] = useState<CaregiverCheckin[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string>(
    currentFamily?.members[0]?.user_id || ''
  );

  const memberCount = currentFamily?.members.length || 0;
  const totalMeds = currentFamily
    ? currentFamily.members.reduce(
        (sum, m) => sum + medications.filter((x) => x.member_id === m.user_id).length,
        0
      )
    : 0;
  const totalAppts = currentFamily
    ? currentFamily.members.reduce(
        (sum, m) => sum + appointments.filter((x) => x.member_id === m.user_id).length,
        0
      )
    : 0;
  const familyProgress =
    wellnessChallenges.reduce((sum, c) => sum + c.progress, 0) /
    (wellnessChallenges.length || 1);

  // Fetch Caregiver Oversight & Activity Logs (UC12)
  useEffect(() => {
    const loadLogs = async () => {
      const patientId = selectedMemberId || currentFamily?.members[0]?.user_id;
      if (patientId) {
        const logs = await fetchPatientCheckins(patientId);
        setOversightLogs(logs);
      }
    };
    loadLogs();
  }, [selectedMemberId, currentFamily]);

  const stats = [
    {
      title: 'Family Members',
      value: memberCount,
      icon: Users,
      color: 'from-blue-500 to-indigo-600'
    },
    {
      title: 'Total Medications',
      value: totalMeds,
      icon: Pill,
      color: 'from-emerald-500 to-teal-600'
    },
    {
      title: 'Upcoming Appointments',
      value: totalAppts,
      icon: Calendar,
      color: 'from-purple-500 to-pink-600'
    },
    {
      title: 'Family Goal Progress',
      value: `${Math.round(familyProgress)}%`,
      icon: Target,
      color: 'from-amber-500 to-orange-600'
    }
  ];

  const selectedMember = currentFamily?.members.find((m) => m.user_id === selectedMemberId);

  return (
    <div className="space-y-8">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((s, i) => (
          <div key={i} className={`bg-gradient-to-r ${s.color} rounded-3xl p-6 text-white shadow-lg`}>
            <div className="flex items-center">
              <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl mr-4 border border-white/20">
                <s.icon className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white/80">{s.title}</p>
                <p className="text-2xl font-black mt-0.5">{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Caregiver Oversight & Activity Logs Section (UML UC12) */}
      <div className="bg-white/85 dark:bg-gray-800/85 backdrop-blur-2xl p-6 md:p-8 rounded-3xl border border-blue-100 dark:border-gray-700 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                Caregiver Oversight & Activity Logs (UC12)
              </h3>
              <p className="text-xs text-gray-500">
                Supervise caretaker check-ins, medication administrations, and daily visit notes
              </p>
            </div>
          </div>

          {/* Member Switcher */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500 font-semibold">Observing:</span>
            <select
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="p-2 border rounded-xl text-xs font-semibold bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-800 dark:text-gray-100"
            >
              {(currentFamily?.members || []).map((m) => (
                <option key={m.user_id} value={m.user_id}>
                  {m.name} ({m.relationship || m.role})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Logs Feed */}
        <div className="space-y-4">
          {oversightLogs.map((log) => (
            <div
              key={log.id}
              className="p-5 bg-gradient-to-r from-blue-50/50 via-white to-indigo-50/30 dark:from-gray-700/40 dark:via-gray-800 dark:to-gray-700/40 rounded-2xl border border-blue-100/70 dark:border-gray-700 shadow-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center space-x-2">
                  <ClipboardList className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="font-bold text-sm text-gray-800 dark:text-gray-200">
                    {log.caregiver_name || 'Care Specialist'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 capitalize">
                    {log.visit_type.replace('_', ' ')}
                  </span>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(log.checkin_time || log.created_at).toLocaleString()}
                </span>
              </div>

              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line pl-6">
                {log.notes}
              </p>

              <div className="mt-3 pl-6 flex flex-wrap gap-2 text-xs">
                {log.medications_administered && log.medications_administered.length > 0 && (
                  <span className="px-2.5 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-medium">
                    💊 Meds Administered: {log.medications_administered.join(', ')}
                  </span>
                )}
                {log.vitals_recorded && Object.keys(log.vitals_recorded).length > 0 && (
                  <span className="px-2.5 py-0.5 rounded-lg bg-purple-100 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 font-medium">
                    🩺 Vitals Recorded: {Object.entries(log.vitals_recorded).map(([k, v]) => `${k.toUpperCase()}: ${v}`).join(' | ')}
                  </span>
                )}
              </div>
            </div>
          ))}

          {oversightLogs.length === 0 && (
            <p className="text-sm text-gray-400 py-8 text-center">
              No caregiver check-in logs recorded yet for {selectedMember?.name || 'this member'}.
            </p>
          )}
        </div>
      </div>

      {/* Visual Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BarChart
          values={(currentFamily?.members || []).map(
            (m) => appointments.filter((x) => x.member_id === m.user_id).length
          )}
          labels={(currentFamily?.members || []).map((m) => m.name.split(' ')[0])}
          color="#3b82f6"
          title="Appointments per Member"
        />

        <div className="bg-white/80 dark:bg-gray-800/80 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <h4 className="font-bold mb-3 text-gray-800 dark:text-gray-100">Wellness Challenges</h4>
          <div className="space-y-3">
            {wellnessChallenges.map((c) => (
              <div
                key={c.id}
                className="p-4 bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-700/50 dark:to-gray-800 rounded-2xl border border-green-200/50 dark:border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{c.name}</span>
                  <span className="text-sm font-bold text-green-700 dark:text-green-400">{c.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 h-2.5 rounded-full mt-2.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-green-500 h-2.5 rounded-full"
                    style={{ width: `${c.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BarChart
          values={(currentFamily?.members || []).map(
            (m) => medications.filter((x) => x.member_id === m.user_id).length
          )}
          labels={(currentFamily?.members || []).map((m) => m.name.split(' ')[0])}
          color="#f59e0b"
          title="Medications per Member"
        />
        <LineChart
          data={(currentFamily?.members || []).map(
            (m) =>
              wellnessChallenges.length > 0
                ? Math.round(
                    wellnessChallenges.reduce((sum, c) => sum + (c.family_progress?.[m.user_id] ?? c.progress), 0) /
                      wellnessChallenges.length
                  )
                : 75
          )}
          labels={(currentFamily?.members || []).map((m) => m.name.split(' ')[0])}
          color="#10b981"
          title="Challenge Completion by Member (%)"
        />
      </div>
    </div>
  );
};

export default FamilyDashboard;
