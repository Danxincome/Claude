import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useRegenerateInsights } from '../../hooks/useInsights';
import { useToast } from '../../lib/toast-context';
import { getScoreLabel, SCORE_COLORS } from '@shared/constants';
import { RefreshCw } from 'lucide-react';
import type { Lead } from '@shared/index';

interface LeadScoreCardProps {
  lead: Lead;
}

export function LeadScoreCard({ lead }: LeadScoreCardProps) {
  const regenerate = useRegenerateInsights();
  const { showToast } = useToast();
  const scoreColor = SCORE_COLORS[getScoreLabel(lead.score)];
  const circumference = 2 * Math.PI * 40;
  const progress = (lead.score / 100) * circumference;

  function handleRegenerate() {
    regenerate.mutate(lead.id, {
      onSuccess: () => showToast('Score and insights regenerated'),
      onError: (err) => showToast(err.message, 'error'),
    });
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">AI Score</h3>
        <Button variant="ghost" size="sm" onClick={handleRegenerate} loading={regenerate.isPending}>
          <RefreshCw className="w-4 h-4 mr-1" /> Recalculate
        </Button>
      </div>

      <div className="flex justify-center mb-4">
        <div className="relative w-28 h-28">
          <svg className="w-full h-full score-ring" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#f3f4f6" strokeWidth="8" />
            <circle
              cx="50" cy="50" r="40" fill="none"
              stroke={scoreColor} strokeWidth="8" strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - progress}
              className="transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold" style={{ color: scoreColor }}>{lead.score}</span>
            <span className="text-xs text-gray-500 capitalize">{getScoreLabel(lead.score)}</span>
          </div>
        </div>
      </div>

      <div className="text-center text-sm text-gray-500">
        {lead.score >= 80 ? 'High-priority lead' :
         lead.score >= 50 ? 'Moderate potential' :
         'Needs nurturing'}
      </div>
    </Card>
  );
}
