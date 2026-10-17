import React from 'react';
import { Activity, Calendar, CheckCircle2, ClipboardList, Pill, Plus, User } from 'lucide-react';
import { CaregiverCheckin } from '../../../services/clinicalService';

interface CaregiverLogsTabProps {
  checkins: CaregiverCheckin[];
  onOpenCheckinModal: () => void;
}

export const CaregiverLogsTab: React.FC<CaregiverLogsTabProps> = ({
  checkins,
  onOpenCheckinModal
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Caregiver Activity & Oversight Logs</h2>
          <p className="text-sm text-gray-500">Chronological history of patient visits, observations, and care check-ins (UC12)</p>
        </div>
        <button
          onClick={onOpenCheckinModal}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-2xl font-semibold text-sm shadow-md transition flex items-center gap-2 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Log New Check-In
        </button>
      </div>

      <div className="space-y-4">
        {checkins.map((entry) => (
          <div
            key={entry.id}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700 gap-2">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center font-bold">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-800 dark:text-gray-100">
                      {entry.caregiver_name || 'Care Specialist'}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 capitalize">
                      {entry.visit_type.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(entry.checkin_time || entry.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              <span className="text-xs font-mono text-gray-500">
                Patient ID: {entry.patient_id.slice(0, 8)}...
              </span>
            </div>

            <p className="text-sm text-gray-700 dark:text-gray-300 mt-4 leading-relaxed whitespace-pre-line">
              {entry.notes}
            </p>

            {/* Administered Medications & Vitals Badges */}
            <div className="mt-4 flex flex-wrap items-center gap-2 pt-2">
              {entry.vitals_recorded && Object.keys(entry.vitals_recorded).length > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-xl text-xs text-purple-700 dark:text-purple-300">
                  <Activity className="w-3.5 h-3.5" />
                  <span>
                    Vitals:{' '}
                    {Object.entries(entry.vitals_recorded)
                      .map(([k, v]) => `${k.toUpperCase()}: ${v}`)
                      .join(' | ')}
                  </span>
                </div>
              )}

              {entry.medications_administered && entry.medications_administered.length > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-700 dark:text-emerald-300">
                  <Pill className="w-3.5 h-3.5" />
                  <span>Meds: {entry.medications_administered.join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {checkins.length === 0 && (
          <div className="bg-white/80 dark:bg-gray-800/80 p-12 rounded-3xl border text-center">
            <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h4 className="font-bold text-gray-700 dark:text-gray-300">No Activity Logs Found</h4>
            <p className="text-sm text-gray-400 mt-1">Start by recording a visit check-in for your assigned patients.</p>
            <button
              onClick={onOpenCheckinModal}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
            >
              Log First Check-In
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CaregiverLogsTab;
