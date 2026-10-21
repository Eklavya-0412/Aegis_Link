import React from 'react';
import { ArrowDown, ArrowUp, CheckCircle2, FlaskConical, Minus, Sparkles, TestTube } from 'lucide-react';
import { User } from '../../../types';
import { LabPanelItem, LabResult } from '../types';
import Modal from '../../../components/common/Modal';
import { EmptyState } from '../../../components/ui';
import { formatDateTime } from '../../../utils/format';

interface LabResultsModalProps {
  patients: User[];
  selectedPatient: User | null;
  onSelectPatient: (patient: User | null) => void;
  labResults: LabResult[];
  onClose: () => void;
}

const FLAG: Record<LabPanelItem['status'], { label: string; badge: string; icon: typeof ArrowUp }> = {
  normal: { label: 'Normal', badge: 'badge-success', icon: CheckCircle2 },
  high: { label: 'High', badge: 'badge-danger', icon: ArrowUp },
  low: { label: 'Low', badge: 'badge-info', icon: ArrowDown },
  borderline: { label: 'Borderline', badge: 'badge-warning', icon: Minus }
};

const ANALYTE_LABELS: Record<string, string> = {
  wbc: 'WBC',
  rbc: 'RBC',
  hgb: 'Hemoglobin',
  hct: 'Hematocrit',
  platelets: 'Platelets',
  glucose: 'Glucose',
  creatinine: 'Creatinine',
  bun: 'BUN',
  sodium: 'Sodium',
  potassium: 'Potassium',
  total_cholesterol: 'Total cholesterol',
  ldl: 'LDL',
  hdl: 'HDL',
  triglycerides: 'Triglycerides'
};

const Panel: React.FC<{ title: string; panel?: Record<string, LabPanelItem> }> = ({ title, panel }) => {
  if (!panel) return null;
  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
      <h4 className="border-b border-slate-200 bg-slate-50 px-4 py-2.5 text-13 font-semibold text-slate-800 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-200">
        {title}
      </h4>
      <table className="data-table">
        <thead className="sr-only">
          <tr>
            <th>Test</th>
            <th>Result</th>
            <th>Reference</th>
            <th>Flag</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(panel).map(([key, val]) => {
            const flag = FLAG[val.status] || FLAG.normal;
            return (
              <tr key={key}>
                <td className="font-medium text-slate-800 dark:text-slate-200">{ANALYTE_LABELS[key] || key.replace(/_/g, ' ')}</td>
                <td className="whitespace-nowrap text-right tabular-nums">
                  <span className={`font-semibold ${val.status === 'normal' ? 'text-slate-900 dark:text-slate-100' : 'text-red-700 dark:text-red-400'}`}>
                    {val.value}
                  </span>{' '}
                  <span className="text-xs text-slate-500">{val.unit}</span>
                </td>
                <td className="whitespace-nowrap text-xs tabular-nums text-slate-500">Ref. {val.normal}</td>
                <td className="w-28 text-right">
                  <span className={`badge ${flag.badge}`}>
                    <flag.icon aria-hidden />
                    {flag.label}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
};

export const LabResultsModal: React.FC<LabResultsModalProps> = ({ patients, selectedPatient, onSelectPatient, labResults, onClose }) => {
  const patientResults = selectedPatient
    ? labResults.filter((r) => r.patient_id === selectedPatient.user_id || r.patient_name === selectedPatient.name)
    : [];

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Lab results"
      description="Laboratory reports on file for the selected patient."
      icon={FlaskConical}
      maxWidth="max-w-4xl"
      flush
    >
      <div className="flex flex-col gap-2 border-b border-slate-100 bg-slate-50/60 px-5 py-3 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center">
        <label htmlFor="lab-patient" className="text-13 font-medium text-slate-600 dark:text-slate-300">
          Patient
        </label>
        <select
          id="lab-patient"
          className="select input-sm sm:w-64"
          value={selectedPatient?.user_id || ''}
          onChange={(e) => onSelectPatient(patients.find((m) => m.user_id === e.target.value) || null)}
        >
          <option value="">Choose a patient</option>
          {patients.map((m) => (
            <option key={m.user_id} value={m.user_id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-6 px-5 py-5">
        {!selectedPatient ? (
          <EmptyState icon={TestTube} title="Select a patient" description="Choose a patient above to view their lab results." />
        ) : patientResults.length === 0 ? (
          <EmptyState icon={TestTube} title="No lab results on file" description={`No laboratory reports were found for ${selectedPatient.name}.`} />
        ) : (
          patientResults.map((result) => (
            <div key={result.id} className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{result.patient_name}</p>
                  <p className="text-xs tabular-nums text-slate-500">
                    Collected {formatDateTime(result.test_date)} · Ordered by {result.ordered_by}
                  </p>
                </div>
                {result.sample ? (
                  <span className="badge badge-warning" title="Built-in demonstration data, not a real lab report">Sample data</span>
                ) : (
                  <span className="badge badge-neutral">Measured · lab report</span>
                )}
              </div>

              <Panel title="Complete blood count (CBC)" panel={result.results.cbc} />
              <Panel title="Comprehensive metabolic panel (CMP)" panel={result.results.metabolic} />
              <Panel title="Lipid panel" panel={result.results.lipid} />

              <div className="callout callout-ai">
                <Sparkles aria-hidden />
                <div className="space-y-1.5">
                  <p className="flex flex-wrap items-center gap-2 font-medium">
                    Automated summary
                    <span className="badge badge-ai">Requires clinician review</span>
                  </p>
                  <p>
                    Most values within reference ranges.
                    {result.results.metabolic?.glucose?.status === 'high' && ' Glucose is above range — consider dietary counselling and follow-up in 3 months.'}
                    {result.results.lipid?.ldl?.status === 'borderline' && ' LDL cholesterol is borderline — lifestyle modification may be appropriate.'}
                  </p>
                  <p>Suggested: continue current medications, maintain a healthy diet and regular exercise.</p>
                  <p className="text-xs opacity-80">Generated from flagged values. It is not a clinical assessment until confirmed by the treating physician.</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
};

export default LabResultsModal;
