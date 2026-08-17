import { Card } from '../ui/Card';
import { STATUS_COLORS } from '@shared/constants';

interface LeadStatusChartProps {
  leadsByStatus: Record<string, number>;
}

export function LeadStatusChart({ leadsByStatus }: LeadStatusChartProps) {
  const total = Object.values(leadsByStatus).reduce((sum, count) => sum + count, 0);
  const statuses = Object.entries(leadsByStatus).sort(([, a], [, b]) => b - a);

  return (
    <Card>
      <h3 className="text-base font-semibold text-gray-900 mb-4">Leads by Status</h3>
      <div className="space-y-3">
        {statuses.map(([status, count]) => {
          const percentage = total > 0 ? (count / total) * 100 : 0;
          return (
            <div key={status}>
              <div className="flex items-center justify-between text-sm mb-1">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: STATUS_COLORS[status] || '#9CA3AF' }}
                  />
                  <span className="text-gray-700">{status}</span>
                </div>
                <span className="text-gray-500 font-medium">{count}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: STATUS_COLORS[status] || '#9CA3AF',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
