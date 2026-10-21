import React, { useState } from 'react';
import { FilePlus2 } from 'lucide-react';
import { User } from '../../../types';
import Modal from '../../../components/common/Modal';
import { Field } from '../../../components/ui';

interface CreatePlanModalProps {
  patients: User[];
  selectedPatient: User | null;
  onSelectPatient: (patient: User | null) => void;
  onCreatePlan: (patient: User, planData: { title: string; diagnosis: string; plan_details: string; dietary_guidelines: string }) => void;
  onClose: () => void;
}

export const CreatePlanModal: React.FC<CreatePlanModalProps> = ({ patients, selectedPatient, onSelectPatient, onCreatePlan, onClose }) => {
  const [title, setTitle] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [planDetails, setPlanDetails] = useState('');
  const [dietaryGuidelines, setDietaryGuidelines] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !planDetails.trim()) return;
    onCreatePlan(selectedPatient, {
      title: title.trim() || 'Comprehensive Care & Treatment Plan',
      diagnosis: diagnosis.trim(),
      plan_details: planDetails.trim(),
      dietary_guidelines: dietaryGuidelines.trim()
    });
    onClose();
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="New treatment plan"
      description="Treatment directives and dietary guidance. Plans are attributed to you and time-stamped."
      icon={FilePlus2}
      maxWidth="max-w-2xl"
      footer={
        <>
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" form="create-plan-form" disabled={!selectedPatient || !planDetails.trim()} className="btn btn-primary">
            Save plan
          </button>
        </>
      }
    >
      <form id="create-plan-form" onSubmit={handleSubmit} className="space-y-4">
        <Field label="Patient" htmlFor="plan-patient" required>
          <select
            id="plan-patient"
            className="select"
            value={selectedPatient?.user_id || ''}
            onChange={(e) => {
              const patient = patients.find((m) => m.user_id === e.target.value);
              onSelectPatient(patient || null);
            }}
            required
          >
            <option value="">Select a patient</option>
            {patients.map((member) => (
              <option key={member.user_id} value={member.user_id}>
                {member.name} ({member.relationship || member.role})
              </option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Plan title" htmlFor="plan-title">
            <input
              id="plan-title"
              className="input"
              placeholder="e.g. Hypertension management"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Field>
          <Field label="Diagnosis / indication" htmlFor="plan-dx">
            <input
              id="plan-dx"
              className="input"
              placeholder="e.g. Stage 1 essential hypertension"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
            />
          </Field>
        </div>

        <Field label="Treatment directives" htmlFor="plan-details" required helper="Goals, medication titration, monitoring intervals and follow-up timeline.">
          <textarea
            id="plan-details"
            className="textarea"
            rows={5}
            value={planDetails}
            onChange={(e) => setPlanDetails(e.target.value)}
            required
          />
        </Field>

        <Field label="Diet & lifestyle guidance" htmlFor="plan-diet" helper="Optional — e.g. DASH diet, sodium limits, hydration.">
          <textarea id="plan-diet" className="textarea" rows={3} value={dietaryGuidelines} onChange={(e) => setDietaryGuidelines(e.target.value)} />
        </Field>
      </form>
    </Modal>
  );
};

export default CreatePlanModal;
