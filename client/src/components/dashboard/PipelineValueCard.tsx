import { Card } from '../ui/Card';
import { formatCurrency } from '../../lib/format';
import { STATUS_COLORS, PIPELINE_STAGES } from '@shared/constants';

interface PipelineValueCardProps {
  leadsByStatus: Record<string, number>;
}

export function PipelineValueCard({ leadsByStatus }: PipelineValueCardProps) {
  const total = PIPELINE_STAGES.reduce((sum, s) => sum + (leadsByStatus[s] || 0), 0);

  return (
    <Card>
      <h3 className="text-base font-semibold text-gray-900 mb-4">Pipeline Overview</h3>
      <div className="flex rounded-lg overflow-hidden h-8 mb-4">
        {PIPELINE_STAGES.map(stage => {
          const count = leadsByStatus[stage] || 0;
          const pct = total > 0 ? (count / total) * 100 : 0;
          if (pct === 0) return null;
          return (
            <div
              key={stage}
              className="relative group flex items-center justify-center text-xs font-medium text-white transition-all"
              style={{ width: `${pct}%`, backgroundColor: STATUS_COLORS[stage] }}
            >
              {pct >= 10 && count}
              <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                {stage}: {count} leads
              </div>
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {PIPELINE_STAGES.map(stage => (
          <div key={stage} className="flex items-center gap-2 text-sm">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[stage] }} />
            <span className="text-gray-600">{stage}</span>
            <span className="ml-auto font-medium text-gray-900">{leadsByStatus[stage] || 0}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
