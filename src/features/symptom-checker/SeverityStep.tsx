import React from 'react';
import { motion } from 'framer-motion';

interface SeverityStepProps {
  symptomSeverity: number;
  setSymptomSeverity: (val: number) => void;
  onBack: () => void;
  onNext: () => void;
}

export const SeverityStep: React.FC<SeverityStepProps> = ({
  symptomSeverity,
  setSymptomSeverity,
  onBack,
  onNext
}) => {
  return (
    <motion.div
      key="step2"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.25 }}
    >
      <h4 className="text-xl font-bold mb-6 text-gray-800">Symptom Severity Assessment</h4>
      <div className="mb-6">
        <p className="text-gray-600 mb-4">Rate your symptom intensity (1-10):</p>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">Mild (1)</span>
          <input
            type="range"
            min="1"
            max="10"
            value={symptomSeverity}
            onChange={(e) => setSymptomSeverity(parseInt(e.target.value))}
            className="flex-1 h-2 bg-gradient-to-r from-green-400 via-yellow-400 to-red-400 rounded-lg appearance-none slider"
          />
          <span className="text-sm text-gray-500">Severe (10)</span>
        </div>
        <div className="text-center mt-2">
          <span
            className={`text-2xl font-bold ${
              symptomSeverity <= 3
                ? 'text-green-600'
                : symptomSeverity <= 6
                ? 'text-yellow-600'
                : 'text-red-600'
            }`}
          >
            {symptomSeverity}/10
          </span>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-4 py-3 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
        >
          Back
        </button>
        <motion.button
          onClick={onNext}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold text-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg"
          whileHover={{
            scale: 1.05,
            boxShadow:
              '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}
          whileTap={{ scale: 0.95 }}
        >
          Next: Duration
        </motion.button>
      </div>
    </motion.div>
  );
};

