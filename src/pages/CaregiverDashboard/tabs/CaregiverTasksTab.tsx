import React, { useState } from 'react';
import { CaregiverPatient, CareTask } from '../types';

interface CaregiverTasksTabProps {
  patients: CaregiverPatient[];
  careTasks: CareTask[];
  onAddTask: (task: { text: string; priority: 'low' | 'normal' | 'high'; patient?: string }) => void;
  onToggleTask: (taskId: string) => void;
  onRemoveTask: (taskId: string) => void;
}

export const CaregiverTasksTab: React.FC<CaregiverTasksTabProps> = ({
  patients,
  careTasks,
  onAddTask,
  onToggleTask,
  onRemoveTask
}) => {
  const [newTask, setNewTask] = useState({
    text: '',
    priority: 'normal' as 'low' | 'normal' | 'high',
    patient: ''
  });

  const handleAdd = () => {
    if (!newTask.text.trim()) return;
    onAddTask({
      text: newTask.text.trim(),
      priority: newTask.priority,
      patient: newTask.patient || undefined
    });
    setNewTask({ text: '', priority: 'normal', patient: '' });
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-gray-800">Care Tasks</h2>
      <div className="bg-white/80 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-white/20">
        <h3 className="text-lg font-bold mb-4 text-gray-800">Add Task</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            className="p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Task description"
            value={newTask.text}
            onChange={(e) => setNewTask({ ...newTask, text: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <select
            className="p-3 border rounded-xl"
            value={newTask.priority}
            onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as 'low' | 'normal' | 'high' })}
          >
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
          </select>
          <select
            className="p-3 border rounded-xl"
            value={newTask.patient}
            onChange={(e) => setNewTask({ ...newTask, patient: e.target.value })}
          >
            <option value="">No specific patient</option>
            {patients.map((p) => (
              <option key={p.id} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleAdd}
            className="bg-blue-600 text-white rounded-xl px-6 font-medium hover:bg-blue-700 transition-colors"
          >
            Add
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {careTasks.map((task) => (
          <div
            key={task.id}
            className={`p-4 rounded-2xl border ${task.completed ? 'bg-emerald-50 border-emerald-200' : 'bg-blue-50 border-blue-200'}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onToggleTask(task.id)}
                  className={`h-6 w-6 rounded-full border flex items-center justify-center font-bold text-xs ${
                    task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300'
                  }`}
                >
                  {task.completed && '✓'}
                </button>
                <div>
                  <p className={`font-semibold ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                    {task.text}
                  </p>
                  {task.patient && <p className="text-xs text-gray-600">Patient: {task.patient}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    task.priority === 'high'
                      ? 'bg-red-100 text-red-700'
                      : task.priority === 'normal'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {task.priority}
                </span>
                <button
                  onClick={() => onRemoveTask(task.id)}
                  className="text-red-600 text-sm hover:underline font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        {careTasks.length === 0 && (
          <div className="col-span-2 text-center text-gray-500 py-12">No tasks yet</div>
        )}
      </div>
    </div>
  );
};

export default CaregiverTasksTab;

