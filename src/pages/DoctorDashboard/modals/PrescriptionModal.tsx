import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { User } from '../../../types';
import Modal from '../../../components/common/Modal';
import { Field } from '../../../components/ui';

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
    <Modal
      isOpen
      onClose={onClose}
      title="New prescription"
      description="Review the details carefully before sending."
      icon={Send}
      maxWidth="max-w-lg"
      footer={
        <>
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button type="button" onClick={handleSend} disabled={!prescriptionData.medication.trim()} className="btn btn-primary">
            <Send />
            Send prescription
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Patient" htmlFor="rx-patient" required>
          <select
            id="rx-patient"
            className="select"
            value={selectedPatient?.user_id || ''}
            onChange={(e) => {
              const p = patients.find((m) => m.user_id === e.target.value);
              onSelectPatient(p || null);
            }}
          >
            <option value="">Select a patient</option>
            {patients.map((m) => (
              <option key={m.user_id} value={m.user_id}>
                {m.name}
              </option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <Field label="Medication" htmlFor="rx-med" required>
            <input
              id="rx-med"
              className="input"
              placeholder="e.g. Amlodipine"
              value={prescriptionData.medication}
              onChange={(e) => setPrescriptionData({ ...prescriptionData, medication: e.target.value })}
            />
          </Field>
          <Field label="Dosage" htmlFor="rx-dose">
            <input
              id="rx-dose"
              className="input tabular-nums"
              placeholder="e.g. 5 mg"
              value={prescriptionData.dosage}
              onChange={(e) => setPrescriptionData({ ...prescriptionData, dosage: e.target.value })}
            />
          </Field>
        </div>
        <Field label="Instructions" htmlFor="rx-instructions">
          <textarea
            id="rx-instructions"
            className="textarea"
            rows={3}
            placeholder="e.g. Take one tablet each morning with food"
            value={prescriptionData.instructions}
            onChange={(e) => setPrescriptionData({ ...prescriptionData, instructions: e.target.value })}
          />
        </Field>
      </div>
    </Modal>
  );
};

export default PrescriptionModal;
