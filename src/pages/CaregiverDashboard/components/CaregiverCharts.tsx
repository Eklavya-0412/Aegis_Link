import React from 'react';
import BarChart from '../../../components/charts/BarChart';
import DonutChart from '../../../components/charts/DonutChart';
import { CHART_COLORS } from '../../../components/charts/ChartFrame';
import { AlertItem, CaregiverPatient } from '../types';

interface CaregiverChartsProps {
  patients: CaregiverPatient[];
  alerts: AlertItem[];
  adherenceRateData: (number | null)[];
}

export const CaregiverCharts: React.FC<CaregiverChartsProps> = ({ patients, alerts, adherenceRateData }) => {
  const names = patients.map((p) => p.name.split(' ')[0]);

  const alertPriorityData = [
    alerts.filter((a) => a.priority === 'emergency').length,
    alerts.filter((a) => a.priority === 'high').length,
    alerts.filter((a) => a.priority === 'normal').length,
    alerts.filter((a) => a.priority === 'low').length
  ];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <DonutChart
        title="Alerts by severity"
        values={alertPriorityData}
        labels={['Emergency', 'High', 'Routine', 'Low']}
        colors={[CHART_COLORS.red, CHART_COLORS.amber, CHART_COLORS.sky, '#D6D0C7']}
        centerLabel="alerts"
        emptyMessage="No alerts recorded"
      />
      <BarChart
        title="Medication adherence today"
        subtitle="Share of scheduled doses marked as taken"
        values={adherenceRateData.map((v) => v ?? 0)}
        labels={names}
        unit="%"
        max={100}
        color={CHART_COLORS.emerald}
        emptyMessage="No doses taken yet today"
      />
      <BarChart
        title="Medications by patient"
        values={patients.map((p) => p.medication_count)}
        labels={names}
        color={CHART_COLORS.brand}
        emptyMessage="No medications on file"
      />
      <BarChart
        title="Appointments by patient"
        values={patients.map((p) => p.appointment_count)}
        labels={names}
        color={CHART_COLORS.sky}
        emptyMessage="No appointments on file"
      />
    </div>
  );
};

export default CaregiverCharts;
