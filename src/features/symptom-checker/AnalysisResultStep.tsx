import React from 'react';
import { motion } from 'framer-motion';
import { AlertOctagon, AlertTriangle, BellRing, CheckCircle2, ChevronRight, RotateCcw, Sparkles, Stethoscope } from 'lucide-react';
import { SymptomAssessment } from './types';

interface AnalysisResultStepProps {
  assessment: SymptomAssessment;
  onAlertCaregivers: () => void;
  onContactDoctor: () => void;
  onRestart: () => void;
}

const LEVEL = {
  High: { label: 'High urgency', badge: 'badge-danger', callout: 'callout-danger', icon: AlertOctagon },
  Medium: { label: 'Moderate urgency', badge: 'badge-warning', callout: 'callout-warning', icon: AlertTriangle },
  Low: { label: 'Low urgency', badge: 'badge-success', callout: 'callout-neutral', icon: CheckCircle2 }
};

export const AnalysisResultStep: React.FC<AnalysisResultStepProps> = ({ assessment, onAlertCaregivers, onContactDoctor, onRestart }) => {
  const level = LEVEL[assessment.severity] || LEVEL.Low;
  return (
    <motion.div key="step4" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="section-title">Suggested next steps</h3>
        <span className="badge badge-ai">
          <Sparkles aria-hidden />
          Automated guidance · not a diagnosis
        </span>
      </div>

      <div className={`callout ${level.callout} mt-4`}>
        <level.icon aria-hidden />
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`badge ${level.badge}`}>{level.label}</span>
            <span className="text-xs tabular-nums opacity-75">Model confidence {Math.round(assessment.confidence * 100)}%</span>
          </div>
          <p className="mt-2 text-sm font-medium">{assessment.recommendation}</p>
        </div>
      </div>

      {assessment.patterns && (
        <p className="mt-3 flex items-center gap-2 text-13 text-slate-600 dark:text-slate-400">
          <Sparkles className="h-3.5 w-3.5 text-violet-500" aria-hidden />
          {assessment.patterns}
        </p>
      )}

      <div className="mt-5">
        <p className="eyebrow mb-2">Suggested actions</p>
        <ul className="space-y-2">
          {assessment.actions.map((action, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
              <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
              {action}
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-5 text-xs text-slate-500">
        This guidance is generated from your answers by simple rules and has not been reviewed by a clinician. If you feel your
        condition is serious, contact emergency services.
      </p>

      <div className="mt-6 flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 dark:border-slate-800 sm:flex-row sm:justify-between">
        <button type="button" onClick={onRestart} className="btn btn-ghost">
          <RotateCcw />
          Start over
        </button>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button type="button" onClick={onAlertCaregivers} className={`btn ${assessment.severity === 'High' ? 'btn-danger' : 'btn-secondary'}`}>
            <BellRing />
            Alert caregivers
          </button>
          <button type="button" onClick={onContactDoctor} className="btn btn-primary">
            <Stethoscope />
            Contact physician
          </button>
        </div>
      </div>
    </motion.div>
  );
};
