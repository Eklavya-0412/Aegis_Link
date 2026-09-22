import React from 'react';
import { Bell, CheckCircle } from 'lucide-react';
import { AlertItem } from '../types';

interface AlertsPanelProps {
  alerts: AlertItem[];
  onAcknowledgeAlert: (alertId: string) => void;
}

export const AlertsPanel: React.FC<AlertsPanelProps> = ({ alerts, onAcknowledgeAlert }) => {
  return (
    <div className="bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-white/20">
      <h3 className="text-xl font-bold mb-6 flex items-center text-gray-800">
        <Bell className="h-6 w-6 mr-3 text-red-600" />
        Recent Alerts
      </h3>
      <div className="space-y-4">
        {alerts.slice(0, 5).map((alert) => (
          <div
            key={alert.id}
            className={`p-4 rounded-xl border-l-4 ${
              alert.priority === 'emergency'
                ? 'bg-red-50 border-red-500'
                : alert.priority === 'high'
                ? 'bg-yellow-50 border-yellow-500'
                : 'bg-blue-50 border-blue-500'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{alert.patient_name}</p>
                <p className="text-sm text-gray-600">{alert.message}</p>
                <p className="text-xs text-gray-500">{new Date(alert.created_at).toLocaleString()}</p>
              </div>
              {!alert.acknowledged && (
                <button
                  onClick={() => onAcknowledgeAlert(alert.id)}
                  className="text-blue-600 text-sm hover:underline font-medium ml-2"
                >
                  Acknowledge
                </button>
              )}
            </div>
          </div>
        ))}
        {alerts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
            <p className="text-lg font-medium">No active alerts</p>
            <p className="text-sm">All patients are doing well!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertsPanel;

