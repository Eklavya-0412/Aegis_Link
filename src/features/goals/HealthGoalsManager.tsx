import React, { useState, type Dispatch, type SetStateAction } from 'react';
import { HealthGoal, User } from '../../types';

interface HealthGoalsManagerProps {
  selectedMember: User | null;
  healthGoals: HealthGoal[];
  setHealthGoals: Dispatch<SetStateAction<HealthGoal[]>>;
}

const HealthGoalsManager: React.FC<HealthGoalsManagerProps> = ({ selectedMember, healthGoals, setHealthGoals }) => {
  const memberId = selectedMember?.user_id || '';
  const memberGoals = healthGoals.filter(goal => goal.member_id === memberId);
  const [newGoal, setNewGoal] = useState({ title: '', target_value: 1000, unit: 'steps' });

  const addGoal = () => {
    const goal: HealthGoal = {
      id: Date.now().toString(),
      title: newGoal.title || 'New Goal',
      target_value: Number(newGoal.target_value),
      current_value: 0,
      unit: newGoal.unit,
      deadline: new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10),
      member_id: memberId,
      completed: false
    };
    setHealthGoals([...healthGoals, goal]);
    setNewGoal({ title: '', target_value: 1000, unit: 'steps' });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {memberGoals.map(goal => (
          <div key={goal.id} className="p-4 bg-white/80 rounded-2xl border">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-800">{goal.title}</p>
                <p className="text-sm text-gray-600">{goal.current_value}/{goal.target_value} {goal.unit}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${goal.completed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {goal.completed ? 'Done' : 'In Progress'}
              </span>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full mt-3">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.min(100, Math.round((goal.current_value / goal.target_value) * 100))}%` }} />
            </div>
            <div className="flex space-x-2 mt-3">
              <button onClick={() => setHealthGoals(healthGoals.map(item => item.id === goal.id ? { ...item, current_value: Math.min(item.target_value, item.current_value + Math.ceil(item.target_value * 0.1)) } : item))} className="flex-1 bg-blue-500 text-white py-2 rounded-xl">
                Add Progress
              </button>
              <button onClick={() => setHealthGoals(healthGoals.map(item => item.id === goal.id ? { ...item, completed: true, current_value: item.target_value } : item))} className="flex-1 bg-green-500 text-white py-2 rounded-xl">
                Complete
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white/80 p-6 rounded-2xl border">
        <h4 className="font-bold mb-3">Add Goal</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input className="p-3 border rounded-xl" placeholder="Title" value={newGoal.title} onChange={event => setNewGoal({ ...newGoal, title: event.target.value })} />
          <input type="number" className="p-3 border rounded-xl" placeholder="Target" value={newGoal.target_value} onChange={event => setNewGoal({ ...newGoal, target_value: Number(event.target.value) })} />
          <select className="p-3 border rounded-xl" value={newGoal.unit} onChange={event => setNewGoal({ ...newGoal, unit: event.target.value })}>
            <option value="steps">steps</option>
            <option value="minutes">minutes</option>
            <option value="kg">kg</option>
          </select>
          <button onClick={addGoal} className="bg-blue-500 text-white px-6 py-3 rounded-xl">Add</button>
        </div>
      </div>
    </div>
  );
};

export default HealthGoalsManager;
