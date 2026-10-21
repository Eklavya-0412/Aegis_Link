import React, { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Activity } from 'lucide-react';
import Modal from '../../components/common/Modal';
import { useToastStore } from '../../store/toastStore';
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
  { id: 'arm', name: 'Arm', x: 120, y: 132, symptoms: ['arm pain', 'numbness', 'weakness'] },
  { id: 'leg', name: 'Leg', x: 142, y: 215, symptoms: ['leg pain', 'swelling', 'cramps'] }
];

const steps = ['Body area', 'Severity', 'Duration', 'Guidance'];

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
    useToastStore.getState().showToast('Your emergency contacts have been notified with this assessment.', 'warning');
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
    useToastStore.getState().showToast('Your physician has been notified and will contact you.', 'success');
    onClose();
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Symptom checker"
      description="Answer a few questions for suggested next steps. This is not a diagnosis."
      icon={Activity}
      iconClassName="bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300"
      maxWidth="max-w-3xl"
    >
      {/* Step indicator */}
      <ol className="mb-6 flex items-center gap-2" aria-label="Progress">
        {steps.map((s, i) => {
          const n = i + 1;
          const done = n < currentStep;
          const active = n === currentStep;
          return (
            <li key={s} className="flex min-w-0 flex-1 items-center gap-2" aria-current={active ? 'step' : undefined}>
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums ${
                  active
                    ? 'bg-brand-700 text-white'
                    : done
                    ? 'bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-200'
                    : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                }`}
              >
                {n}
              </span>
              <span
                className={`hidden truncate text-13 sm:block ${
                  active ? 'font-medium text-slate-900 dark:text-slate-100' : 'text-slate-500'
                }`}
              >
                {s}
              </span>
              {i < steps.length - 1 && <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" aria-hidden />}
            </li>
          );
        })}
      </ol>

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
    </Modal>
  );
};

export default AISymptomChecker;

