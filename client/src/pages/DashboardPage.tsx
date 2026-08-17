import { useDashboardMetrics } from '../hooks/useDashboard';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { MetricCard } from '../components/dashboard/MetricCard';
import { LeadStatusChart } from '../components/dashboard/LeadStatusChart';
import { RecentActivityFeed } from '../components/dashboard/RecentActivityFeed';
import { TopLeadsTable } from '../components/dashboard/TopLeadsTable';
import { PipelineValueCard } from '../components/dashboard/PipelineValueCard';
import { Users, UserPlus, TrendingUp, DollarSign } from 'lucide-react';
import { formatCurrency } from '../lib/format';

export function DashboardPage() {
  const { data, isLoading } = useDashboardMetrics();

  if (isLoading) return <LoadingSpinner size="lg" className="h-64" />;

  const metrics = data?.data;
  if (!metrics) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">AI-powered overview of your sales pipeline</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Leads"
          value={metrics.totalLeads}
          icon={Users}
          color="blue"
        />
        <MetricCard
          title="New This Week"
          value={metrics.newLeadsThisWeek}
          icon={UserPlus}
          color="green"
        />
        <MetricCard
          title="Conversion Rate"
          value={`${metrics.conversionRate}%`}
          icon={TrendingUp}
          color="purple"
        />
        <MetricCard
          title="Pipeline Value"
          value={formatCurrency(metrics.pipelineValue)}
          icon={DollarSign}
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LeadStatusChart leadsByStatus={metrics.leadsByStatus} />
        <PipelineValueCard leadsByStatus={metrics.leadsByStatus} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopLeadsTable leads={metrics.topScoringLeads} />
        <RecentActivityFeed activities={metrics.recentActivities} />
      </div>
    </div>
  );
}
