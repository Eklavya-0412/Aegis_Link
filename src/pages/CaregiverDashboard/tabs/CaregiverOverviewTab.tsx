import React from 'react';
import { BarChart3, Bell, Users } from 'lucide-react';
import { AlertItem, CaregiverPatient } from '../types';
import PatientCard from '../components/PatientCard';
import CaregiverCharts from '../components/CaregiverCharts';
import AlertsPanel from '../components/AlertsPanel';

interface CaregiverOverviewTabProps {
  patients: CaregiverPatient[];
  alerts: AlertItem[];
  adherenceRateData: number[];
  onOpenDetails: (patientId: string) => void;
  onCreateTask: (patientName: string) => void;
  onAcknowledgeAlert: (alertId: string) => void;
}

export const CaregiverOverviewTab: React.FC<CaregiverOverviewTabProps> = ({
  patients,
  alerts,
  adherenceRateData,
  onOpenDetails,
  onCreateTask,
  onAcknowledgeAlert
}) => {
  const avgAdherence = Math.round(
    adherenceRateData.reduce((a, b) => a + b, 0) / (adherenceRateData.length || 1)
  );

  const stats = [
    { title: 'Total Patients', value: patients.length, icon: Users, bgColor: 'from-blue-400 to-blue-600' },
    { title: 'Active Alerts', value: alerts.filter((a) => !a.acknowledged).length, icon: Bell, bgColor: 'from-red-400 to-red-600' },
    { title: 'Avg Adherence', value: `${avgAdherence}%`, icon: BarChart3, bgColor: 'from-green-400 to-green-600' }
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white/80 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              </div>
              <div className={`h-12 w-12 bg-gradient-to-br ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <CaregiverCharts
        patients={patients}
        alerts={alerts}
        adherenceRateData={adherenceRateData}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-white/20">
            <h3 className="text-xl font-bold mb-6 text-gray-800">Patient Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {patients.slice(0, 4).map((patient) => (
                <PatientCard
                  key={patient.id}
                  patient={patient}
                  onOpenDetails={onOpenDetails}
                  onCreateTask={onCreateTask}
                />
              ))}
              {patients.length === 0 && (
                <div className="col-span-2 text-center py-12 text-gray-500">
                  <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-lg font-medium">No patients linked yet</p>
                  <p className="text-sm">Share your Caregiver ID to get started</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div>
          <AlertsPanel alerts={alerts} onAcknowledgeAlert={onAcknowledgeAlert} />
        </div>
      </div>
    </div>
  );
};

export default CaregiverOverviewTab;

