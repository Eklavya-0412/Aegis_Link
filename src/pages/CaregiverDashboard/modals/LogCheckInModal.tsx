import React, { useState } from 'react';
import { AlertCircle, ClipboardList, Loader2 } from 'lucide-react';
import { Medication } from '../../../types';
import { createCaregiverCheckin } from '../../../services/clinicalService';
import Modal from '../../../components/common/Modal';
import { Field } from '../../../components/ui';

interface LogCheckInModalProps {
  patients: { id: string; name: string }[];
  selectedPatientId?: string;
  medications: Medication[];
  onClose: () => void;
  onCheckinSuccess: (checkin: any) => void;
}

const VISIT_TYPES = [
  { value: 'routine_check', label: 'Routine check-in' },
  { value: 'medication_administration', label: 'Medication administration' },
  { value: 'vital_monitoring', label: 'Vital signs monitoring' },
  { value: 'emergency_response', label: 'Emergency response' }
];

export const LogCheckInModal: React.FC<LogCheckInModalProps> = ({ patients, selectedPatientId, medications, onClose, onCheckinSuccess }) => {
  const [patientId, setPatientId] = useState(selectedPatientId || patients[0]?.id || '');
  const [visitType, setVisitType] = useState('routine_check');
  const [notes, setNotes] = useState('');
  const [bp, setBp] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [bloodSugar, setBloodSugar] = useState('');
  const [selectedMeds, setSelectedMeds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const patientMeds = medications.filter((m) => m.member_id === patientId);

  const toggleMed = (medName: string) => {
    setSelectedMeds((prev) => (prev.includes(medName) ? prev.filter((m) => m !== medName) : [...prev, medName]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) {
      setError('Please provide visit notes.');
      return;
    }
    setSubmitting(true);
    setError('');

    try {
      const vitalsRecorded: Record<string, any> = {};
      if (bp.trim()) vitalsRecorded.bp = bp.trim();
      if (heartRate.trim()) vitalsRecorded.heart_rate = heartRate.trim();
      if (bloodSugar.trim()) vitalsRecorded.glucose = bloodSugar.trim();

      const newCheckin = await createCaregiverCheckin({
        patient_id: patientId,
        visit_type: visitType,
        notes: notes.trim(),
        vitals_recorded: vitalsRecorded,
        medications_administered: selectedMeds
      });

      onCheckinSuccess(newCheckin);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to submit check-in log');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Log a visit"
      description="Document observations, vitals and medications given during this visit."
      icon={ClipboardList}
      maxWidth="max-w-xl"
      footer={
        <>
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" form="checkin-form" disabled={submitting || !notes.trim() || !patientId} className="btn btn-primary">
            {submitting && <Loader2 className="animate-spin" />}
            {submitting ? 'Saving…' : 'Save visit'}
          </button>
        </>
      }
    >
      <form id="checkin-form" onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="callout callout-danger" role="alert">
            <AlertCircle aria-hidden />
            <p>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Patient" htmlFor="ci-patient">
            <select id="ci-patient" value={patientId} onChange={(e) => setPatientId(e.target.value)} className="select" disabled={patients.length === 0}>
              {patients.length === 0 && <option value="">No assigned patients</option>}
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Visit type" htmlFor="ci-type">
            <select id="ci-type" value={visitType} onChange={(e) => setVisitType(e.target.value)} className="select">
              {VISIT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <fieldset>
          <legend className="label">
            Observed vitals <span className="font-normal text-slate-400">(optional)</span>
          </legend>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label htmlFor="ci-bp" className="mb-1 block text-xs text-slate-500">
                Blood pressure
              </label>
              <input id="ci-bp" placeholder="120/80" value={bp} onChange={(e) => setBp(e.target.value)} className="input tabular-nums" />
            </div>
            <div>
              <label htmlFor="ci-hr" className="mb-1 block text-xs text-slate-500">
                Heart rate (bpm)
              </label>
              <input id="ci-hr" inputMode="numeric" placeholder="72" value={heartRate} onChange={(e) => setHeartRate(e.target.value)} className="input tabular-nums" />
            </div>
            <div>
              <label htmlFor="ci-glu" className="mb-1 block text-xs text-slate-500">
                Glucose (mg/dL)
              </label>
              <input id="ci-glu" inputMode="numeric" placeholder="95" value={bloodSugar} onChange={(e) => setBloodSugar(e.target.value)} className="input tabular-nums" />
            </div>
          </div>
        </fieldset>

        {patientMeds.length > 0 && (
          <fieldset>
            <legend className="label">Medications given</legend>
            <div className="flex flex-wrap gap-2">
              {patientMeds.map((med) => {
                const isChecked = selectedMeds.includes(med.name);
                return (
                  <label
                    key={med.id}
                    className={`inline-flex h-8 cursor-pointer items-center gap-2 rounded-md border px-2.5 text-13 transition-colors ${
                      isChecked
                        ? 'border-brand-500 bg-brand-50 text-brand-800 dark:bg-brand-950/50 dark:text-brand-200'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
                    }`}
                  >
                    <input type="checkbox" className="h-3.5 w-3.5" checked={isChecked} onChange={() => toggleMed(med.name)} />
                    {med.name} <span className="tabular-nums text-slate-500">{med.dosage}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        )}

        <Field label="Observations & notes" htmlFor="ci-notes" required helper="Appearance, comfort, intake, mobility, and anything the care team should know.">
          <textarea
            id="ci-notes"
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Alert and comfortable. Ate full breakfast. Mild ankle swelling noted."
            className="textarea"
            required
          />
        </Field>
      </form>
    </Modal>
  );
};

export default LogCheckInModal;
