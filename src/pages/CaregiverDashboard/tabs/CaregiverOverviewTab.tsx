import React from 'react';
import { AlertOctagon, ArrowRight, BellRing, ClipboardCheck, ClipboardList, Pill, Plus, Users } from 'lucide-react';
import { AlertItem, CaregiverPatient, CareTask } from '../types';
import PatientCard from '../components/PatientCard';
import AlertsPanel from '../components/AlertsPanel';
import { Card, EmptyState, StatTile } from '../../../components/ui';
import { TASK_PRIORITY } from './CaregiverTasksTab';
import { CheckinEntry } from './CaregiverLogsTab';
import { CaregiverCheckin } from '../../../services/clinicalService';

interface CaregiverOverviewTabProps {
  patients: CaregiverPatient[];
  alerts: AlertItem[];
  adherenceRateData: (number | null)[];
  careTasks?: CareTask[];
  checkins?: CaregiverCheckin[];
  onToggleTask?: (taskId: string) => void;
  onOpenCheckin?: () => void;
  onNavigate?: (key: string, label: string) => void;
  onOpenDetails: (patientId: string) => void;
  onCreateTask: (patientName: string) => void;
  onAcknowledgeAlert: (alertId: string) => void;
}

export const CaregiverOverviewTab: React.FC<CaregiverOverviewTabProps> = ({
  patients,
  alerts,
  adherenceRateData,
  careTasks = [],
  checkins = [],
  onToggleTask,
  onOpenCheckin,
  onNavigate,
  onOpenDetails,
  onCreateTask,
  onAcknowledgeAlert
}) => {
  const tracked = adherenceRateData.filter((v): v is number => v !== null);
  const avgAdherence = tracked.length ? Math.round(tracked.reduce((a, b) => a + b, 0) / tracked.length) : null;
  const openAlerts = alerts.filter((a) => !a.acknowledged);
  const emergencies = openAlerts.filter((a) => a.priority === 'emergency').length;
  const outstanding = careTasks.filter((t) => !t.completed);

  return (
    <div className="space-y-6">
      {emergencies > 0 && (
        <div className="callout callout-danger" role="alert">
          <AlertOctagon aria-hidden />
          <div className="flex flex-1 flex-wrap items-center justify-between gap-2">
            <p>
              <span className="font-semibold">
                {emergencies} emergency {emergencies === 1 ? 'alert needs' : 'alerts need'} attention.
              </span>{' '}
              Review and acknowledge below, and escalate to the treating physician if required.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatTile label="Assigned patients" value={patients.length} icon={Users} tone="brand" onClick={onNavigate && (() => onNavigate('patients', 'Assigned patients'))} />
        <StatTile
          label="Open alerts"
          value={openAlerts.length}
          icon={BellRing}
          tone={emergencies ? 'danger' : openAlerts.length ? 'warning' : 'success'}
          meta={emergencies ? `${emergencies} emergency` : 'No emergencies'}
          onClick={onNavigate && (() => onNavigate('alerts', 'Alerts'))}
        />
        <StatTile
          label="Outstanding tasks"
          value={outstanding.length}
          icon={ClipboardCheck}
          tone="neutral"
          meta={`${careTasks.length - outstanding.length} completed`}
          onClick={onNavigate && (() => onNavigate('tasks', 'Care tasks'))}
        />
        <StatTile
          label="Medication adherence today"
          value={avgAdherence !== null ? `${avgAdherence}%` : '—'}
          icon={Pill}
          tone="success"
          meta={tracked.length ? `Across ${tracked.length} patients with scheduled doses` : 'No doses scheduled'}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card
            title="Assigned patients"
            subtitle={`${patients.length} in your care`}
            actions={
              onNavigate && (
                <button type="button" className="btn-link" onClick={() => onNavigate('patients', 'Assigned patients')}>
                  View all <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )
            }
          >
            {patients.length === 0 ? (
              <EmptyState compact icon={Users} title="No patients linked yet" description="Share your caregiver ID with patients to get started." />
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {patients.slice(0, 4).map((patient) => (
                  <PatientCard
                    key={patient.id}
                    patient={patient}
                    adherence={adherenceRateData[patients.indexOf(patient)]}
                    onOpenDetails={onOpenDetails}
                    onCreateTask={onCreateTask}
                  />
                ))}
              </div>
            )}
          </Card>

          <Card
            title="Outstanding care tasks"
            flush
            actions={
              onNavigate && (
                <button type="button" className="btn-link" onClick={() => onNavigate('tasks', 'Care tasks')}>
                  Manage tasks
                </button>
              )
            }
          >
            {outstanding.length === 0 ? (
              <EmptyState compact icon={ClipboardCheck} title="All tasks complete" />
            ) : (
              <ul className="divide-list">
                {outstanding.slice(0, 5).map((task) => {
                  const pr = TASK_PRIORITY[task.priority];
                  return (
                    <li key={task.id} className="list-row">
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={task.completed}
                        onChange={() => onToggleTask && onToggleTask(task.id)}
                        aria-label={`Mark "${task.text}" complete`}
                        disabled={!onToggleTask}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-13 font-medium text-slate-900 dark:text-slate-100">{task.text}</p>
                        {task.patient && <p className="text-xs text-slate-500">{task.patient}</p>}
                      </div>
                      {task.sample && <span className="badge badge-neutral" title="Built-in demonstration task">Sample</span>}
                      <span className={`badge ${pr.badge}`}>{pr.label}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          <Card
            title="Recent visits"
            subtitle="Your latest check-ins and observations"
            icon={ClipboardList}
            flush
            actions={
              <>
                {onNavigate && (
                  <button type="button" className="btn-link" onClick={() => onNavigate('logs', 'Visit logs')}>
                    All visits
                  </button>
                )}
                {onOpenCheckin && (
                  <button type="button" className="btn btn-secondary btn-sm" onClick={onOpenCheckin}>
                    <Plus />
                    Log visit
                  </button>
                )}
              </>
            }
          >
            {checkins.length === 0 ? (
              <EmptyState compact icon={ClipboardList} title="No visits logged yet" description="Log a visit to record observations, vitals and medications given." />
            ) : (
              <ul className="divide-list">
                {checkins.slice(0, 3).map((c) => (
                  <CheckinEntry key={c.id} entry={c} compact />
                ))}
              </ul>
            )}
          </Card>
        </div>

        <AlertsPanel
          title="Recent alerts"
          alerts={alerts}
          onAcknowledgeAlert={onAcknowledgeAlert}
          limit={5}
          footer={
            onNavigate && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => onNavigate('alerts', 'Alerts')}>
                View all alerts
              </button>
            )
          }
        />
      </div>
    </div>
  );
};

export default CaregiverOverviewTab;
