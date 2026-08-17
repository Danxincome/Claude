import { useQuery } from '@tanstack/react-query';
import { getDashboardMetrics } from '../lib/api/dashboard.api';

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardMetrics,
    staleTime: 30_000,
  });
}
