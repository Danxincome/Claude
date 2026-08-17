import apiClient from '../api-client';
import type { DashboardMetrics, ApiResponse } from '@shared/index';

export async function getDashboardMetrics(): Promise<ApiResponse<DashboardMetrics>> {
  return apiClient.get('/dashboard');
}
