import React from 'react';
import { AlertOctagon, AlertTriangle, Bell, BellRing, CheckCircle2, Info } from 'lucide-react';
import { AlertItem } from '../types';
import { Card, EmptyState } from '../../../components/ui';
import { formatDateTime, formatRelative } from '../../../utils/format';

interface AlertsPanelProps {
  alerts: AlertItem[];
  onAcknowledgeAlert: (alertId: string) => void;
  /** Maximum number of alerts to show; all when omitted. */
  limit?: number;
  title?: string;
  footer?: React.ReactNode;
}

export const ALERT_SEVERITY: Record<AlertItem['priority'], { label: string; badge: string; icon: typeof Bell; bar: string }> = {
  emergency: { label: 'Emergency', badge: 'badge-danger', icon: AlertOctagon, bar: 'bg-red-500' },
  high: { label: 'High', badge: 'badge-warning', icon: AlertTriangle, bar: 'bg-amber-500' },
  normal: { label: 'Routine', badge: 'badge-info', icon: Info, bar: 'bg-sky-500' },
  low: { label: 'Low', badge: 'badge-neutral', icon: Bell, bar: 'bg-slate-300' }
};

const ORDER: Record<AlertItem['priority'], number> = { emergency: 0, high: 1, normal: 2, low: 3 };

export const AlertsPanel: React.FC<AlertsPanelProps> = ({ alerts, onAcknowledgeAlert, limit, title = 'Alerts', footer }) => {
  // Open alerts first (by severity, then newest), acknowledged ones after.
  const sorted = [...alerts].sort((a, b) => {
    if (!!a.acknowledged !== !!b.acknowledged) return a.acknowledged ? 1 : -1;
    if (ORDER[a.priority] !== ORDER[b.priority]) return ORDER[a.priority] - ORDER[b.priority];
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
  const shown = limit ? sorted.slice(0, limit) : sorted;
  const openCount = alerts.filter((a) => !a.acknowledged).length;

  return (
    <Card title={title} subtitle={`${openCount} open`} icon={BellRing} flush footer={footer}>
      {shown.length === 0 ? (
        <EmptyState compact icon={CheckCircle2} title="No alerts" description="New escalations will appear here in real time." />
      ) : (
        <ul className="divide-list">
          {shown.map((alert) => {
            const sev = ALERT_SEVERITY[alert.priority] || ALERT_SEVERITY.normal;
            return (
              <li key={alert.id} className={`relative flex gap-3 py-3 pl-5 pr-4 ${alert.acknowledged ? 'opacity-60' : ''}`}>
                <span className={`absolute inset-y-3 left-0 w-[3px] rounded-r ${sev.bar}`} aria-hidden />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`badge ${sev.badge}`}>
                      <sev.icon aria-hidden />
                      {sev.label}
                    </span>
                    <p className="truncate text-13 font-semibold text-slate-900 dark:text-slate-100">{alert.patient_name}</p>
                    {alert.sample && <span className="badge badge-neutral" title="Built-in demonstration alert">Sample</span>}
                  </div>
                  <p className="mt-1 text-13 text-slate-700 dark:text-slate-300">{alert.message}</p>
                  <time className="mt-0.5 block text-xs tabular-nums text-slate-500" dateTime={alert.created_at} title={formatDateTime(alert.created_at)}>
                    {formatRelative(alert.created_at)}
                  </time>
                </div>
                <div className="shrink-0 self-center">
                  {alert.acknowledged ? (
                    <span className="badge badge-neutral">
                      <CheckCircle2 aria-hidden />
                      Acknowledged
                    </span>
                  ) : (
                    <button type="button" onClick={() => onAcknowledgeAlert(alert.id)} className="btn btn-secondary btn-sm">
                      Acknowledge
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
};

export default AlertsPanel;
