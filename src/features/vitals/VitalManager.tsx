import React, { useState, type Dispatch, type SetStateAction } from 'react';
import LineChart from '../../components/charts/LineChart';
import { User, Vital } from '../../types';

interface VitalManagerProps {
  selectedMember: User | null;
  vitals: Vital[];
  setVitals: Dispatch<SetStateAction<Vital[]>>;
}

type VitalType = 'bp' | 'weight' | 'hr';

const VitalManager: React.FC<VitalManagerProps> = ({ selectedMember, vitals, setVitals }) => {
  const memberId = selectedMember?.user_id || '';
  const memberVitals = vitals.filter(vital => vital.member_id === memberId);
  const [newVital, setNewVital] = useState({ type: 'bp' as VitalType, value: '', unit: '' });

  const addVital = () => {
    const vital: Vital = {
      id: Date.now().toString(),
      type: newVital.type,
      value: newVital.value || '120/80',
      unit: newVital.unit || (newVital.type === 'weight' ? 'kg' : 'mmHg'),
      recorded_at: new Date().toISOString(),
      member_id: memberId
    };
    setVitals([vital, ...vitals]);
    setNewVital({ type: 'bp', value: '', unit: '' });
  };

  const chartData = memberVitals.slice(0, 8).map(vital => parseInt(vital.value.split('/')[0]) || parseInt(vital.value));
  const chartLabels = memberVitals.slice(0, 8).map(vital => new Date(vital.recorded_at).toLocaleDateString());

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 relative">
          <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 opacity-50 blur" />
          <div className="relative bg-white/80 p-6 rounded-2xl border">
            <h3 className="text-xl font-bold mb-4">Vitals Trend</h3>
            <LineChart data={chartData.length ? chartData : [110, 115, 118, 120, 119, 117]} labels={chartLabels.length ? chartLabels : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']} title="Systolic BP" />
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-br from-emerald-400 via-cyan-300 to-blue-400 opacity-50 blur" />
          <div className="relative bg-white/80 p-6 rounded-2xl border">
            <h4 className="font-bold mb-3">Add Vital</h4>
            <div className="space-y-2">
              <select className="w-full p-3 border rounded-xl" value={newVital.type} onChange={event => setNewVital({ ...newVital, type: event.target.value as VitalType })}>
                <option value="bp">Blood Pressure</option>
                <option value="weight">Weight</option>
                <option value="hr">Heart Rate</option>
              </select>
              <input className="w-full p-3 border rounded-xl" placeholder="Value" value={newVital.value} onChange={event => setNewVital({ ...newVital, value: event.target.value })} />
              <input className="w-full p-3 border rounded-xl" placeholder="Unit" value={newVital.unit} onChange={event => setNewVital({ ...newVital, unit: event.target.value })} />
              <button onClick={addVital} className="group w-full bg-blue-500 text-white py-3 rounded-xl relative overflow-hidden">
                <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition" />
                <span className="relative z-10">Add</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white/80 p-6 rounded-2xl border">
        <h4 className="font-bold mb-3">Recent Vitals</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {memberVitals.map(vital => (
            <div key={vital.id} className="relative p-[1px] rounded-2xl overflow-hidden group">
              <div className="absolute -inset-[1px] bg-gradient-to-br from-blue-400 via-indigo-300 to-emerald-400 opacity-60 blur-md group-hover:opacity-90 transition" />
              <div className="relative p-4 bg-white/80 rounded-2xl border">
                <p className="font-semibold text-gray-800 capitalize">{vital.type}</p>
                <p className="text-sm text-gray-600">{vital.value} {vital.unit}</p>
                <p className="text-xs text-gray-500">{new Date(vital.recorded_at).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VitalManager;
