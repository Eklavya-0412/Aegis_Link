import React, { useState, type Dispatch, type SetStateAction } from 'react';
import { CalendarHeart, Lock, Plus } from 'lucide-react';
import { MenstrualData, User } from '../../types';
import { useToastStore } from '../../store/toastStore';
import { Card, EmptyState, Field, KeyValue } from '../../components/ui';
import { formatDate, titleCase } from '../../utils/format';

interface MenstrualTrackerProps {
  selectedMember: User | null;
  currentUser: User | null;
  menstrualData: MenstrualData[];
  setMenstrualData: Dispatch<SetStateAction<MenstrualData[]>>;
}

const symptomOptions = ['Cramps', 'Headache', 'Mood swings', 'Bloating', 'Fatigue', 'Breast tenderness', 'Nausea', 'Back pain', 'Food cravings'];

const MenstrualTracker: React.FC<MenstrualTrackerProps> = ({ selectedMember, currentUser, menstrualData, setMenstrualData }) => {
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
    useToastStore.getState().showToast('Cycle logged.', 'success');
  };

  const memberCycles = menstrualData.filter((d) => d.member_id === selectedMember?.user_id);
  const lastCycle = memberCycles[0];
  const nextPredicted = lastCycle
    ? new Date(new Date(lastCycle.cycle_start).getTime() + lastCycle.cycle_length * 24 * 60 * 60 * 1000)
    : null;

  return (
    <Card
      title="Cycle tracking"
      subtitle={
        <span className="inline-flex items-center gap-1">
          <Lock className="h-3 w-3" aria-hidden />
          Sensitive health data · hidden from caregivers
        </span>
      }
      icon={CalendarHeart}
      actions={
        <button type="button" onClick={() => setShowForm(!showForm)} className="btn btn-secondary btn-sm">
          <Plus />
          Log cycle
        </button>
      }
    >
      {showForm && (
        <div className="surface-muted mb-5 p-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Cycle start date" htmlFor="cycle-start" required>
              <input
                id="cycle-start"
                type="date"
                className="input"
                value={cycleData.cycle_start}
                onChange={(e) => setCycleData({ ...cycleData, cycle_start: e.target.value })}
              />
            </Field>
            <Field label="Cycle length (days)" htmlFor="cycle-length">
              <input
                id="cycle-length"
                type="number"
                min="21"
                max="35"
                className="input tabular-nums"
                value={cycleData.cycle_length}
                onChange={(e) => setCycleData({ ...cycleData, cycle_length: parseInt(e.target.value) || 28 })}
              />
            </Field>
            <Field label="Flow" htmlFor="cycle-flow">
              <select
                id="cycle-flow"
                className="select"
                value={cycleData.flow_intensity}
                onChange={(e) => setCycleData({ ...cycleData, flow_intensity: e.target.value })}
              >
                <option value="light">Light</option>
                <option value="medium">Medium</option>
                <option value="heavy">Heavy</option>
              </select>
            </Field>
          </div>
          <fieldset className="mt-4">
            <legend className="label">Symptoms</legend>
            <div className="flex flex-wrap gap-2">
              {symptomOptions.map((symptom) => {
                const checked = cycleData.symptoms.includes(symptom);
                return (
                  <label
                    key={symptom}
                    className={`inline-flex h-8 cursor-pointer items-center gap-2 rounded-md border px-2.5 text-13 transition-colors ${
                      checked
                        ? 'border-brand-500 bg-brand-50 text-brand-800 dark:bg-brand-950/50 dark:text-brand-200'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="h-3.5 w-3.5"
                      checked={checked}
                      onChange={(e) =>
                        setCycleData({
                          ...cycleData,
                          symptoms: e.target.checked ? [...cycleData.symptoms, symptom] : cycleData.symptoms.filter((s) => s !== symptom)
                        })
                      }
                    />
                    {symptom}
                  </label>
                );
              })}
            </div>
          </fieldset>
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary btn-sm">
              Cancel
            </button>
            <button type="button" onClick={logCycle} disabled={!cycleData.cycle_start} className="btn btn-primary btn-sm">
              Save
            </button>
          </div>
        </div>
      )}

      {lastCycle ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <dl className="divide-y divide-slate-100 dark:divide-slate-800">
            <KeyValue label="Last period started">{formatDate(lastCycle.cycle_start)}</KeyValue>
            <KeyValue label="Cycle length">{lastCycle.cycle_length} days</KeyValue>
            <KeyValue label="Flow">{titleCase(lastCycle.flow_intensity)}</KeyValue>
            <KeyValue label="Next period (estimate)">{nextPredicted ? formatDate(nextPredicted) : '—'}</KeyValue>
          </dl>
          <div>
            <p className="eyebrow mb-2">Symptoms last cycle</p>
            {lastCycle.symptoms.length ? (
              <div className="flex flex-wrap gap-1.5">
                {lastCycle.symptoms.map((symptom) => (
                  <span key={symptom} className="badge badge-neutral">
                    {symptom}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-13 text-slate-500">None logged</p>
            )}
            <p className="mt-4 text-xs text-slate-500">
              {memberCycles.length > 2
                ? `${memberCycles.length} cycles logged. Estimates are based on your last recorded cycle length.`
                : 'Log at least three cycles to see patterns. Estimates are based on your last recorded cycle length.'}
            </p>
          </div>
        </div>
      ) : (
        <EmptyState compact icon={CalendarHeart} title="No cycles logged yet" />
      )}
    </Card>
  );
};

export default MenstrualTracker;
