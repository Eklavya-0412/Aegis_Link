import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Sparkles } from 'lucide-react';
import { SymptomAssessment } from './types';

interface AnalysisResultStepProps {
  assessment: SymptomAssessment;
  onAlertCaregivers: () => void;
  onContactDoctor: () => void;
  onRestart: () => void;
}

export const AnalysisResultStep: React.FC<AnalysisResultStepProps> = ({
  assessment,
  onAlertCaregivers,
  onContactDoctor,
  onRestart
}) => {
  return (
    <motion.div
      key="step4"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.25 }}
    >
      <h4 className="text-xl font-bold mb-6 text-gray-800">AI Health Assessment</h4>
      <div className="relative p-[1px] rounded-2xl overflow-hidden">
        <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-purple-400 via-pink-300 to-fuchsia-400 opacity-60 blur" />
        <div className={`relative p-6 rounded-2xl border ${assessment.bgColor}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`h-3 w-3 rounded-full ${assessment.color.replace('text-', 'bg-')}`} />
              <span className="font-bold">Severity: {assessment.severity}</span>
            </div>
            <div className="text-right">
              <span className="text-sm text-gray-600">Confidence</span>
              <div className="text-lg font-bold text-purple-600">
                {Math.round(assessment.confidence * 100)}%
              </div>
            </div>
          </div>

          {assessment.patterns && (
            <div className="mb-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Pattern Recognition</span>
              </div>
              <p className="text-sm text-blue-700 mt-1">{assessment.patterns}</p>
            </div>
          )}

          <div className="mb-6">
            <h5 className="font-bold mb-2">AI Recommendation:</h5>
            <p className="text-gray-700">{assessment.recommendation}</p>
          </div>

          <div className="mb-6">
            <h5 className="font-bold mb-2">Suggested Actions:</h5>
            <ul className="space-y-2">
              {assessment.actions.map((action, idx) => (
                <li key={idx} className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={onAlertCaregivers}
              className="flex-1 bg-red-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-red-600 transition-colors"
            >
              Alert Caregivers
            </button>
            <button
              onClick={onContactDoctor}
              className="flex-1 bg-blue-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-600 transition-colors"
            >
              Contact Doctor
            </button>
            <button
              onClick={onRestart}
              className="px-4 py-3 bg-gray-100 rounded-xl text-gray-700 hover:bg-gray-200"
            >
              Restart
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

