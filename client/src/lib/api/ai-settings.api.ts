import apiClient from '../api-client';
import type { AISettings, UpdateAISettingsInput, ApiResponse } from '@shared/index';

export async function getAISettings(): Promise<ApiResponse<AISettings>> {
  return apiClient.get('/ai-settings');
}

export async function updateAISettings(data: UpdateAISettingsInput): Promise<ApiResponse<AISettings>> {
  return apiClient.put('/ai-settings', data);
}
