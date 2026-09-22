import React, { useState } from 'react';

interface AddPatientModalProps {
  onAddPatient: (code: string) => void;
  onClose: () => void;
}

export const AddPatientModal: React.FC<AddPatientModalProps> = ({ onAddPatient, onClose }) => {
  const [patientCode, setPatientCode] = useState('');

  const handleAdd = () => {
    if (!patientCode.trim()) return;
    onAddPatient(patientCode.trim());
    setPatientCode('');
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200">
      <h4 className="text-lg font-bold text-gray-800 mb-4">Add New Patient</h4>
      <div className="flex space-x-3">
        <input
          type="text"
          className="flex-1 p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter patient code (e.g., PAT123)"
          value={patientCode}
          onChange={(e) => setPatientCode(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button
          onClick={handleAdd}
          disabled={!patientCode.trim()}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          Add Patient
        </button>
        <button
          onClick={onClose}
          className="bg-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default AddPatientModal;

