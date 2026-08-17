import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getInsights, regenerateInsights } from '../lib/api/insights.api';

export function useInsights(leadId: string) {
  return useQuery({
    queryKey: ['insights', leadId],
    queryFn: () => getInsights(leadId),
    enabled: !!leadId,
  });
}

export function useRegenerateInsights() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (leadId: string) => regenerateInsights(leadId),
    onSuccess: (_data, leadId) => {
      queryClient.invalidateQueries({ queryKey: ['insights', leadId] });
      queryClient.invalidateQueries({ queryKey: ['lead', leadId] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}
