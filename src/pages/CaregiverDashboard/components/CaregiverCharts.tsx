import React from 'react';
import BarChart from '../../../components/charts/BarChart';
import DonutChart from '../../../components/charts/DonutChart';
import { AlertItem, CaregiverPatient } from '../types';

interface CaregiverChartsProps {
  patients: CaregiverPatient[];
  alerts: AlertItem[];
  adherenceRateData: number[];
}

export const CaregiverCharts: React.FC<CaregiverChartsProps> = ({
  patients,
  alerts,
  adherenceRateData
}) => {
  const patientMedicationData = patients.map((p) => p.medication_count);
  const patientMedicationLabels = patients.map((p) => p.name);
  const patientAppointmentData = patients.map((p) => p.appointment_count);
  const patientAppointmentLabels = patients.map((p) => p.name);

  const alertPriorityData = [
    alerts.filter((a) => a.priority === 'emergency').length,
    alerts.filter((a) => a.priority === 'high').length,
    alerts.filter((a) => a.priority === 'normal').length,
    alerts.filter((a) => a.priority === 'low').length
  ];
  const alertPriorityLabels = ['Emergency', 'High', 'Normal', 'Low'];
  const alertPriorityColors = ['#ef4444', '#f97316', '#eab308', '#10b981'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {patients.length > 0 && (
        <BarChart
          values={patientMedicationData}
          labels={patientMedicationLabels}
          color="#10b981"
          title="Medications by Patient"
        />
      )}
      {patients.length > 0 && (
        <BarChart
          values={patientAppointmentData}
          labels={patientAppointmentLabels}
          color="#3b82f6"
          title="Appointments by Patient"
        />
      )}
      {alerts.length > 0 && (
        <DonutChart
          values={alertPriorityData}
          labels={alertPriorityLabels}
          colors={alertPriorityColors}
          title="Alerts by Priority"
        />
      )}
      {patients.length > 0 && (
        <BarChart
          values={adherenceRateData}
          labels={patientMedicationLabels}
          color="#8b5cf6"
          title="Adherence Rate by Patient (%)"
        />
      )}
    </div>
  );
};

export default CaregiverCharts;

