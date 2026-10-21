import React from 'react';
import { motion } from 'framer-motion';

interface SeverityStepProps {
  symptomSeverity: number;
  setSymptomSeverity: (val: number) => void;
  onBack: () => void;
  onNext: () => void;
}

const describe = (n: number) => (n <= 3 ? 'Mild' : n <= 6 ? 'Moderate' : 'Severe');

export const SeverityStep: React.FC<SeverityStepProps> = ({ symptomSeverity, setSymptomSeverity, onBack, onNext }) => {
  const tone = symptomSeverity <= 3 ? 'badge-success' : symptomSeverity <= 6 ? 'badge-warning' : 'badge-danger';
  return (
    <motion.div key="step2" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
      <h3 className="section-title">How intense are your symptoms?</h3>
      <p className="mt-0.5 text-13 text-slate-500">1 is barely noticeable, 10 is the worst you can imagine.</p>

      <div className="mt-8 flex items-baseline justify-center gap-3">
        <span className="text-4xl font-semibold tabular-nums text-slate-900 dark:text-slate-50">{symptomSeverity}</span>
        <span className="text-sm text-slate-500">/ 10</span>
        <span className={`badge ${tone}`}>{describe(symptomSeverity)}</span>
      </div>

      <div className="mx-auto mt-6 max-w-md">
        <input
          type="range"
          min="1"
          max="10"
          value={symptomSeverity}
          onChange={(e) => setSymptomSeverity(parseInt(e.target.value))}
          className="w-full"
          aria-label="Symptom severity from 1 to 10"
          aria-valuetext={`${symptomSeverity} out of 10, ${describe(symptomSeverity)}`}
        />
        <div className="mt-1 flex justify-between text-xs text-slate-500">
          <span>Mild</span>
          <span>Moderate</span>
          <span>Severe</span>
        </div>
      </div>

      <div className="mt-8 flex justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
        <button type="button" onClick={onBack} className="btn btn-secondary">
          Back
        </button>
        <button type="button" onClick={onNext} className="btn btn-primary">
          Continue
        </button>
      </div>
    </motion.div>
  );
};
