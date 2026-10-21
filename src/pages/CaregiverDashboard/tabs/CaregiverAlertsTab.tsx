import React from 'react';
import { AlertItem, CaregiverPatient } from '../types';
import CaregiverCharts from '../components/CaregiverCharts';
import AlertsPanel from '../components/AlertsPanel';

interface CaregiverAlertsTabProps {
  patients: CaregiverPatient[];
  alerts: AlertItem[];
  adherenceRateData: (number | null)[];
  onAcknowledgeAlert: (alertId: string) => void;
}

export const CaregiverAlertsTab: React.FC<CaregiverAlertsTabProps> = ({ patients, alerts, adherenceRateData, onAcknowledgeAlert }) => {
  return (
    <div className="space-y-6">
      <AlertsPanel title="All alerts" alerts={alerts} onAcknowledgeAlert={onAcknowledgeAlert} />
      <CaregiverCharts patients={patients} alerts={alerts} adherenceRateData={adherenceRateData} />
    </div>
  );
};

export default CaregiverAlertsTab;
