import React, { useState } from 'react';
import { Check, History, Loader2, Pill, Save } from 'lucide-react';
import { Medication, User } from '../../../types';
import { updatePatientMedicationDosage } from '../../../services/clinicalService';
import { useToastStore } from '../../../store/toastStore';
import Modal from '../../../components/common/Modal';
import { EmptyState, Field } from '../../../components/ui';

interface ManagePatientMedsModalProps {
  patient: User;
  medications: Medication[];
  onClose: () => void;
  onMedicationUpdated: (updatedMed: Medication) => void;
}

export const ManagePatientMedsModal: React.FC<ManagePatientMedsModalProps> = ({ patient, medications, onClose, onMedicationUpdated }) => {
  const patientMeds = medications.filter((m) => m.member_id === patient.user_id);
  const [selectedMed, setSelectedMed] = useState<Medication | null>(patientMeds[0] || null);
  const [dosage, setDosage] = useState(patientMeds[0]?.dosage || '');
  const [frequency, setFrequency] = useState(patientMeds[0]?.frequency || '');
  const [saving, setSaving] = useState(false);
  const [successNotice, setSuccessNotice] = useState('');
  const { showToast } = useToastStore();

  const handleSelectMed = (med: Medication) => {
    setSelectedMed(med);
    setDosage(med.dosage);
    setFrequency(med.frequency);
    setSuccessNotice('');
  };

  const handleUpdateDosage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMed || !dosage.trim()) return;

    setSaving(true);
    setSuccessNotice('');

    try {
      await updatePatientMedicationDosage(patient.user_id, selectedMed.id, {
        dosage: dosage.trim(),
        frequency: frequency.trim()
      });

      const updatedMed: Medication = {
        ...selectedMed,
        dosage: dosage.trim(),
        frequency: frequency.trim()
      };

      onMedicationUpdated(updatedMed);
      setSuccessNotice(`${selectedMed.name} updated to ${dosage.trim()}. The change was recorded in the activity log.`);
      showToast(`Updated ${selectedMed.name} to ${dosage.trim()}.`, 'success');
    } catch (err: any) {
      showToast(err?.response?.data?.detail || err?.message || 'Failed to update medication dosage', 'error');
    } finally {
      setSaving(false);
    }
  };

  const changed = !!selectedMed && (dosage.trim() !== selectedMed.dosage || frequency.trim() !== selectedMed.frequency);

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Manage medications"
      description={`Adjust dose or schedule for ${patient.name}. Changes are attributed to you.`}
      icon={Pill}
      maxWidth="max-w-2xl"
      footer={
        <>
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Close
          </button>
          <button type="submit" form="manage-med-form" disabled={saving || !selectedMed || !dosage.trim() || !changed} className="btn btn-primary">
            {saving ? <Loader2 className="animate-spin" /> : <Save />}
            {saving ? 'Saving…' : 'Save change'}
          </button>
        </>
      }
    >
      {patientMeds.length === 0 ? (
        <EmptyState icon={Pill} title="No medications on file" description={`${patient.name} has no medications to adjust.`} />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <div>
            <p className="eyebrow mb-2">Current prescriptions</p>
            <ul className="max-h-72 space-y-1.5 overflow-y-auto" role="listbox" aria-label="Medications">
              {patientMeds.map((med) => {
                const isSelected = selectedMed?.id === med.id;
                return (
                  <li key={med.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelectMed(med)}
                      className={`w-full rounded-lg border px-3 py-2.5 text-left transition-colors ${
                        isSelected
                          ? 'border-brand-500 bg-brand-50/60 dark:border-brand-600 dark:bg-brand-950/40'
                          : 'border-slate-200 hover:border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-13 font-medium text-slate-900 dark:text-slate-100">{med.name}</span>
                        <span className="text-xs font-medium tabular-nums text-slate-600 dark:text-slate-300">{med.dosage}</span>
                      </span>
                      <span className="mt-0.5 block text-xs text-slate-500">{med.frequency.replace(/_/g, ' ')}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {selectedMed && (
            <form id="manage-med-form" onSubmit={handleUpdateDosage} className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{selectedMed.name}</p>
                <p className="text-xs text-slate-500">
                  Currently <span className="tabular-nums">{selectedMed.dosage}</span> · {selectedMed.frequency.replace(/_/g, ' ')}
                </p>
              </div>

              {successNotice && (
                <div className="callout callout-info" role="status">
                  <Check aria-hidden />
                  <p>{successNotice}</p>
                </div>
              )}

              <Field label="New dosage" htmlFor="mm-dosage" required>
                <input id="mm-dosage" value={dosage} onChange={(e) => setDosage(e.target.value)} placeholder="e.g. 10 mg" className="input tabular-nums" required />
              </Field>
              <Field label="Frequency / schedule" htmlFor="mm-frequency">
                <input id="mm-frequency" value={frequency} onChange={(e) => setFrequency(e.target.value)} placeholder="e.g. twice daily" className="input" />
              </Field>

              <p className="flex items-start gap-2 text-xs text-slate-500">
                <History className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                The server records who made the change, when, and the new dose in the activity log.
              </p>
            </form>
          )}
        </div>
      )}
    </Modal>
  );
};

export default ManagePatientMedsModal;
