import React, { useState } from 'react';
import { Activity, ClipboardList, Pill, XCircle } from 'lucide-react';
import { Medication, User } from '../../../types';
import { createCaregiverCheckin } from '../../../services/clinicalService';

interface LogCheckInModalProps {
  patients: { id: string; name: string }[];
  selectedPatientId?: string;
  medications: Medication[];
  onClose: () => void;
  onCheckinSuccess: (checkin: any) => void;
}

export const LogCheckInModal: React.FC<LogCheckInModalProps> = ({
  patients,
  selectedPatientId,
  medications,
  onClose,
  onCheckinSuccess
}) => {
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
    setSelectedMeds((prev) =>
      prev.includes(medName) ? prev.filter((m) => m !== medName) : [...prev, medName]
    );
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/95 dark:bg-gray-900/95 rounded-3xl shadow-2xl max-w-xl w-full border border-blue-100 dark:border-gray-800 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ClipboardList className="w-6 h-6" />
            <div>
              <h3 className="font-bold text-lg">Log Caregiver Check-In & Visit Notes</h3>
              <p className="text-xs text-blue-100">Document care activities, vitals, and administered doses (UC11)</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-xl transition text-white/80 hover:text-white">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl text-xs">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Select Patient
              </label>
              <select
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className="w-full p-2.5 border rounded-xl text-sm bg-gray-50 dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Visit Category
              </label>
              <select
                value={visitType}
                onChange={(e) => setVisitType(e.target.value)}
                className="w-full p-2.5 border rounded-xl text-sm bg-gray-50 dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
              >
                <option value="routine_check">Routine Check-In</option>
                <option value="medication_administration">Medication Administration</option>
                <option value="vital_monitoring">Vital Signs Monitoring</option>
                <option value="emergency_response">Emergency Response</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-blue-500" />
              Observed Vitals (Optional)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <input
                placeholder="BP (e.g. 120/80)"
                value={bp}
                onChange={(e) => setBp(e.target.value)}
                className="p-2 border rounded-xl text-xs bg-gray-50 dark:bg-gray-800 dark:border-gray-700"
              />
              <input
                placeholder="HR (bpm, e.g. 72)"
                value={heartRate}
                onChange={(e) => setHeartRate(e.target.value)}
                className="p-2 border rounded-xl text-xs bg-gray-50 dark:bg-gray-800 dark:border-gray-700"
              />
              <input
                placeholder="Glucose (mg/dL)"
                value={bloodSugar}
                onChange={(e) => setBloodSugar(e.target.value)}
                className="p-2 border rounded-xl text-xs bg-gray-50 dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
          </div>

          {patientMeds.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                <Pill className="w-3.5 h-3.5 text-emerald-500" />
                Medications Administered
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                {patientMeds.map((med) => {
                  const isChecked = selectedMeds.includes(med.name);
                  return (
                    <label
                      key={med.id}
                      className={`flex items-center space-x-2 p-2 rounded-lg text-xs cursor-pointer border transition ${
                        isChecked
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950/40'
                          : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleMed(med.name)}
                        className="rounded text-emerald-600"
                      />
                      <span className="truncate">{med.name} ({med.dosage})</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Visit Observations & Clinical Notes *
            </label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record patient appearance, comfort level, dietary intake, mobility, or any behavioral observations..."
              className="w-full p-3 border rounded-xl text-sm bg-gray-50 dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !notes.trim()}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 transition shadow-md disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Submit Check-In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LogCheckInModal;
