import React from 'react';
import { User as UserIcon } from 'lucide-react';
import { CaregiverPatient } from '../types';

interface PatientCardProps {
  patient: CaregiverPatient;
  onOpenDetails: (patientId: string) => void;
  onCreateTask: (patientName: string) => void;
}

export const PatientCard: React.FC<PatientCardProps> = ({
  patient,
  onOpenDetails,
  onCreateTask
}) => (
  <div className="bg-white/80 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-3">
        <div className="h-12 w-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center">
          <UserIcon className="h-7 w-7 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-gray-800">{patient.name}</h3>
          <p className="text-sm text-gray-600">Linked: {new Date(patient.linked_at).toLocaleDateString()}</p>
        </div>
      </div>
      <div className="flex space-x-2">
        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Active</span>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4 text-center mb-4">
      <div className="bg-emerald-50 p-3 rounded-xl">
        <p className="text-2xl font-bold text-emerald-600">{patient.medication_count || 0}</p>
        <p className="text-xs text-gray-600">Medications</p>
      </div>
      <div className="bg-blue-50 p-3 rounded-xl">
        <p className="text-2xl font-bold text-blue-600">{patient.appointment_count || 0}</p>
        <p className="text-xs text-gray-600">Appointments</p>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
      <button
        onClick={() => onOpenDetails(patient.id)}
        className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-2 rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 font-semibold shadow"
      >
        View Details
      </button>
      <button
        onClick={() => onCreateTask(patient.name)}
        className="w-full bg-gradient-to-r from-emerald-500 to-green-500 text-white py-2 rounded-xl hover:from-emerald-600 hover:to-green-600 transition-all duration-300 font-semibold shadow"
      >
        Create Task
      </button>
    </div>
  </div>
);

export default PatientCard;

