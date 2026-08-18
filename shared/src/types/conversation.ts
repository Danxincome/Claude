export const ConversationStatus = {
  Active: 'active',
  Closed: 'closed',
} as const;
export type ConversationStatus = (typeof ConversationStatus)[keyof typeof ConversationStatus];

export const MessageRole = {
  Customer: 'customer',
  Assistant: 'assistant',
} as const;
export type MessageRole = (typeof MessageRole)[keyof typeof MessageRole];

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  leadId: string | null;
  status: ConversationStatus;
  startedAt: string;
  updatedAt: string;
  messages?: Message[];
  messageCount?: number;
  lastMessage?: string;
}

export interface ChatRequest {
  conversationId?: string;
  message: string;
}

export interface ChatResponse {
  conversationId: string;
  reply: string;
  leadCreated?: boolean;
  leadId?: string;
}
