import React, { useState, type Dispatch, type SetStateAction } from 'react';
import { Baby, Plus } from 'lucide-react';
import { MenstrualData, User } from '../../types';

interface MenstrualTrackerProps {
  selectedMember: User | null;
  currentUser: User | null;
  menstrualData: MenstrualData[];
  setMenstrualData: Dispatch<SetStateAction<MenstrualData[]>>;
}

const MenstrualTracker: React.FC<MenstrualTrackerProps> = ({
  selectedMember,
  currentUser,
  menstrualData,
  setMenstrualData
}) => {
  const [showForm, setShowForm] = useState(false);
  const [cycleData, setCycleData] = useState({
    cycle_start: '',
    cycle_length: 28,
    symptoms: [] as string[],
    flow_intensity: 'medium'
  });

  if (selectedMember?.gender !== 'female' || currentUser?.role === 'caregiver') {
    return null;
  }

  const symptomOptions = [
    'Cramps',
    'Headache',
    'Mood swings',
    'Bloating',
    'Fatigue',
    'Breast tenderness',
    'Nausea',
    'Back pain',
    'Food cravings'
  ];

  const logCycle = () => {
    const newData: MenstrualData = {
      id: Date.now().toString(),
      cycle_start: cycleData.cycle_start,
      cycle_length: cycleData.cycle_length,
      symptoms: cycleData.symptoms,
      flow_intensity: cycleData.flow_intensity,
      member_id: selectedMember?.user_id || ''
    };

    setMenstrualData([...menstrualData, newData]);
    setShowForm(false);
    setCycleData({ cycle_start: '', cycle_length: 28, symptoms: [], flow_intensity: 'medium' });
  };

  const memberCycles = menstrualData.filter((d) => d.member_id === selectedMember?.user_id);
  const lastCycle = memberCycles[0];
  const nextPredicted = lastCycle
    ? new Date(
        new Date(lastCycle.cycle_start).getTime() + lastCycle.cycle_length * 24 * 60 * 60 * 1000
      )
    : null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-800 flex items-center">
          <Baby className="h-6 w-6 mr-2 text-pink-600" />
          Menstrual Cycle Tracker
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-2 rounded-xl hover:from-pink-600 hover:to-purple-600 transition-all duration-300 font-medium shadow-lg"
        >
          <Plus className="h-4 w-4 inline mr-2" />
          Log Cycle
        </button>
      </div>

      {showForm && (
        <div className="bg-gradient-to-br from-pink-50 to-purple-50 p-6 rounded-2xl border border-pink-200">
          <h4 className="font-bold text-gray-800 mb-4">Log Menstrual Cycle</h4>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cycle Start Date</label>
                <input
                  type="date"
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  value={cycleData.cycle_start}
                  onChange={(e) => setCycleData({ ...cycleData, cycle_start: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cycle Length (days)</label>
                <input
                  type="number"
                  min="21"
                  max="35"
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  value={cycleData.cycle_length}
                  onChange={(e) => setCycleData({ ...cycleData, cycle_length: parseInt(e.target.value) || 28 })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Flow Intensity</label>
              <select
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                value={cycleData.flow_intensity}
                onChange={(e) => setCycleData({ ...cycleData, flow_intensity: e.target.value })}
              >
                <option value="light">Light</option>
                <option value="medium">Medium</option>
                <option value="heavy">Heavy</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Symptoms</label>
              <div className="grid grid-cols-3 gap-2">
                {symptomOptions.map((symptom) => (
                  <label key={symptom} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={cycleData.symptoms.includes(symptom)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setCycleData({ ...cycleData, symptoms: [...cycleData.symptoms, symptom] });
                        } else {
                          setCycleData({
                            ...cycleData,
                            symptoms: cycleData.symptoms.filter((s) => s !== symptom)
                          });
                        }
                      }}
                      className="form-checkbox h-4 w-4 text-pink-500"
                    />
                    <span className="text-sm">{symptom}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={logCycle}
                disabled={!cycleData.cycle_start}
                className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3 rounded-xl hover:from-pink-600 hover:to-purple-600 transition-all duration-300 disabled:opacity-50 font-medium"
              >
                Save Data
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="bg-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-300 transition-all duration-300 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-pink-50 to-purple-50 p-6 rounded-2xl border border-pink-200">
          <h4 className="font-bold text-gray-800 mb-4">Cycle Overview</h4>
          {lastCycle ? (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Last Period:</span>
                <span className="font-semibold">{new Date(lastCycle.cycle_start).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cycle Length:</span>
                <span className="font-semibold">{lastCycle.cycle_length} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Next Predicted:</span>
                <span className="font-semibold text-pink-600">
                  {nextPredicted?.toLocaleDateString()}
                </span>
              </div>
              <div className="pt-3 border-t border-pink-200">
                <span className="text-gray-600 block mb-2">Recent Symptoms:</span>
                <div className="flex flex-wrap gap-2">
                  {lastCycle.symptoms.map((symptom) => (
                    <span key={symptom} className="bg-pink-100 text-pink-700 px-2 py-1 rounded-full text-xs">
                      {symptom}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No cycle data logged yet</p>
          )}
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-200">
          <h4 className="font-bold text-gray-800 mb-4">Health Insights</h4>
          <div className="space-y-4">
            <div className="bg-white/60 p-4 rounded-xl">
              <h5 className="font-medium text-gray-800 mb-2">Cycle Regularity</h5>
              <p className="text-sm text-gray-600">
                {memberCycles.length > 2 ? 'Regular cycles detected' : 'Track more cycles for insights'}
              </p>
            </div>
            <div className="bg-white/60 p-4 rounded-xl">
              <h5 className="font-medium text-gray-800 mb-2">Symptom Patterns</h5>
              <p className="text-sm text-gray-600">
                {lastCycle?.symptoms.length
                  ? `Common symptoms: ${lastCycle.symptoms.slice(0, 2).join(', ')}`
                  : 'Log symptoms to identify patterns'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenstrualTracker;

