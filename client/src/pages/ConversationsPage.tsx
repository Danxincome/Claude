import { useState } from 'react';
import { useConversations, useConversation, useCloseConversation } from '../hooks/useConversations';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';
import { X, User, Clock, Bot, UserCircle, ExternalLink, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatRelativeTime } from '../lib/format';

export function ConversationsPage() {
  const { data, isLoading } = useConversations();
  const closeConversation = useCloseConversation();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const conversations = data?.data || [];

  if (isLoading) return <div className="flex justify-center py-20"><LoadingSpinner /></div>;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Conversations</h1>
        <p className="text-gray-500 mt-1">View and manage customer chat conversations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" style={{ minHeight: '600px' }}>
        <div className="lg:col-span-1 space-y-2">
          {conversations.length === 0 && (
            <EmptyState
              title="No conversations yet"
              description="Conversations will appear here when customers chat with your AI receptionist."
            />
          )}
          {conversations.map((conv: any) => (
            <div
              key={conv.id}
              onClick={() => setSelectedId(conv.id)}
              className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                selectedId === conv.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-sm text-gray-900 truncate">
                    {conv.customerName || 'Unknown Customer'}
                  </span>
                </div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  conv.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {conv.status}
                </span>
              </div>
              {conv.lastMessage && (
                <p className="text-xs text-gray-500 truncate mt-1">{conv.lastMessage}</p>
              )}
              <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                <Clock className="w-3 h-3" />
                {formatRelativeTime(conv.updatedAt)}
                {conv.messageCount > 0 && (
                  <span className="ml-auto">{conv.messageCount} messages</span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-2">
          {selectedId ? (
            <ConversationDetail
              id={selectedId}
              onClose={(id) => closeConversation.mutate(id)}
            />
          ) : (
            <Card>
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-gray-400">
                <MessageSquare className="w-10 h-10 mb-2" />
                <p className="text-sm">Select a conversation to view</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function ConversationDetail({ id, onClose }: { id: string; onClose: (id: string) => void }) {
  const { data, isLoading } = useConversation(id);
  const conversation = data?.data;

  if (isLoading || !conversation) return <Card><div className="flex justify-center py-20"><LoadingSpinner /></div></Card>;

  return (
    <Card>
      <div className="flex flex-col h-[600px]">
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">{conversation.customerName || 'Unknown Customer'}</h3>
            <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
              {conversation.customerEmail && <span>{conversation.customerEmail}</span>}
              {conversation.customerPhone && <span>{conversation.customerPhone}</span>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {conversation.leadId && (
              <Link to={`/leads/${conversation.leadId}`} className="text-primary-600 hover:text-primary-700">
                <Button size="sm" variant="secondary">
                  <ExternalLink className="w-3 h-3 mr-1" /> Lead
                </Button>
              </Link>
            )}
            {conversation.status === 'active' && (
              <Button size="sm" variant="secondary" onClick={() => onClose(id)}>
                <X className="w-3 h-3 mr-1" /> Close
              </Button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {(conversation.messages || []).map((msg: any) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'customer' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary-600" />
                </div>
              )}
              <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 ${
                msg.role === 'customer'
                  ? 'bg-primary-600 text-white rounded-br-md'
                  : 'bg-gray-100 text-gray-900 rounded-bl-md'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                <p className={`text-[10px] mt-1 ${msg.role === 'customer' ? 'text-primary-200' : 'text-gray-400'}`}>
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </p>
              </div>
              {msg.role === 'customer' && (
                <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                  <UserCircle className="w-4 h-4 text-gray-500" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
