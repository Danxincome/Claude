import apiClient from '../api-client';
import type { AIInsight, LeadScore, ApiResponse } from '@shared/index';

export async function getInsights(leadId: string): Promise<ApiResponse<AIInsight[]>> {
  return apiClient.get(`/leads/${leadId}/insights`);
}

export async function regenerateInsights(leadId: string): Promise<ApiResponse<{ score: number; factors: LeadScore['factors']; insights: AIInsight[] }>> {
  return apiClient.post(`/leads/${leadId}/insights/regenerate`);
}
