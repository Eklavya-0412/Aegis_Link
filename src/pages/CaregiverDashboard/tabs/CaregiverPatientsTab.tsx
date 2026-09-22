import React, { useState } from 'react';
import { Users } from 'lucide-react';
import { CaregiverPatient } from '../types';
import PatientCard from '../components/PatientCard';

interface CaregiverPatientsTabProps {
  patients: CaregiverPatient[];
  onLinkPatient: (patientId: string) => void;
  onNavigateToAlerts: () => void;
  onOpenDetails: (patientId: string) => void;
  onCreateTask: (patientName: string) => void;
}

export const CaregiverPatientsTab: React.FC<CaregiverPatientsTabProps> = ({
  patients,
  onLinkPatient,
  onNavigateToAlerts,
  onOpenDetails,
  onCreateTask
}) => {
  const [linkPid, setLinkPid] = useState('');

  const handleLink = () => {
    if (!linkPid.trim()) return;
    onLinkPatient(linkPid.trim());
    setLinkPid('');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold text-gray-800">My Patients</h2>
        <div className="flex items-center space-x-2">
          <input
            value={linkPid}
            onChange={(e) => setLinkPid(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLink()}
            placeholder="Enter Patient ID (e.g., PID-AB12CD)"
            className="p-2 border rounded-lg text-sm w-64 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={handleLink}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
          >
            Link Patient
          </button>
          <button
            onClick={onNavigateToAlerts}
            className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 transition-colors"
          >
            View Alerts
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {patients.map((patient) => (
          <PatientCard
            key={patient.id}
            patient={patient}
            onOpenDetails={onOpenDetails}
            onCreateTask={onCreateTask}
          />
        ))}
        {patients.length === 0 && (
          <div className="col-span-full text-center py-16 text-gray-500">
            <div className="h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-10 w-10 text-gray-400" />
            </div>
            <p className="text-lg font-medium">No patients linked yet</p>
            <p className="text-sm">Share your Caregiver ID with patients to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CaregiverPatientsTab;

