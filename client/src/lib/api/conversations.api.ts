import apiClient from '../api-client';
import type { Conversation, ApiResponse } from '@shared/index';

export async function getConversations(): Promise<ApiResponse<Conversation[]>> {
  return apiClient.get('/conversations');
}

export async function getConversation(id: string): Promise<ApiResponse<Conversation>> {
  return apiClient.get(`/conversations/${id}`);
}

export async function closeConversation(id: string): Promise<ApiResponse<Conversation>> {
  return apiClient.patch(`/conversations/${id}/close`);
}
