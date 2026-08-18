import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAISettings, updateAISettings } from '../lib/api/ai-settings.api';
import type { UpdateAISettingsInput } from '@shared/index';

export function useAISettings() {
  return useQuery({
    queryKey: ['ai-settings'],
    queryFn: getAISettings,
  });
}

export function useUpdateAISettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateAISettingsInput) => updateAISettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-settings'] });
    },
  });
}
