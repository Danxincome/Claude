import apiClient from '../api-client';
import type { Lead, CreateLeadInput, UpdateLeadInput, LeadFilters, ApiResponse, PaginatedResponse } from '@shared/index';

export async function getLeads(filters: LeadFilters = {}): Promise<PaginatedResponse<Lead>> {
  const params = new URLSearchParams();
  if (filters.status) params.set('status', filters.status);
  if (filters.source) params.set('source', filters.source);
  if (filters.search) params.set('search', filters.search);
  if (filters.scoreMin !== undefined) params.set('scoreMin', String(filters.scoreMin));
  if (filters.scoreMax !== undefined) params.set('scoreMax', String(filters.scoreMax));
  if (filters.sortBy) params.set('sortBy', filters.sortBy);
  if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);
  if (filters.page) params.set('page', String(filters.page));
  if (filters.pageSize) params.set('pageSize', String(filters.pageSize));
  return apiClient.get(`/leads?${params.toString()}`);
}

export async function getLead(id: string): Promise<ApiResponse<Lead>> {
  return apiClient.get(`/leads/${id}`);
}

export async function createLead(data: CreateLeadInput): Promise<ApiResponse<Lead>> {
  return apiClient.post('/leads', data);
}

export async function updateLead(id: string, data: UpdateLeadInput): Promise<ApiResponse<Lead>> {
  return apiClient.put(`/leads/${id}`, data);
}

export async function updateLeadStatus(id: string, status: string): Promise<ApiResponse<Lead>> {
  return apiClient.patch(`/leads/${id}/status`, { status });
}

export async function deleteLead(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
  return apiClient.delete(`/leads/${id}`);
}
