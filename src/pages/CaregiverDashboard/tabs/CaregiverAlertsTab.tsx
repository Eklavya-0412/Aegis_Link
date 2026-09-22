import React from 'react';
import { AlertItem, CaregiverPatient } from '../types';
import CaregiverCharts from '../components/CaregiverCharts';
import AlertsPanel from '../components/AlertsPanel';

interface CaregiverAlertsTabProps {
  patients: CaregiverPatient[];
  alerts: AlertItem[];
  adherenceRateData: number[];
  onAcknowledgeAlert: (alertId: string) => void;
}

export const CaregiverAlertsTab: React.FC<CaregiverAlertsTabProps> = ({
  patients,
  alerts,
  adherenceRateData,
  onAcknowledgeAlert
}) => {
  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-gray-800">Patient Alerts</h2>
      <CaregiverCharts
        patients={patients}
        alerts={alerts}
        adherenceRateData={adherenceRateData}
      />
      <AlertsPanel alerts={alerts} onAcknowledgeAlert={onAcknowledgeAlert} />
    </div>
  );
};

export default CaregiverAlertsTab;

