import apiClient from '../api-client';
import type { ChatResponse, ApiResponse } from '@shared/index';

export async function sendChatMessage(conversationId: string | null, message: string): Promise<ApiResponse<ChatResponse>> {
  return apiClient.post('/chat', { conversationId, message });
}
