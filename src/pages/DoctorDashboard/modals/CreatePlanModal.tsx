import React, { useState } from 'react';
import { Apple, FileText, Pill, Stethoscope, XCircle } from 'lucide-react';
import { User } from '../../../types';

interface CreatePlanModalProps {
  patients: User[];
  selectedPatient: User | null;
  onSelectPatient: (patient: User | null) => void;
  onCreatePlan: (patient: User, planData: { title: string; diagnosis: string; plan_details: string; dietary_guidelines: string }) => void;
  onClose: () => void;
}

export const CreatePlanModal: React.FC<CreatePlanModalProps> = ({
  patients,
  selectedPatient,
  onSelectPatient,
  onCreatePlan,
  onClose
}) => {
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/95 dark:bg-gray-900/95 rounded-3xl shadow-2xl max-w-2xl w-full border border-purple-100 dark:border-gray-800 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 p-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Stethoscope className="w-6 h-6" />
            <div>
              <h3 className="font-bold text-lg">Establish Treatment & Diet Plan (UC8)</h3>
              <p className="text-xs text-purple-100">Clinical recommendations, dietary directives, and therapy adjustments</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-xl transition text-white/80 hover:text-white">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Select Patient *
            </label>
            <select
              className="w-full p-2.5 border rounded-xl text-sm bg-gray-50 dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-purple-500"
              value={selectedPatient?.user_id || ''}
              onChange={(e) => {
                const patient = patients.find((m) => m.user_id === e.target.value);
                onSelectPatient(patient || null);
              }}
              required
            >
              <option value="">Select Patient</option>
              {patients.map((member) => (
                <option key={member.user_id} value={member.user_id}>
                  {member.name} ({member.relationship || member.role})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Plan Title
              </label>
              <input
                className="w-full p-2.5 border rounded-xl text-sm bg-gray-50 dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-purple-500"
                placeholder="e.g. Hypertension & Glycemic Optimization"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Diagnosis / Indication
              </label>
              <input
                className="w-full p-2.5 border rounded-xl text-sm bg-gray-50 dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-purple-500"
                placeholder="e.g. Stage 1 Essential Hypertension"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-purple-500" />
              Clinical Treatment Directives & Therapy Adjustments *
            </label>
            <textarea
              className="w-full p-3 border rounded-xl text-sm bg-gray-50 dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-purple-500"
              rows={4}
              placeholder="Detail medical goals, medication titration, required diagnostic intervals, and follow-up timeline..."
              value={planDetails}
              onChange={(e) => setPlanDetails(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
              <Apple className="w-3.5 h-3.5 text-emerald-500" />
              Dietary & Nutritional Recommendations (UC8)
            </label>
            <textarea
              className="w-full p-3 border rounded-xl text-sm bg-gray-50 dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-purple-500"
              rows={3}
              placeholder="Specific dietary guidelines (e.g. DASH protocol, sodium limits, glycemic control, hydration requirements)..."
              value={dietaryGuidelines}
              onChange={(e) => setDietaryGuidelines(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 dark:text-gray-300 hover:bg-gray-100 text-sm font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedPatient || !planDetails.trim()}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold hover:from-purple-700 hover:to-pink-700 transition shadow-md disabled:opacity-50"
            >
              Save Treatment Plan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePlanModal;
