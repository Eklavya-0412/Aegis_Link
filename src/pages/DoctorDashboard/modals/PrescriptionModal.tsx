import React, { useState } from 'react';
import { XCircle } from 'lucide-react';
import { User } from '../../../types';

interface PrescriptionModalProps {
  patients: User[];
  selectedPatient: User | null;
  onSelectPatient: (patient: User | null) => void;
  onSendPrescription: (data: { patient: User | null; medication: string; dosage: string; instructions: string }) => void;
  onClose: () => void;
}

export const PrescriptionModal: React.FC<PrescriptionModalProps> = ({
  patients,
  selectedPatient,
  onSelectPatient,
  onSendPrescription,
  onClose
}) => {
  const [prescriptionData, setPrescriptionData] = useState({
    medication: '',
    dosage: '',
    instructions: ''
  });

  const handleSend = () => {
    onSendPrescription({
      patient: selectedPatient,
      ...prescriptionData
    });
    setPrescriptionData({ medication: '', dosage: '', instructions: '' });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/95 rounded-2xl shadow-2xl max-w-xl w-full">
        <div className="p-6 border-b flex items-center justify-between">
          <h3 className="text-xl font-bold">Send Prescription</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <XCircle className="h-6 w-6 text-gray-500" />
          </button>
        </div>
        <div className="p-6 space-y-3">
          <select
            className="w-full p-3 border rounded-xl"
            value={selectedPatient?.user_id || ''}
            onChange={(e) => {
              const p = patients.find((m) => m.user_id === e.target.value);
              onSelectPatient(p || null);
            }}
          >
            <option value="">Select Patient</option>
            {patients.map((m) => (
              <option key={m.user_id} value={m.user_id}>
                {m.name}
              </option>
            ))}
          </select>
          <input
            className="w-full p-3 border rounded-xl"
            placeholder="Medication"
            value={prescriptionData.medication}
            onChange={(e) => setPrescriptionData({ ...prescriptionData, medication: e.target.value })}
          />
          <input
            className="w-full p-3 border rounded-xl"
            placeholder="Dosage"
            value={prescriptionData.dosage}
            onChange={(e) => setPrescriptionData({ ...prescriptionData, dosage: e.target.value })}
          />
          <textarea
            className="w-full p-3 border rounded-xl"
            rows={3}
            placeholder="Instructions"
            value={prescriptionData.instructions}
            onChange={(e) => setPrescriptionData({ ...prescriptionData, instructions: e.target.value })}
          />
          <button
            onClick={handleSend}
            disabled={!prescriptionData.medication.trim()}
            className="w-full bg-purple-600 text-white py-3 rounded-xl disabled:opacity-50 hover:bg-purple-700 transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionModal;

