import React from 'react';
import { AlertTriangle, ArrowRight, BarChart3, CheckCircle2, HelpCircle, Lightbulb, MessageSquare, Sparkles, Stethoscope } from 'lucide-react';
import { AIInsight, User } from '../../types';
import { Card, EmptyState, PageHeader, StatusBadge } from '../../components/ui';

interface InsightsPanelProps {
  aiInsights?: AIInsight | null;
  selectedMember: User | null;
  onOpenSymptomChecker: () => void;
  onOpenPredictiveInsights: () => void;
  onOpenAssistant: () => void;
}

export const AiProvenance: React.FC<{ className?: string; compact?: boolean }> = ({ className = '', compact }) => (
  <span className={`badge badge-ai ${className}`} title="AI-generated content that has not been reviewed by a clinician">
    <Sparkles aria-hidden />
    {compact ? 'AI · unreviewed' : 'AI-generated · not clinician-reviewed'}
  </span>
);

const RISK_DISPLAY = {
  high: { label: 'Elevated risk', severity: 'danger' as const, icon: AlertTriangle },
  low: { label: 'Low risk', severity: 'success' as const, icon: CheckCircle2 },
  unknown: { label: 'Not enough data', severity: 'neutral' as const, icon: HelpCircle }
};

const TOOLS = [
  { key: 'symptom', title: 'Symptom checker', text: 'Guided triage questions with a suggested next step.', icon: Stethoscope },
  { key: 'predictive', title: 'Predictive insights', text: 'Example projections of how trends may develop.', icon: BarChart3 },
  { key: 'assistant', title: 'Ask the assistant', text: 'Questions about medications, appointments and the app.', icon: MessageSquare }
] as const;

const InsightsPanel: React.FC<InsightsPanelProps> = ({
  aiInsights,
  selectedMember,
  onOpenSymptomChecker,
  onOpenPredictiveInsights,
  onOpenAssistant
}) => {
  const risk = RISK_DISPLAY[aiInsights?.risk_level || 'unknown'];
  const handlers = { symptom: onOpenSymptomChecker, predictive: onOpenPredictiveInsights, assistant: onOpenAssistant };

  return (
    <div className="page">
      <PageHeader
        eyebrow="Assistant"
        title="AI insights"
        description={`Automated observations for ${selectedMember?.name || 'this member'}, based on the readings recorded in Aegis Link.`}
      />

      <div className="callout callout-ai">
        <Sparkles aria-hidden />
        <p>
          These insights are generated automatically and have not been reviewed by a clinician. They are not a diagnosis.
          Discuss any concerns with your physician before changing treatment.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card title="Current assessment" actions={<AiProvenance />} className="xl:col-span-2">
          {!aiInsights ? (
            <EmptyState compact icon={Sparkles} title="No insights yet" description="Insights appear once enough readings have been recorded." />
          ) : (
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="stat-label">Risk level</p>
                  <div className="mt-1.5">
                    <StatusBadge severity={risk.severity} icon={risk.icon}>
                      {risk.label}
                    </StatusBadge>
                  </div>
                </div>
                <div>
                  <p className="stat-label">Model confidence</p>
                  <p className="mt-1 text-lg font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                    {Math.round(aiInsights.confidence * 100)}%
                  </p>
                </div>
                <div>
                  <p className="stat-label">Basis</p>
                  <p className="mt-1 text-13 text-slate-700 dark:text-slate-300">Recorded vital signs</p>
                </div>
              </div>

              <div className="surface-muted px-4 py-3">
                <p className="eyebrow mb-1">Predicted trend</p>
                <p className="text-sm text-slate-800 dark:text-slate-200">{aiInsights.predicted_trends}</p>
              </div>

              <div>
                <p className="eyebrow mb-2">Suggestions to discuss with your care team</p>
                <ul className="space-y-2">
                  {aiInsights.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                      <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-violet-500" aria-hidden />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </Card>

        <Card title="Assistant tools" flush>
          <ul className="divide-list">
            {TOOLS.map((tool) => (
              <li key={tool.key}>
                <button
                  type="button"
                  onClick={handlers[tool.key]}
                  className="group flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40"
                >
                  <span className="icon-tile bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300">
                    <tool.icon aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-13 font-medium text-slate-900 dark:text-slate-100">{tool.title}</span>
                    <span className="block text-xs text-slate-500">{tool.text}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-500" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default InsightsPanel;
