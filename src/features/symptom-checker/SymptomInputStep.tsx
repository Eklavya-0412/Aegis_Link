import React from 'react';
import { motion } from 'framer-motion';
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
    <motion.div
      key="step1"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.25 }}
      className="text-center"
    >
      <h4 className="text-xl font-bold mb-6 text-gray-800">Where are you experiencing symptoms?</h4>
      <div className="relative mx-auto" style={{ width: '300px', height: '350px' }}>
        <svg viewBox="0 0 300 350" className="w-full h-full">
          <circle cx="150" cy="60" r="25" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="2" />
          <rect x="125" y="85" width="50" height="80" rx="10" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="2" />
          <rect x="110" y="100" width="20" height="60" rx="10" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="2" />
          <rect x="170" y="100" width="20" height="60" rx="10" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="2" />
          <rect x="135" y="165" width="15" height="80" rx="7" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="2" />
          <rect x="150" y="165" width="15" height="80" rx="7" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="2" />

          {bodyParts.map((part) => (
            <g key={part.id} onClick={() => setSelectedBodyPart(part.id)} className="cursor-pointer">
              <circle cx={part.x} cy={part.y} r="18" fill="transparent" />
              <circle
                cx={part.x}
                cy={part.y}
                r="8"
                fill={selectedBodyPart === part.id ? '#8b5cf6' : 'rgba(139,92,246,0.7)'}
                className="transition-all duration-300"
              />
              <circle
                cx={part.x}
                cy={part.y}
                r="14"
                className="animate-ping"
                fill={selectedBodyPart === part.id ? 'rgba(139,92,246,0.3)' : 'rgba(139,92,246,0.15)'}
              />
            </g>
          ))}
        </svg>
      </div>

      {selectedBodyPart && currentPart && (
        <div className="mt-6 p-6 bg-purple-50 rounded-2xl border border-purple-200">
          <h5 className="font-bold text-purple-800 mb-4">{currentPart.name} Symptoms</h5>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {currentPart.symptoms.map((symptom) => (
              <button
                key={symptom}
                type="button"
                onClick={() => {
                  setSymptoms([...symptoms, symptom]);
                  onNext();
                }}
                className="p-3 bg-white rounded-xl border border-purple-200 hover:bg-purple-100 transition-all duration-300 text-purple-800 font-medium shadow-sm hover:shadow"
              >
                {symptom}
              </button>
            ))}
          </div>
          {symptoms.length > 0 && (
            <div className="text-left mt-4">
              <span className="text-xs uppercase text-purple-700 font-semibold">Selected</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {symptoms.map((s) => (
                  <span
                    key={s}
                    className="px-2 py-1 bg-white border border-purple-200 rounded-full text-xs text-purple-700"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button disabled className="px-4 py-2 rounded-lg bg-gray-100 text-gray-400 cursor-not-allowed">
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!selectedBodyPart}
          className={`ml-3 px-4 py-2 rounded-lg ${
            selectedBodyPart
              ? 'bg-purple-600 text-white hover:bg-purple-700'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          Next
        </button>
      </div>
    </motion.div>
  );
};

