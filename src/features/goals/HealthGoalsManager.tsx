import React, { useState, type Dispatch, type SetStateAction } from 'react';
import { CheckCircle2, Plus, Target, TrendingUp } from 'lucide-react';
import { HealthGoal, User } from '../../types';
import { Card, EmptyState, Field, PageHeader, ProgressBar, StatusBadge } from '../../components/ui';
import { formatDate } from '../../utils/format';

interface HealthGoalsManagerProps {
  selectedMember: User | null;
  healthGoals: HealthGoal[];
  setHealthGoals: Dispatch<SetStateAction<HealthGoal[]>>;
}

const HealthGoalsManager: React.FC<HealthGoalsManagerProps> = ({ selectedMember, healthGoals, setHealthGoals }) => {
  const memberId = selectedMember?.user_id || '';
  const memberGoals = healthGoals.filter((goal) => goal.member_id === memberId);
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
    <div className="page">
      <PageHeader
        eyebrow="Care"
        title="Health goals"
        description={`Personal targets and progress for ${selectedMember?.name || 'this member'}.`}
      />

      {memberGoals.length === 0 ? (
        <div className="card">
          <EmptyState icon={Target} title="No goals yet" description="Create a goal below to start tracking progress." />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {memberGoals.map((goal) => {
            const pct = Math.min(100, Math.round((goal.current_value / (goal.target_value || 1)) * 100));
            return (
              <div key={goal.id} className="card flex flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{goal.title}</p>
                    <p className="mt-0.5 text-xs text-slate-500">Due {formatDate(goal.deadline)}</p>
                  </div>
                  {goal.completed ? (
                    <StatusBadge severity="success">Completed</StatusBadge>
                  ) : (
                    <StatusBadge severity="info" icon={TrendingUp}>
                      In progress
                    </StatusBadge>
                  )}
                </div>
                <div className="mt-4 flex items-baseline justify-between">
                  <p className="tabular-nums">
                    <span className="text-xl font-semibold text-slate-900 dark:text-slate-50">{goal.current_value.toLocaleString()}</span>
                    <span className="text-13 text-slate-500"> / {goal.target_value.toLocaleString()} {goal.unit}</span>
                  </p>
                  <span className="text-13 font-medium tabular-nums text-slate-600 dark:text-slate-300">{pct}%</span>
                </div>
                <div className="mt-2">
                  <ProgressBar value={pct} tone={goal.completed ? 'success' : 'brand'} label={`${goal.title} progress`} />
                </div>
                <div className="mt-5 flex gap-2">
                  <button
                    type="button"
                    disabled={goal.completed}
                    onClick={() =>
                      setHealthGoals(
                        healthGoals.map((item) =>
                          item.id === goal.id
                            ? { ...item, current_value: Math.min(item.target_value, item.current_value + Math.ceil(item.target_value * 0.1)) }
                            : item
                        )
                      )
                    }
                    className="btn btn-secondary btn-sm flex-1"
                  >
                    <Plus />
                    Add 10%
                  </button>
                  <button
                    type="button"
                    disabled={goal.completed}
                    onClick={() =>
                      setHealthGoals(
                        healthGoals.map((item) => (item.id === goal.id ? { ...item, completed: true, current_value: item.target_value } : item))
                      )
                    }
                    className="btn btn-primary btn-sm flex-1"
                  >
                    <CheckCircle2 />
                    Mark complete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Card title="New goal">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end">
          <Field label="Goal" htmlFor="goal-title">
            <input
              id="goal-title"
              className="input"
              placeholder="e.g. Daily walk"
              value={newGoal.title}
              onChange={(event) => setNewGoal({ ...newGoal, title: event.target.value })}
            />
          </Field>
          <Field label="Target" htmlFor="goal-target">
            <input
              id="goal-target"
              type="number"
              className="input tabular-nums"
              value={newGoal.target_value}
              onChange={(event) => setNewGoal({ ...newGoal, target_value: Number(event.target.value) })}
            />
          </Field>
          <Field label="Unit" htmlFor="goal-unit">
            <select id="goal-unit" className="select" value={newGoal.unit} onChange={(event) => setNewGoal({ ...newGoal, unit: event.target.value })}>
              <option value="steps">steps</option>
              <option value="minutes">minutes</option>
              <option value="kg">kg</option>
            </select>
          </Field>
          <button type="button" onClick={addGoal} className="btn btn-primary">
            <Plus />
            Add goal
          </button>
        </div>
      </Card>
    </div>
  );
};

export default HealthGoalsManager;
