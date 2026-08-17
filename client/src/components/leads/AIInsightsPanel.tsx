import { Card } from '../ui/Card';
import { Lightbulb, AlertTriangle, BarChart3, Target } from 'lucide-react';
import { formatRelativeTime } from '../../lib/format';
import type { AIInsight } from '@shared/index';

const typeConfig: Record<string, { icon: typeof Lightbulb; color: string; bg: string }> = {
  'Next Best Action': { icon: Lightbulb, color: 'text-blue-600', bg: 'bg-blue-50' },
  'Risk Assessment': { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
  'Score Explanation': { icon: BarChart3, color: 'text-purple-600', bg: 'bg-purple-50' },
  'Win Probability': { icon: Target, color: 'text-green-600', bg: 'bg-green-50' },
};

interface AIInsightsPanelProps {
  leadId: string;
  insights: AIInsight[];
}

export function AIInsightsPanel({ insights }: AIInsightsPanelProps) {
  return (
    <Card padding="none">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-base font-semibold text-gray-900">AI Insights</h3>
      </div>
      <div className="divide-y divide-gray-100">
        {insights.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-gray-500">No insights generated yet</div>
        ) : (
          insights.map(insight => {
            const config = typeConfig[insight.type] || typeConfig['Score Explanation'];
            const Icon = config.icon;
            return (
              <div key={insight.id} className="px-6 py-4">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${config.bg}`}>
                    <Icon className={`w-4 h-4 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-gray-900">{insight.title}</p>
                      <span className="text-xs text-gray-400 flex-shrink-0">{formatRelativeTime(insight.generatedAt)}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{insight.content}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full bg-primary-500"
                          style={{ width: `${insight.confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400">{Math.round(insight.confidence * 100)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
