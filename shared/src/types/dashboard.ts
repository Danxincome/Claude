import type { Activity } from './activity';
import type { Lead } from './lead';

export interface DashboardMetrics {
  totalLeads: number;
  newLeadsThisWeek: number;
  conversionRate: number;
  pipelineValue: number;
  leadsByStatus: Record<string, number>;
  leadsBySource: Record<string, number>;
  recentActivities: (Activity & { leadName: string })[];
  topScoringLeads: Lead[];
}
