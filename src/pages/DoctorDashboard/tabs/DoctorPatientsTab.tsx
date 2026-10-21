import React from 'react';
import { FlaskConical, Send, UserPlus, Users } from 'lucide-react';
import { User } from '../../../types';
import { Avatar, Card, EmptyState } from '../../../components/ui';
import { roleLabel } from '../../../utils/format';
import AddPatientModal from '../modals/AddPatientModal';

interface DoctorPatientsTabProps {
  patients: User[];
  selectedPatient: User | null;
  onSelectPatient: (patient: User) => void;
  showAddPatient: boolean;
  setShowAddPatient: (show: boolean) => void;
  onAddPatient: (code: string) => void;
  onOpenLabResults: (patient: User) => void;
  onOpenPrescription: (patient: User) => void;
}

export const DoctorPatientsTab: React.FC<DoctorPatientsTabProps> = ({
  patients,
  selectedPatient,
  onSelectPatient,
  showAddPatient,
  setShowAddPatient,
  onAddPatient,
  onOpenLabResults,
  onOpenPrescription
}) => {
  return (
    <>
      <AddPatientModal isOpen={showAddPatient} onAddPatient={onAddPatient} onClose={() => setShowAddPatient(false)} />

      <Card
        title="Patient panel"
        subtitle={`${patients.length} patients`}
        flush
        actions={
          <button type="button" onClick={() => setShowAddPatient(true)} className="btn btn-primary btn-sm">
            <UserPlus />
            Add patient
          </button>
        }
      >
        {patients.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No patients yet"
            description="Add patients using their unique patient code to start managing their care."
            action={
              <button type="button" onClick={() => setShowAddPatient(true)} className="btn btn-primary">
                <UserPlus />
                Add your first patient
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th className="hidden md:table-cell">Contact</th>
                  <th className="hidden sm:table-cell">Code</th>
                  <th className="w-0 text-right">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => {
                  const focused = selectedPatient?.user_id === patient.user_id;
                  return (
                    <tr key={patient.user_id} className={focused ? 'bg-brand-50/50 dark:bg-brand-950/30' : ''}>
                      <td>
                        <button
                          type="button"
                          onClick={() => onSelectPatient(patient)}
                          className="flex items-center gap-3 rounded-md text-left"
                          aria-pressed={focused}
                          title="Show in clinical overview"
                        >
                          <Avatar name={patient.name} size="sm" />
                          <span className="min-w-0">
                            <span className="block truncate font-medium text-slate-900 hover:text-brand-700 dark:text-slate-100">
                              {patient.name}
                            </span>
                            <span className="block text-xs text-slate-500">
                              {patient.age} y · {patient.relationship ? patient.relationship : roleLabel(patient.role)}
                            </span>
                          </span>
                          {focused && <span className="badge badge-brand ml-1">In focus</span>}
                        </button>
                      </td>
                      <td className="hidden max-w-[16rem] truncate md:table-cell">{patient.email}</td>
                      <td className="hidden font-mono text-xs sm:table-cell">{patient.code || '—'}</td>
                      <td>
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              onSelectPatient(patient);
                              onOpenLabResults(patient);
                            }}
                            className="btn btn-secondary btn-sm"
                          >
                            <FlaskConical />
                            <span className="hidden lg:inline">Labs</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              onSelectPatient(patient);
                              onOpenPrescription(patient);
                            }}
                            className="btn btn-secondary btn-sm"
                          >
                            <Send />
                            <span className="hidden lg:inline">Prescribe</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
};

export default DoctorPatientsTab;
