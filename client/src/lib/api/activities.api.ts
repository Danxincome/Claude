import apiClient from '../api-client';
import type { Activity, CreateActivityInput, ApiResponse } from '@shared/index';

export async function getActivities(leadId: string): Promise<ApiResponse<Activity[]>> {
  return apiClient.get(`/leads/${leadId}/activities`);
}

export async function createActivity(leadId: string, data: CreateActivityInput): Promise<ApiResponse<Activity>> {
  return apiClient.post(`/leads/${leadId}/activities`, data);
}
