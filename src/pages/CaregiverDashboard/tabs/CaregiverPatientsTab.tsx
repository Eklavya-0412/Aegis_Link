import React, { useState } from 'react';
import { BellRing, Link2, Users } from 'lucide-react';
import { CaregiverPatient } from '../types';
import PatientCard from '../components/PatientCard';
import { EmptyState } from '../../../components/ui';

interface CaregiverPatientsTabProps {
  patients: CaregiverPatient[];
  adherenceRateData?: (number | null)[];
  onLinkPatient: (patientId: string) => void;
  onNavigateToAlerts: () => void;
  onOpenDetails: (patientId: string) => void;
  onCreateTask: (patientName: string) => void;
}

export const CaregiverPatientsTab: React.FC<CaregiverPatientsTabProps> = ({
  patients,
  adherenceRateData = [],
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
    <div className="space-y-6">
      <div className="card flex flex-col gap-3 p-4 md:flex-row md:items-end">
        <div className="flex-1">
          <label htmlFor="link-pid" className="label">
            Link a patient
          </label>
          <div className="flex gap-2">
            <input
              id="link-pid"
              value={linkPid}
              onChange={(e) => setLinkPid(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLink()}
              placeholder="Patient ID, e.g. PID-AB12CD"
              className="input font-mono md:max-w-sm"
            />
            <button type="button" onClick={handleLink} disabled={!linkPid.trim()} className="btn btn-primary">
              <Link2 />
              Link
            </button>
          </div>
        </div>
        <button type="button" onClick={onNavigateToAlerts} className="btn btn-secondary">
          <BellRing />
          View alerts
        </button>
      </div>

      {patients.length === 0 ? (
        <div className="card">
          <EmptyState icon={Users} title="No patients linked yet" description="Share your caregiver ID with patients, or link them using their Patient ID above." />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {patients.map((patient, i) => (
            <PatientCard
              key={patient.id}
              patient={patient}
              adherence={adherenceRateData[i]}
              onOpenDetails={onOpenDetails}
              onCreateTask={onCreateTask}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CaregiverPatientsTab;
