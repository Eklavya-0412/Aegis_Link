import React from 'react';
import { Eye, UserPlus, Users } from 'lucide-react';
import { User } from '../../../types';
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
  onSelectPatient,
  showAddPatient,
  setShowAddPatient,
  onAddPatient,
  onOpenLabResults,
  onOpenPrescription
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-gray-800">My Patients</h3>
        <button
          onClick={() => setShowAddPatient(true)}
          className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          <UserPlus className="h-4 w-4 inline mr-2" />
          Add Patient
        </button>
      </div>

      {showAddPatient && (
        <AddPatientModal
          onAddPatient={onAddPatient}
          onClose={() => setShowAddPatient(false)}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {patients.map((patient) => (
          <div key={patient.user_id} className="bg-white/80 p-6 rounded-2xl border hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {patient.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">{patient.name}</h4>
                  <p className="text-sm text-gray-600">Age: {patient.age}</p>
                </div>
              </div>
              <button
                onClick={() => onSelectPatient(patient)}
                className="text-blue-600 hover:text-blue-800 transition-colors p-1"
                title="Select Patient"
              >
                <Eye className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium truncate ml-2">{patient.email}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Role:</span>
                <span className="font-medium capitalize">{patient.relationship || patient.role}</span>
              </div>
              {patient.code && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Code:</span>
                  <span className="font-medium">{patient.code}</span>
                </div>
              )}
            </div>

            <div className="mt-4 flex space-x-2">
              <button
                onClick={() => {
                  onSelectPatient(patient);
                  onOpenLabResults(patient);
                }}
                className="flex-1 bg-green-100 text-green-700 py-2 px-3 rounded-lg text-sm hover:bg-green-200 transition-colors font-medium"
              >
                View Labs
              </button>
              <button
                onClick={() => {
                  onSelectPatient(patient);
                  onOpenPrescription(patient);
                }}
                className="flex-1 bg-purple-100 text-purple-700 py-2 px-3 rounded-lg text-sm hover:bg-purple-200 transition-colors font-medium"
              >
                Prescribe
              </button>
            </div>
          </div>
        ))}
      </div>

      {patients.length === 0 && (
        <div className="bg-white/80 p-8 rounded-2xl border text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-600 mb-2">No Patients Yet</h4>
          <p className="text-gray-500 mb-4">Add patients using their unique patient codes to start managing their healthcare.</p>
          <button
            onClick={() => setShowAddPatient(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Add Your First Patient
          </button>
        </div>
      )}
    </div>
  );
};

export default DoctorPatientsTab;

