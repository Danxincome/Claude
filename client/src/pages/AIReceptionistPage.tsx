import { useState, useRef, useEffect } from 'react';
import { useChat } from '../hooks/useChat';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Send, RotateCcw, UserCircle, Bot, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AIReceptionistPage() {
  const { messages, isLoading, lastLeadId, sendMessage, resetChat } = useChat();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const msg = input.trim();
    setInput('');
    await sendMessage(msg);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Receptionist</h1>
          <p className="text-sm text-gray-500 mt-1">Test your AI receptionist chat as a customer would see it</p>
        </div>
        <div className="flex items-center gap-3">
          {lastLeadId && (
            <Link to={`/leads/${lastLeadId}`} className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium">
              <ExternalLink className="w-4 h-4" /> View Lead
            </Link>
          )}
          <Button variant="secondary" onClick={resetChat}>
            <RotateCcw className="w-4 h-4 mr-2" /> New Chat
          </Button>
        </div>
      </div>

      <Card>
        <div className="flex flex-col h-[calc(100vh-280px)] min-h-[400px] max-h-[700px]">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <Bot className="w-12 h-12 mb-3" />
                <p className="text-lg font-medium">Start a conversation</p>
                <p className="text-sm mt-1">Type a message below to test your AI receptionist</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'customer' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-primary-600" />
                  </div>
                )}
                <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                  msg.role === 'customer'
                    ? 'bg-primary-600 text-white rounded-br-md'
                    : 'bg-gray-100 text-gray-900 rounded-bl-md'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
                {msg.role === 'customer' && (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <UserCircle className="w-5 h-5 text-gray-500" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-primary-600" />
                </div>
                <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t p-4">
            <div className="flex gap-3">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                rows={1}
                className="flex-1 resize-none rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <Button onClick={handleSend} disabled={!input.trim() || isLoading}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {lastLeadId && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <UserCircle className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-green-800">Lead created from this conversation</p>
            <p className="text-xs text-green-600 mt-0.5">Customer information has been captured and a new lead has been added.</p>
          </div>
          <Link to={`/leads/${lastLeadId}`}>
            <Button size="sm" variant="secondary">View Lead</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
