import React, { useState } from 'react';
import { Check, Edit2, Pill, ShieldCheck, XCircle } from 'lucide-react';
import { Medication, User } from '../../../types';
import { updatePatientMedicationDosage } from '../../../services/clinicalService';
import { useToastStore } from '../../../store/toastStore';

interface ManagePatientMedsModalProps {
  patient: User;
  medications: Medication[];
  onClose: () => void;
  onMedicationUpdated: (updatedMed: Medication) => void;
}

export const ManagePatientMedsModal: React.FC<ManagePatientMedsModalProps> = ({
  patient,
  medications,
  onClose,
  onMedicationUpdated
}) => {
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
      const res = await updatePatientMedicationDosage(patient.user_id, selectedMed.id, {
        dosage: dosage.trim(),
        frequency: frequency.trim(),
      });

      const updatedMed: Medication = {
        ...selectedMed,
        dosage: dosage.trim(),
        frequency: frequency.trim(),
      };

      onMedicationUpdated(updatedMed);
      setSuccessNotice(`Dosage for ${selectedMed.name} updated to "${dosage.trim()}". Cryptographic audit trail entry logged.`);
      showToast(`Updated ${selectedMed.name} to ${dosage.trim()}. Audit logged.`, 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to update medication dosage', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/95 dark:bg-gray-900/95 rounded-3xl shadow-2xl max-w-2xl w-full border border-emerald-100 dark:border-gray-800 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Pill className="w-6 h-6" />
            <div>
              <h3 className="font-bold text-lg">Manage Patient Medications</h3>
              <p className="text-xs text-emerald-100">Caretaker medication oversight & dose adjustments (TC_06)</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-xl transition text-white/80 hover:text-white">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Medication List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Prescriptions for {patient.name}
              </h4>
              <span className="text-xs text-gray-400 font-mono">
                PID: {patient.patient_id || patient.user_id.slice(0, 8)}
              </span>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {patientMeds.map((med) => {
                const isSelected = selectedMed?.id === med.id;
                return (
                  <button
                    key={med.id}
                    onClick={() => handleSelectMed(med)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 shadow-sm'
                        : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-800 dark:text-gray-200 text-sm">
                        {med.name}
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-800 rounded-full">
                        {med.dosage}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{med.frequency}</p>
                  </button>
                );
              })}

              {patientMeds.length === 0 && (
                <p className="text-sm text-gray-400 py-6 text-center">No medications found for this patient.</p>
              )}
            </div>
          </div>

          {/* Edit Form */}
          <div className="bg-gray-50 dark:bg-gray-800/80 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 flex flex-col justify-between">
            {selectedMed ? (
              <form onSubmit={handleUpdateDosage} className="space-y-4">
                <div>
                  <h4 className="font-bold text-gray-800 dark:text-gray-100 text-base">
                    Edit Dosage: {selectedMed.name}
                  </h4>
                  <p className="text-xs text-gray-500">
                    Modifications will be logged to the immutable audit trail.
                  </p>
                </div>

                {successNotice && (
                  <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl text-xs flex items-start gap-2">
                    <Check className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600" />
                    <span>{successNotice}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Dosage *
                  </label>
                  <input
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    placeholder="e.g. 100mg, 500mg, 10ml"
                    className="w-full p-2.5 border rounded-xl text-sm bg-white dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Frequency / Schedule
                  </label>
                  <input
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    placeholder="e.g. once daily, twice daily"
                    className="w-full p-2.5 border rounded-xl text-sm bg-white dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900 text-xs text-blue-800 dark:text-blue-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>Audit trail logs Caregiver ID, timestamp, and new dosage parameters.</span>
                </div>

                <button
                  type="submit"
                  disabled={saving || !dosage.trim()}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-2.5 rounded-xl text-sm font-semibold transition shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  {saving ? 'Updating...' : 'Update Medication Dosage'}
                </button>
              </form>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <Pill className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Select a medication on the left to modify dosage or schedule.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagePatientMedsModal;
