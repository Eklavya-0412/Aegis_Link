import React, { useState } from 'react';
import { User } from '../../../types';

interface CreatePlanModalProps {
  patients: User[];
  selectedPatient: User | null;
  onSelectPatient: (patient: User | null) => void;
  onCreatePlan: (patient: User, planText: string) => void;
  onClose: () => void;
}

export const CreatePlanModal: React.FC<CreatePlanModalProps> = ({
  patients,
  selectedPatient,
  onSelectPatient,
  onCreatePlan,
  onClose
}) => {
  const [treatmentPlan, setTreatmentPlan] = useState('');

  const handleSubmit = () => {
    if (!selectedPatient || !treatmentPlan.trim()) return;
    onCreatePlan(selectedPatient, treatmentPlan.trim());
    setTreatmentPlan('');
    onClose();
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-200">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Create Treatment Plan</h3>
      <div className="space-y-4">
        <select
          className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          value={selectedPatient?.user_id || ''}
          onChange={(e) => {
            const patient = patients.find((m) => m.user_id === e.target.value);
            onSelectPatient(patient || null);
          }}
        >
          <option value="">Select Patient</option>
          {patients.map((member) => (
            <option key={member.user_id} value={member.user_id}>
              {member.name} ({member.relationship || member.role})
            </option>
          ))}
        </select>

        <textarea
          className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          rows={6}
          placeholder="Enter treatment plan details, medications, follow-up instructions..."
          value={treatmentPlan}
          onChange={(e) => setTreatmentPlan(e.target.value)}
        />

        <div className="flex space-x-3">
          <button
            onClick={handleSubmit}
            disabled={!selectedPatient || !treatmentPlan.trim()}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 font-medium"
          >
            Create Plan
          </button>
          <button
            onClick={onClose}
            className="bg-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-300 transition-all duration-300 font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePlanModal;

