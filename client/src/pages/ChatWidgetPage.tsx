import { useState, useRef, useEffect } from 'react';
import { useChat } from '../hooks/useChat';
import { useAISettings } from '../hooks/useAISettings';
import { Send, Bot, Minimize2 } from 'lucide-react';

export function ChatWidgetPage() {
  const { messages, isLoading, sendMessage, resetChat } = useChat();
  const { data: settingsData } = useAISettings();
  const [input, setInput] = useState('');
  const [started, setStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const settings = settingsData?.data;
  const businessName = settings?.businessName || 'Our Business';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleStart = async () => {
    setStarted(true);
    await sendMessage('Hi');
  };

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

  if (!started) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6 text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Bot className="w-9 h-9 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">{businessName}</h1>
              <p className="text-primary-100 text-sm mt-1">Virtual Assistant</p>
            </div>
            <div className="p-6 text-center">
              <p className="text-gray-600 text-sm mb-6">
                Have questions about our services? I'm here to help you 24/7.
              </p>
              <button
                onClick={handleStart}
                className="w-full bg-primary-600 text-white rounded-xl py-3 px-6 font-medium hover:bg-primary-700 transition-colors"
              >
                Start Chat
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col" style={{ height: 'min(600px, calc(100vh - 2rem))' }}>
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{businessName}</p>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-green-300 rounded-full" />
                  <p className="text-primary-100 text-xs">Online</p>
                </div>
              </div>
            </div>
            <button onClick={() => { resetChat(); setStarted(false); }} className="text-white/70 hover:text-white">
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === 'customer' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-primary-600" />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${
                  msg.role === 'customer'
                    ? 'bg-primary-600 text-white rounded-br-sm'
                    : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-sm'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2 justify-start">
                <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-primary-600" />
                </div>
                <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-gray-100">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t bg-white p-3">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="flex-1 rounded-full border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="w-9 h-9 rounded-full bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[10px] text-gray-400 text-center mt-2">Powered by LeadFlow AI</p>
          </div>
        </div>
      </div>
    </div>
  );
}
