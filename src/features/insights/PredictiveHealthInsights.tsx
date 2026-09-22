import React from 'react';
import { BarChart3, Clock, Heart, Pill, TrendingUp, XCircle } from 'lucide-react';

interface PredictiveHealthInsightsProps {
  onClose: () => void;
}

const PredictiveHealthInsights: React.FC<PredictiveHealthInsightsProps> = ({ onClose }) => {
  const insights = [
    {
      title: 'Blood Pressure Trend Alert',
      prediction: 'Your BP readings show a 15% increase trend over the past week',
      recommendation: 'Consider reducing sodium intake and increasing cardio exercise',
      confidence: 92,
      priority: 'Medium',
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
      icon: Heart
    },
    {
      title: 'Medication Adherence Risk',
      prediction: 'AI predicts 23% chance of missing evening medications this week',
      recommendation: 'Set additional reminders for 6 PM medications',
      confidence: 87,
      priority: 'High',
      color: 'text-red-600',
      bg: 'bg-red-50',
      icon: Pill
    },
    {
      title: 'Sleep Quality Improvement',
      prediction: 'Your sleep patterns indicate potential for 18% better rest quality',
      recommendation: 'Try going to bed 30 minutes earlier based on your activity data',
      confidence: 76,
      priority: 'Low',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      icon: Clock
    },
    {
      title: 'Health Score Projection',
      prediction: 'Continuing current habits will improve your health score to 91 by next month',
      recommendation: "You're on track! Keep up your current routine",
      confidence: 94,
      priority: 'Low',
      color: 'text-green-600',
      bg: 'bg-green-50',
      icon: TrendingUp
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">Predictive Health Insights</h3>
                <p className="text-gray-600">AI-powered health predictions and recommendations</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <XCircle className="h-6 w-6 text-gray-500" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {insights.map((insight, idx) => (
              <div
                key={idx}
                className={`p-6 rounded-2xl border-2 ${insight.bg} ${insight.color.replace(
                  'text-',
                  'border-'
                )}`}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`h-3 w-3 rounded-full ${insight.color.replace('text-', 'bg-')}`} />
                  <span className="font-bold">Priority: {insight.priority}</span>
                </div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="h-10 w-10 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-xl flex items-center justify-center">
                    <insight.icon className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-800">{insight.title}</h4>
                </div>
                <div className="mb-4">
                  <p className="text-gray-700 mb-3">{insight.prediction}</p>
                  <div className="bg-white/60 p-3 rounded-lg">
                    <p className="text-sm font-medium text-gray-800">
                      Recommendation: {insight.recommendation}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">AI Confidence: {insight.confidence}%</span>
                  <button className="text-indigo-600 text-sm font-medium hover:underline">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictiveHealthInsights;

