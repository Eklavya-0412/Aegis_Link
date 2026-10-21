import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import Modal from '../../../components/common/Modal';
import { Field } from '../../../components/ui';

interface AddPatientModalProps {
  isOpen?: boolean;
  onAddPatient: (code: string) => void;
  onClose: () => void;
}

export const AddPatientModal: React.FC<AddPatientModalProps> = ({ isOpen = true, onAddPatient, onClose }) => {
  const [patientCode, setPatientCode] = useState('');

  const handleAdd = () => {
    if (!patientCode.trim()) return;
    onAddPatient(patientCode.trim());
    setPatientCode('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add patient"
      description="Patients share their code with you from their Aegis Link account."
      icon={UserPlus}
      maxWidth="max-w-md"
      footer={
        <>
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button type="button" onClick={handleAdd} disabled={!patientCode.trim()} className="btn btn-primary">
            Add patient
          </button>
        </>
      }
    >
      <Field label="Patient code" htmlFor="patient-code">
        <input
          id="patient-code"
          type="text"
          className="input font-mono"
          placeholder="e.g. PAT123"
          value={patientCode}
          onChange={(e) => setPatientCode(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          autoFocus
        />
      </Field>
    </Modal>
  );
};

export default AddPatientModal;
