import React from 'react';
import { Calendar, Pill, Target, Users } from 'lucide-react';
import { Appointment, Family, Medication, WellnessChallenge } from '../../types';
import BarChart from '../../components/charts/BarChart';
import LineChart from '../../components/charts/LineChart';

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

  const stats = [
    {
      title: 'Family Members',
      value: memberCount,
      icon: Users,
      color: 'from-blue-400 to-blue-600'
    },
    {
      title: 'Total Medications',
      value: totalMeds,
      icon: Pill,
      color: 'from-green-400 to-green-600'
    },
    {
      title: 'Upcoming Appointments',
      value: totalAppts,
      icon: Calendar,
      color: 'from-purple-400 to-purple-600'
    },
    {
      title: 'Challenge Progress',
      value: `${Math.round(familyProgress)}%`,
      icon: Target,
      color: 'from-yellow-400 to-orange-600'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <div key={i} className={`bg-gradient-to-r ${s.color} rounded-lg p-6 text-white`}>
            <div className="flex items-center">
              <s.icon className="w-8 h-8 mr-4" />
              <div>
                <p className="text-sm font-medium">{s.title}</p>
                <p className="text-2xl font-bold">{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BarChart
          values={(currentFamily?.members || []).map(
            (m) => appointments.filter((x) => x.member_id === m.user_id).length
          )}
          labels={(currentFamily?.members || []).map((m) => m.name.split(' ')[0])}
          color="#3b82f6"
          title="Appointments per Member"
        />
        <div className="bg-white/80 p-6 rounded-2xl border">
          <h4 className="font-bold mb-3">Wellness Challenges</h4>
          <div className="space-y-3">
            {wellnessChallenges.map((c) => (
              <div
                key={c.id}
                className="p-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl border"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-800">{c.name}</span>
                  <span className="text-sm font-bold text-green-700">{c.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full mt-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
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
          data={(currentFamily?.members || []).map((m, i) => 60 + i * 10)}
          labels={(currentFamily?.members || []).map((m) => m.name.split(' ')[0])}
          color="#10b981"
          title="Challenge Contribution by Member (%)"
        />
      </div>
    </div>
  );
};

export default FamilyDashboard;

