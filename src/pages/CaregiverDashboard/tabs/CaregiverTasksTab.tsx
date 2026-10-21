import React, { useState } from 'react';
import { ClipboardCheck, Plus, Trash2 } from 'lucide-react';
import { CaregiverPatient, CareTask } from '../types';
import { Card, EmptyState, Field } from '../../../components/ui';
import { SkeletonRows } from '../../../components/common/RemoteState';

interface CaregiverTasksTabProps {
  patients: CaregiverPatient[];
  careTasks: CareTask[];
  loading?: boolean;
  onAddTask: (task: { text: string; priority: 'low' | 'normal' | 'high'; patient?: string }) => void;
  onToggleTask: (taskId: string) => void;
  onRemoveTask: (taskId: string) => void;
}

export const TASK_PRIORITY: Record<CareTask['priority'], { label: string; badge: string }> = {
  high: { label: 'High priority', badge: 'badge-danger' },
  normal: { label: 'Normal', badge: 'badge-neutral' },
  low: { label: 'Low', badge: 'badge-neutral' }
};

const TaskRow: React.FC<{ task: CareTask; onToggle: () => void; onRemove: () => void }> = ({ task, onToggle, onRemove }) => {
  const pr = TASK_PRIORITY[task.priority];
  return (
    <li className="list-row">
      <input
        type="checkbox"
        className="h-4 w-4 shrink-0"
        checked={task.completed}
        onChange={onToggle}
        aria-label={task.completed ? `Mark "${task.text}" as not done` : `Mark "${task.text}" as done`}
      />
      <div className="min-w-0 flex-1">
        <p className={`truncate text-13 font-medium ${task.completed ? 'text-slate-400 line-through' : 'text-slate-900 dark:text-slate-100'}`}>
          {task.text}
        </p>
        <p className="text-xs text-slate-500">{task.patient ? task.patient : 'General'}</p>
      </div>
      {task.sample && <span className="badge badge-neutral" title="Built-in demonstration task">Sample</span>}
      {!task.completed && <span className={`badge ${pr.badge}`}>{pr.label}</span>}
      <button
        type="button"
        onClick={onRemove}
        className="btn btn-ghost btn-icon btn-sm text-slate-400 hover:text-red-600"
        aria-label={`Delete task "${task.text}"`}
        title="Delete task"
      >
        <Trash2 />
      </button>
    </li>
  );
};

export const CaregiverTasksTab: React.FC<CaregiverTasksTabProps> = ({ patients, careTasks, loading, onAddTask, onToggleTask, onRemoveTask }) => {
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

  const order = { high: 0, normal: 1, low: 2 };
  const outstanding = careTasks.filter((t) => !t.completed).sort((a, b) => order[a.priority] - order[b.priority]);
  const done = careTasks.filter((t) => t.completed);

  return (
    <div className="space-y-6">
      <Card title="New task">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto] md:items-end">
          <Field label="Task" htmlFor="task-text">
            <input
              id="task-text"
              className="input"
              placeholder="e.g. Record evening blood pressure"
              value={newTask.text}
              onChange={(e) => setNewTask({ ...newTask, text: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
          </Field>
          <Field label="Patient" htmlFor="task-patient">
            <select id="task-patient" className="select" value={newTask.patient} onChange={(e) => setNewTask({ ...newTask, patient: e.target.value })}>
              <option value="">General</option>
              {patients.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Priority" htmlFor="task-priority">
            <select
              id="task-priority"
              className="select"
              value={newTask.priority}
              onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as 'low' | 'normal' | 'high' })}
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </select>
          </Field>
          <button type="button" onClick={handleAdd} disabled={!newTask.text.trim()} className="btn btn-primary">
            <Plus />
            Add task
          </button>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Outstanding" subtitle={`${outstanding.length} to do`} flush>
          {loading && careTasks.length === 0 ? (
            <SkeletonRows rows={3} />
          ) : outstanding.length === 0 ? (
            <EmptyState compact icon={ClipboardCheck} title="Nothing outstanding" />
          ) : (
            <ul className="divide-list">
              {outstanding.map((task) => (
                <TaskRow key={task.id} task={task} onToggle={() => onToggleTask(task.id)} onRemove={() => onRemoveTask(task.id)} />
              ))}
            </ul>
          )}
        </Card>
        <Card title="Completed" subtitle={`${done.length} done`} flush>
          {done.length === 0 ? (
            <EmptyState compact icon={ClipboardCheck} title="No completed tasks yet" />
          ) : (
            <ul className="divide-list">
              {done.map((task) => (
                <TaskRow key={task.id} task={task} onToggle={() => onToggleTask(task.id)} onRemove={() => onRemoveTask(task.id)} />
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
};

export default CaregiverTasksTab;
