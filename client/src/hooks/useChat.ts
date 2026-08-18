import { useState } from 'react';
import { sendChatMessage } from '../lib/api/chat.api';
import type { ChatResponse, ApiResponse } from '@shared/index';

interface ChatMessage {
  role: 'customer' | 'assistant';
  content: string;
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastLeadId, setLastLeadId] = useState<string | null>(null);

  const sendMessage = async (message: string) => {
    setMessages(prev => [...prev, { role: 'customer', content: message }]);
    setIsLoading(true);

    try {
      const response = await sendChatMessage(conversationId, message) as ApiResponse<ChatResponse>;
      const chatData = response.data;
      setConversationId(chatData.conversationId);
      setMessages(prev => [...prev, { role: 'assistant', content: chatData.reply }]);
      if (chatData.leadId) setLastLeadId(chatData.leadId);
      return chatData;
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetChat = () => {
    setMessages([]);
    setConversationId(null);
    setLastLeadId(null);
  };

  return { messages, conversationId, isLoading, lastLeadId, sendMessage, resetChat };
}
