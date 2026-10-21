import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { BodyPart } from './types';

interface SymptomInputStepProps {
  bodyParts: BodyPart[];
  selectedBodyPart: string;
  setSelectedBodyPart: (id: string) => void;
  symptoms: string[];
  setSymptoms: (symptoms: string[]) => void;
  onNext: () => void;
}

export const SymptomInputStep: React.FC<SymptomInputStepProps> = ({
  bodyParts,
  selectedBodyPart,
  setSelectedBodyPart,
  symptoms,
  setSymptoms,
  onNext
}) => {
  const currentPart = bodyParts.find((p) => p.id === selectedBodyPart);

  return (
    <motion.div key="step1" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
      <h3 className="section-title">Where are you experiencing symptoms?</h3>
      <p className="mt-0.5 text-13 text-slate-500">Choose an area on the figure or from the list.</p>

      <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-[200px_minmax(0,1fr)]">
        <div className="mx-auto w-[180px]">
          <svg viewBox="70 20 160 260" className="h-auto w-full" role="img" aria-label="Body map">
            <g className="fill-slate-100 stroke-slate-300 dark:fill-slate-800 dark:stroke-slate-600" strokeWidth="1.5">
              <circle cx="150" cy="60" r="25" />
              <rect x="125" y="85" width="50" height="80" rx="10" />
              <rect x="110" y="100" width="20" height="60" rx="10" />
              <rect x="170" y="100" width="20" height="60" rx="10" />
              <rect x="135" y="165" width="15" height="80" rx="7" />
              <rect x="150" y="165" width="15" height="80" rx="7" />
            </g>
            {bodyParts.map((part) => {
              const active = selectedBodyPart === part.id;
              return (
                <g key={part.id} onClick={() => setSelectedBodyPart(part.id)} className="cursor-pointer">
                  <title>{part.name}</title>
                  <circle cx={part.x} cy={part.y} r="16" fill="transparent" />
                  <circle cx={part.x} cy={part.y} r={active ? 11 : 9} fill={active ? 'rgba(95,132,179,0.22)' : 'rgba(95,132,179,0.12)'} />
                  <circle cx={part.x} cy={part.y} r="5" fill={active ? '#405C85' : '#7A9CC6'} />
                </g>
              );
            })}
          </svg>
        </div>

        <div>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Body area">
            {bodyParts.map((part) => (
              <button
                key={part.id}
                type="button"
                role="radio"
                aria-checked={selectedBodyPart === part.id}
                onClick={() => setSelectedBodyPart(part.id)}
                className={`h-8 rounded-md border px-3 text-13 font-medium transition-colors ${
                  selectedBodyPart === part.id
                    ? 'border-brand-500 bg-brand-50 text-brand-800 dark:bg-brand-950/50 dark:text-brand-200'
                    : 'border-slate-200 text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:text-slate-300'
                }`}
              >
                {part.name}
              </button>
            ))}
          </div>

          {currentPart ? (
            <div className="mt-5">
              <p className="label">{currentPart.name}: select a symptom</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {currentPart.symptoms.map((symptom) => (
                  <button
                    key={symptom}
                    type="button"
                    onClick={() => {
                      setSymptoms([...symptoms, symptom]);
                      onNext();
                    }}
                    className="h-10 rounded-lg border border-slate-200 px-3 text-left text-13 capitalize text-slate-800 transition-colors hover:border-brand-400 hover:bg-brand-50/50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-brand-950/30"
                  >
                    {symptom}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <p className="mt-5 text-13 text-slate-500">Select a body area to see related symptoms.</p>
          )}

          {symptoms.length > 0 && (
            <div className="mt-5">
              <p className="eyebrow mb-2">Selected</p>
              <div className="flex flex-wrap gap-1.5">
                {symptoms.map((s) => (
                  <span key={s} className="badge badge-brand capitalize">
                    {s}
                    <button
                      type="button"
                      onClick={() => setSymptoms(symptoms.filter((x) => x !== s))}
                      aria-label={`Remove ${s}`}
                      className="-mr-1 rounded p-0.5 hover:bg-brand-100 dark:hover:bg-brand-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-end border-t border-slate-100 pt-4 dark:border-slate-800">
        <button type="button" onClick={onNext} disabled={!selectedBodyPart} className="btn btn-primary">
          Continue
        </button>
      </div>
    </motion.div>
  );
};
