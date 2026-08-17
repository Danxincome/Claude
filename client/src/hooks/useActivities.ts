import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getActivities, createActivity } from '../lib/api/activities.api';
import type { CreateActivityInput } from '@shared/index';

export function useActivities(leadId: string) {
  return useQuery({
    queryKey: ['activities', leadId],
    queryFn: () => getActivities(leadId),
    enabled: !!leadId,
  });
}

export function useCreateActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ leadId, data }: { leadId: string; data: CreateActivityInput }) =>
      createActivity(leadId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['activities', variables.leadId] });
      queryClient.invalidateQueries({ queryKey: ['lead', variables.leadId] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
