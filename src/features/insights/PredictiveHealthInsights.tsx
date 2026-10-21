import React from 'react';
import { BarChart3, Clock, HeartPulse, Info, Pill, Sparkles, TrendingUp } from 'lucide-react';
import Modal from '../../components/common/Modal';

interface PredictiveHealthInsightsProps {
  onClose: () => void;
}

const PRIORITY = {
  High: 'badge-danger',
  Medium: 'badge-warning',
  Low: 'badge-neutral'
} as const;

const PredictiveHealthInsights: React.FC<PredictiveHealthInsightsProps> = ({ onClose }) => {
  const insights = [
    {
      title: 'Blood pressure trend',
      prediction: 'Your BP readings show a 15% increase trend over the past week',
      recommendation: 'Consider reducing sodium intake and increasing cardio exercise',
      confidence: 92,
      priority: 'Medium' as const,
      icon: HeartPulse
    },
    {
      title: 'Medication adherence risk',
      prediction: 'AI predicts 23% chance of missing evening medications this week',
      recommendation: 'Set additional reminders for 6 PM medications',
      confidence: 87,
      priority: 'High' as const,
      icon: Pill
    },
    {
      title: 'Sleep quality',
      prediction: 'Your sleep patterns indicate potential for 18% better rest quality',
      recommendation: 'Try going to bed 30 minutes earlier based on your activity data',
      confidence: 76,
      priority: 'Low' as const,
      icon: Clock
    },
    {
      title: 'Health score projection',
      prediction: 'Continuing current habits will improve your health score to 91 by next month',
      recommendation: "You're on track! Keep up your current routine",
      confidence: 94,
      priority: 'Low' as const,
      icon: TrendingUp
    }
  ];

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Predictive insights"
      description="Projections of how health trends may develop."
      icon={BarChart3}
      iconClassName="bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300"
      maxWidth="max-w-3xl"
    >
      <div className="callout callout-warning mb-5">
        <Info aria-hidden />
        <p>
          <span className="font-medium">Preview content.</span> These projections are illustrative examples and are not yet
          calculated from your own readings. Do not use them to make care decisions.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {insights.map((insight) => (
          <article key={insight.title} className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="icon-tile h-8 w-8 bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300">
                  <insight.icon aria-hidden />
                </span>
                <h3 className="text-13 font-semibold text-slate-900 dark:text-slate-100">{insight.title}</h3>
              </div>
              <span className={`badge ${PRIORITY[insight.priority]}`}>{insight.priority} priority</span>
            </div>
            <p className="mt-3 text-13 leading-5 text-slate-700 dark:text-slate-300">{insight.prediction}</p>
            <div className="surface-muted mt-3 px-3 py-2">
              <p className="eyebrow">Suggestion</p>
              <p className="mt-0.5 text-13 text-slate-800 dark:text-slate-200">{insight.recommendation}</p>
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-xs tabular-nums text-slate-500">
              <Sparkles className="h-3 w-3 text-violet-500" aria-hidden />
              AI-generated · confidence {insight.confidence}%
            </p>
          </article>
        ))}
      </div>
    </Modal>
  );
};

export default PredictiveHealthInsights;
