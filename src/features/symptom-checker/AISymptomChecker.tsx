import React, { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity, XCircle } from 'lucide-react';
import { BodyPart, SymptomAssessment, SymptomHistoryEntry } from './types';
import { SymptomInputStep } from './SymptomInputStep';
import { SeverityStep } from './SeverityStep';
import { DurationStep } from './DurationStep';
import { AnalysisResultStep } from './AnalysisResultStep';

interface AISymptomCheckerProps {
  onClose: () => void;
}

const bodyParts: BodyPart[] = [
  { id: 'head', name: 'Head', x: 150, y: 60, symptoms: ['headache', 'dizziness', 'nausea'] },
  {
    id: 'chest',
    name: 'Chest',
    x: 150,
    y: 140,
    symptoms: ['chest pain', 'shortness of breath', 'heart palpitations']
  },
  {
    id: 'stomach',
    name: 'Stomach',
    x: 150,
    y: 180,
    symptoms: ['stomach pain', 'indigestion', 'bloating']
  },
  { id: 'arm', name: 'Arm', x: 100, y: 150, symptoms: ['arm pain', 'numbness', 'weakness'] },
  { id: 'leg', name: 'Leg', x: 130, y: 250, symptoms: ['leg pain', 'swelling', 'cramps'] }
];

const steps = ['Body Area', 'Severity', 'Duration', 'Assessment'];

export const AISymptomChecker: React.FC<AISymptomCheckerProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [selectedBodyPart, setSelectedBodyPart] = useState<string>('');
  const [symptomSeverity, setSymptomSeverity] = useState(5);
  const [symptomHistory, setSymptomHistory] = useState<SymptomHistoryEntry[]>([]);
  const [duration, setDuration] = useState<string>('');
  const [additionalNotes, setAdditionalNotes] = useState<string>('');

  const getAIRecommendation = useCallback(
    (symList: string[], severity: number, dur: string): SymptomAssessment => {
      const hasChestPain = symList.some((s) => s.includes('chest pain') || s.includes('heart'));
      const hasHeadache = symList.some((s) => s.includes('headache') || s.includes('dizziness'));
      const isHighSeverity = severity >= 8;
      const isLongDuration = dur.includes('days') || dur.includes('week');

      const recentSimilar = symptomHistory.filter(
        (h) =>
          h.date > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() &&
          h.symptoms.some((s) => symList.includes(s))
      );

      if (hasChestPain || (isHighSeverity && isLongDuration)) {
        return {
          severity: 'High',
          recommendation:
            'Seek immediate medical attention. Your symptoms may indicate a serious condition.',
          actions: ['Call emergency services', 'Contact your cardiologist', 'Monitor vital signs'],
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          confidence: 0.92,
          patterns:
            recentSimilar.length > 0
              ? `Similar symptoms reported ${recentSimilar.length} times recently`
              : null
        };
      } else if (hasHeadache || (severity >= 6 && isLongDuration)) {
        return {
          severity: 'Medium',
          recommendation:
            'Monitor symptoms closely and consider contacting your healthcare provider.',
          actions: [
            'Rest in a quiet, dark room',
            'Stay hydrated',
            'Track symptom patterns',
            'Consider OTC pain relief'
          ],
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          confidence: 0.78,
          patterns: recentSimilar.length > 0 ? 'Recurring pattern detected' : null
        };
      } else {
        return {
          severity: 'Low',
          recommendation:
            'Continue monitoring. Consider home care remedies and lifestyle adjustments.',
          actions: [
            'Rest and hydration',
            'Over-the-counter relief if needed',
            'Monitor for changes',
            'Maintain regular sleep schedule'
          ],
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          confidence: 0.65,
          patterns: recentSimilar.length > 0 ? 'Mild recurring symptoms' : null
        };
      }
    },
    [symptomHistory]
  );

  const handleRestart = () => {
    setCurrentStep(1);
    setSymptoms([]);
    setSelectedBodyPart('');
    setSymptomSeverity(5);
    setDuration('');
    setAdditionalNotes('');
  };

  const handleAlertCaregivers = () => {
    const assessment = getAIRecommendation(symptoms, symptomSeverity, duration);
    const newEntry: SymptomHistoryEntry = {
      symptoms,
      severity: symptomSeverity,
      date: new Date().toISOString(),
      assessment
    };
    setSymptomHistory((prev) => [newEntry, ...prev].slice(0, 10));
    alert('Emergency contacts have been notified with your symptom assessment.');
    onClose();
  };

  const handleContactDoctor = () => {
    const assessment = getAIRecommendation(symptoms, symptomSeverity, duration);
    const newEntry: SymptomHistoryEntry = {
      symptoms,
      severity: symptomSeverity,
      date: new Date().toISOString(),
      assessment
    };
    setSymptomHistory((prev) => [newEntry, ...prev].slice(0, 10));
    alert('Your doctor has been notified and will contact you shortly.');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.35 }}
        className="relative max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
      >
        <div className="absolute -inset-[1px] rounded-[28px] bg-gradient-to-br from-purple-400 via-pink-300 to-fuchsia-400 opacity-60 blur animate-pulse" />
        <div className="relative bg-white/95 backdrop-blur-xl rounded-[28px] shadow-2xl">
          <div className="p-4 sm:p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center animate-pulse">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    AI Symptom Checker
                  </h3>
                  <p className="text-gray-600">Intelligent health assessment with pattern recognition</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                <XCircle className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            {/* Step indicator */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm text-gray-600">
                {steps.map((s, i) => (
                  <div key={s} className="flex-1 flex items-center">
                    <div
                      className={`h-8 px-3 rounded-full mr-2 flex items-center justify-center font-semibold ${
                        i + 1 <= currentStep
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {i + 1}
                    </div>
                    <span className={i + 1 <= currentStep ? 'text-purple-700' : ''}>{s}</span>
                    {i < steps.length - 1 && (
                      <div className="flex-1 h-1 mx-3 bg-gradient-to-r from-gray-200 to-purple-200 rounded-full" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <SymptomInputStep
                  bodyParts={bodyParts}
                  selectedBodyPart={selectedBodyPart}
                  setSelectedBodyPart={setSelectedBodyPart}
                  symptoms={symptoms}
                  setSymptoms={setSymptoms}
                  onNext={() => setCurrentStep(2)}
                />
              )}

              {currentStep === 2 && (
                <SeverityStep
                  symptomSeverity={symptomSeverity}
                  setSymptomSeverity={setSymptomSeverity}
                  onBack={() => setCurrentStep(1)}
                  onNext={() => setCurrentStep(3)}
                />
              )}

              {currentStep === 3 && (
                <DurationStep
                  duration={duration}
                  setDuration={setDuration}
                  additionalNotes={additionalNotes}
                  setAdditionalNotes={setAdditionalNotes}
                  onBack={() => setCurrentStep(2)}
                  onNext={() => setCurrentStep(4)}
                />
              )}

              {currentStep === 4 && (
                <AnalysisResultStep
                  assessment={getAIRecommendation(symptoms, symptomSeverity, duration)}
                  onAlertCaregivers={handleAlertCaregivers}
                  onContactDoctor={handleContactDoctor}
                  onRestart={handleRestart}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AISymptomChecker;

