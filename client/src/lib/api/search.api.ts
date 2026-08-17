import apiClient from '../api-client';
import type { Lead, ApiResponse } from '@shared/index';

export async function searchLeads(q: string): Promise<ApiResponse<Lead[]>> {
  return apiClient.get(`/search?q=${encodeURIComponent(q)}`);
}
