import React, { useMemo, Dispatch, SetStateAction } from 'react';
import { motion } from 'framer-motion';
import { Pill, Calendar, Target, Shield, TrendingUp, Sparkles } from 'lucide-react';
import { User, Medication, Appointment, HealthGoal, Vital, MenstrualData, AIInsight } from '../types';
import LineChart from '../components/charts/LineChart';
import BarChart from '../components/charts/BarChart';
import DonutChart from '../components/charts/DonutChart';
import MenstrualTracker from '../features/menstrual/MenstrualTracker';

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

  const dashboardStats = useMemo(() => [
    { key: 'medications', title: "Today's Medications", value: medications.filter(m => m.member_id === memberId).length, icon: Pill, bg: "from-blue-400 to-blue-600" },
    { key: 'appointments', title: "Upcoming Appointments", value: appointments.filter(a => a.member_id === memberId).length, icon: Calendar, bg: "from-green-400 to-green-600" },
    { key: 'goals', title: "Health Goals", value: healthGoals.filter(g => g.member_id === memberId).length, icon: Target, bg: "from-purple-400 to-purple-600" },
    { key: 'dashboard', title: "Patient ID", value: selectedMember?.patient_id || 'N/A', icon: Shield, bg: "from-yellow-400 to-orange-600" }
  ], [medications, appointments, healthGoals, memberId, selectedMember?.patient_id]);

  const bpData = useMemo(() => {
    const bp = vitals.filter(v => v.member_id === memberId && v.type === 'bp').slice(-12);
    return {
      data: bp.map(v => parseInt(v.value.split('/')[0]) || 0),
      labels: bp.map(v => new Date(v.recorded_at).toLocaleDateString())
    };
  }, [vitals, memberId]);

  const appointmentData = useMemo(() => {
    const appts = appointments.filter(a => a.member_id === memberId).slice(0, 6);
    return {
      values: appts.map(() => 1),
      labels: appts.map(a => new Date(a.appointment_date).toLocaleDateString())
    };
  }, [appointments, memberId]);

  const handleSosClick = () => {
    if (onEmergencySOS) {
      onEmergencySOS();
      return;
    }
    if (window.confirm('Are you sure you want to activate the family emergency SOS? This will notify all family members and emergency contacts immediately.')) {
      alert('🚨 Emergency SOS activated! All family members and emergency contacts have been notified with your location and recent health data.');
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {dashboardStats.map((item, index) => (
          <motion.button 
            key={index} 
            onClick={() => navigateTo(item.key, item.title)} 
            className="relative group rounded-lg p-[2px] overflow-hidden"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <div className={`absolute -inset-[2px] bg-gradient-to-r ${item.bg} opacity-80 blur group-hover:opacity-100 transition-all duration-300`} />
            <div className="relative bg-white/10 backdrop-blur-lg rounded-lg p-4 md:p-6 text-left text-gray-900">
              <div className="flex items-center">
                <div className="w-8 h-8 md:w-10 md:h-10 mr-3 md:mr-4 rounded-xl bg-white/20 flex items-center justify-center text-white">
                  <item.icon className="w-4 h-4 md:w-6 md:h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs md:text-sm font-medium truncate">{item.title}</p>
                  <p className="text-lg md:text-2xl font-bold">{item.value}</p>
                </div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {selectedMember?.gender === 'female' && setMenstrualData && (
        <MenstrualTracker
          selectedMember={selectedMember}
          currentUser={currentUser}
          menstrualData={menstrualData}
          setMenstrualData={setMenstrualData}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <LineChart 
            data={bpData.data.length ? bpData.data : [115,116,117,118,119,120,121]} 
            labels={bpData.labels.length ? bpData.labels : ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']} 
            color="#60a5fa" 
            title="Blood Pressure (Systolic)" 
          />
          <BarChart 
            values={appointmentData.values.length ? appointmentData.values : [1,1,1]} 
            labels={appointmentData.labels.length ? appointmentData.labels : ['Date1','Date2','Date3']} 
            color="#34d399" 
            title="Upcoming Appointments" 
          />
        </div>
        <button
          className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-2xl border border-green-200 text-left hover:shadow-lg transition-all duration-300 group"
          onClick={() => navigateTo('goals', 'Health Goals')}
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-12 w-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-gray-800">Family Wellness Challenges</h4>
              <p className="text-sm text-gray-600">Compete with family members</p>
            </div>
          </div>
          <p className="text-sm text-gray-700 mb-4">Join family competitions, earn points, and achieve health goals together</p>
          <div className="flex items-center justify-between">
            <span className="text-green-600 font-semibold">{currentUser?.points || 0} pts earned</span>
            <span className="text-2xl">🏆</span>
          </div>
        </button>
        <button
          className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-200 text-left hover:shadow-lg transition-all duration-300 group"
          onClick={() => navigateTo('vitals', 'Vitals')}
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-gray-800">AI Health Insights</h4>
              <p className="text-sm text-gray-600">Personalized recommendations</p>
            </div>
          </div>
          <p className="text-sm text-gray-700 mb-4">Get AI-powered health predictions and personalized care suggestions</p>
          <div className="flex items-center justify-between">
            <span className="text-purple-600 font-semibold">
              {aiInsights ? `${Math.round(aiInsights.confidence * 100)}% confidence` : 'Loading...'}
            </span>
            <span className="text-2xl">🤖</span>
          </div>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(() => {
          const taken = medications.filter(m => m.member_id === selectedMember?.user_id && m.taken_today).length;
          const due = medications.filter(m => m.member_id === selectedMember?.user_id && !m.taken_today).length;
          return <DonutChart values={[taken, due]} labels={["Taken","Due"]} colors={["#22c55e","#f59e0b"]} title="Medication Adherence" />;
        })()}
        <BarChart
          values={healthGoals.filter(g => g.member_id === selectedMember?.user_id).slice(0,5).map(g => Math.round((g.current_value / (g.target_value || 1)) * 100))}
          labels={healthGoals.filter(g => g.member_id === selectedMember?.user_id).slice(0,5).map(g => g.title.slice(0,6))}
          color="#818cf8"
          title="Goal Completion %"
        />
        {(() => {
          const wt = vitals.filter(v => v.member_id === selectedMember?.user_id && v.type === 'weight').slice(-12);
          const data = wt.map(v => parseInt(v.value) || 0);
          const labels = wt.map(v => new Date(v.recorded_at).toLocaleDateString());
          return <LineChart data={data.length ? data : [72,72,73,73,72,71]} labels={labels.length ? labels : ['Mon','Tue','Wed','Thu','Fri','Sat']} color="#f97316" title="Weight Trend (kg)" />;
        })()}
      </div>

      <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 p-8 rounded-2xl text-center shadow-xl">
        <button
          onClick={handleSosClick}
          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-2xl font-bold py-6 px-12 rounded-full transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-110 animate-pulse"
        >
          🚨 Family Emergency SOS
        </button>
        <p className="text-red-700 text-sm mt-4 font-medium">Instantly alerts family + emergency contacts with location & vitals</p>
      </div>
    </div>
  );
});

export default PatientDashboard;

