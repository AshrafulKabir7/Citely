import React, { useState } from 'react';
import { MessageSquare, X, Send, Bot, ShieldCheck, Sparkles, User } from 'lucide-react';
import { VectorStore } from '../lib/rag/vector-store';
import { RAGConfig, ChatMessage } from '../lib/rag/types';
import { generateRAGAnswer } from '../lib/rag/generator';

interface FloatingWidgetProps {
  vectorStore: VectorStore;
  config: RAGConfig;
}

export const FloatingWidget: React.FC<FloatingWidgetProps> = ({ vectorStore, config }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [widgetMessages, setWidgetMessages] = useState<ChatMessage[]>([
    {
      id: 'init-msg',
      sender: 'assistant',
      content: 'Hi! Ask me about our documentation. I answer only from it, with a source for every line.',
      timestamp: 'Now',
    },
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || isTyping) return;

    const userText = inputVal.trim();
    setInputVal('');

    const newMsg: ChatMessage = {
      id: `w-user-${Date.now()}`,
      sender: 'user',
      content: userText,
      timestamp: 'Just now',
    };

    setWidgetMessages((prev) => [...prev, newMsg]);
    setIsTyping(true);

    try {
      const res = await generateRAGAnswer(userText, vectorStore, config);
      const botMsg: ChatMessage = {
        id: `w-bot-${Date.now()}`,
        sender: 'assistant',
        content: res.answer,
        timestamp: 'Just now',
        citations: res.citations,
        groundingConfidence: res.groundingConfidence,
      };
      setWidgetMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {/* Floating Popup Window */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 h-[480px] bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="p-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold leading-tight">Live Support Assistant</h4>
                <p className="text-[10px] text-blue-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Verified Knowledge Base
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-white/20 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-950/60">
            {widgetMessages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2 text-xs ${
                  m.sender === 'user' ? 'ml-auto justify-end' : 'mr-auto justify-start'
                }`}
              >
                {m.sender === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0 mt-0.5">
                    <Bot className="w-3 h-3" />
                  </div>
                )}
                <div
                  className={`p-2.5 rounded-xl max-w-[80%] ${
                    m.sender === 'user'
                      ? 'bg-blue-600 text-white font-medium rounded-tr-none'
                      : 'bg-slate-850 border border-slate-700/80 text-slate-200 rounded-tl-none whitespace-pre-wrap'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1.5 text-xs text-slate-400 p-2">
                <Bot className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                <span>Checking documents...</span>
              </div>
            )}
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-2.5 border-t border-slate-800 bg-slate-950 flex gap-2">
            <input
              type="text"
              placeholder="Ask anything..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={!inputVal.trim() || isTyping}
              className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Toggle Bubble */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-13 h-13 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white p-3.5 shadow-xl shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center group"
        title="Live Website Widget Demo"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageSquare className="w-6 h-6 group-hover:rotate-6 transition-transform" />
        )}
      </button>
    </div>
  );
};
