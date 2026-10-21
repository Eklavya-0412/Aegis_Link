import React from 'react';
import { motion } from 'framer-motion';

interface DurationStepProps {
  duration: string;
  setDuration: (val: string) => void;
  additionalNotes: string;
  setAdditionalNotes: (val: string) => void;
  onBack: () => void;
  onNext: () => void;
}

const durationOptions = ['Less than 1 hour', '1-6 hours', '6-24 hours', '1-3 days', '3-7 days', '1-2 weeks', '2+ weeks'];

export const DurationStep: React.FC<DurationStepProps> = ({ duration, setDuration, additionalNotes, setAdditionalNotes, onBack, onNext }) => {
  return (
    <motion.div key="step3" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
      <h3 className="section-title">How long have you had these symptoms?</h3>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4" role="radiogroup" aria-label="Duration">
        {durationOptions.map((dur) => (
          <button
            key={dur}
            type="button"
            role="radio"
            aria-checked={duration === dur}
            onClick={() => setDuration(dur)}
            className={`h-10 rounded-lg border px-3 text-13 font-medium tabular-nums transition-colors ${
              duration === dur
                ? 'border-brand-500 bg-brand-50 text-brand-800 dark:bg-brand-950/50 dark:text-brand-200'
                : 'border-slate-200 text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:text-slate-300'
            }`}
          >
            {dur.replace('-', '–')}
          </button>
        ))}
      </div>

      <div className="mt-6">
        <label htmlFor="symptom-notes" className="label">
          Additional notes <span className="font-normal text-slate-400">(optional)</span>
        </label>
        <textarea
          id="symptom-notes"
          value={additionalNotes}
          onChange={(e) => setAdditionalNotes(e.target.value)}
          placeholder="Triggers, patterns, or other symptoms…"
          className="textarea"
          rows={3}
        />
      </div>

      <div className="mt-6 flex justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
        <button type="button" onClick={onBack} className="btn btn-secondary">
          Back
        </button>
        <button type="button" onClick={onNext} disabled={!duration} className="btn btn-primary">
          See guidance
        </button>
      </div>
    </motion.div>
  );
};
