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

const durationOptions = [
  'Less than 1 hour',
  '1-6 hours',
  '6-24 hours',
  '1-3 days',
  '3-7 days',
  '1-2 weeks',
  '2+ weeks'
];

export const DurationStep: React.FC<DurationStepProps> = ({
  duration,
  setDuration,
  additionalNotes,
  setAdditionalNotes,
  onBack,
  onNext
}) => {
  return (
    <motion.div
      key="step3"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.25 }}
    >
      <h4 className="text-xl font-bold mb-6 text-gray-800">Symptom Duration & Details</h4>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          How long have you been experiencing these symptoms?
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {durationOptions.map((dur) => (
            <motion.button
              key={dur}
              type="button"
              onClick={() => setDuration(dur)}
              className={`p-3 rounded-xl border-2 transition-all duration-300 ${
                duration === dur
                  ? 'bg-purple-500 text-white border-purple-500 shadow-lg'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-purple-300'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {dur}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Additional notes (optional)
        </label>
        <textarea
          value={additionalNotes}
          onChange={(e) => setAdditionalNotes(e.target.value)}
          placeholder="Describe any triggers, patterns, or additional symptoms..."
          className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
          rows={3}
        />
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
          disabled={!duration}
          className={`px-6 py-3 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg ${
            duration
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
          whileHover={
            duration
              ? {
                  scale: 1.05,
                  boxShadow:
                    '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                }
              : {}
          }
          whileTap={duration ? { scale: 0.95 } : {}}
        >
          Get AI Assessment
        </motion.button>
      </div>
    </motion.div>
  );
};

