import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Citation } from '../lib/rag/types';
import {
  Send,
  Bot,
  User,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Trash2,
  Download,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  isThinking: boolean;
  onSendMessage: (query: string) => void;
  onClearChat: () => void;
  onSelectCitation: (citation: Citation) => void;
  activePreset: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  isThinking,
  onSendMessage,
  onClearChat,
  onSelectCitation,
  activePreset,
}) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isThinking) return;
    onSendMessage(inputValue.trim());
    setInputValue('');
  };

  // Preset suggested starter prompts
  const getStarterPrompts = () => {
    if (activePreset === 'saas') {
      return [
        { label: '💰 Refund Policy', query: 'What is the refund policy for annual plans and subscriptions?' },
        { label: '⚡ API Rate Limits', query: 'What are the API rate limits for starter and growth tiers?' },
        { label: '🔒 Security Compliance', query: 'What security certifications and encryption protocols do you support?' },
        { label: '🛡️ Test Hallucination', query: 'Who won the 1994 World Cup tournament?' },
      ];
    } else if (activePreset === 'hr') {
      return [
        { label: '🏖️ PTO & Leave Rules', query: 'How many days of PTO and sick leave do employees accrue per year?' },
        { label: '💻 Hardware Stipend', query: 'What is the remote work equipment and tech refresh allowance?' },
        { label: '👶 Parental Leave', query: 'What is the company parental leave policy for primary caregivers?' },
        { label: '🛡️ Test Hallucination', query: 'Can I claim pet food on company expenses?' },
      ];
    } else {
      return [
        { label: '📦 Return Policy', query: 'What is the 30-day return policy and who pays for return shipping?' },
        { label: '🛡️ Hardware Warranty', query: 'What is covered under the 2-Year Manufacturer Warranty vs accidental damage?' },
        { label: '⚡ RMA Process', query: 'How do I submit an RMA claim and how fast are replacements sent?' },
        { label: '🛡️ Test Hallucination', query: 'Do you sell gas-powered generators?' },
      ];
    }
  };

  const handleExportChat = () => {
    const transcript = messages
      .map((m) => `[${m.timestamp}] ${m.sender.toUpperCase()}:\n${m.content}\n\n`)
      .join('---\n\n');
    const blob = new Blob([transcript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Citely-Conversation-${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950/40 relative">
      {/* Chat Subheader */}
      <div className="border-b border-slate-800/80 px-4 py-2.5 flex items-center justify-between bg-slate-950/30">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-xs font-medium text-slate-300">
            Grounding Engine: <strong className="text-blue-400">Active</strong>
          </span>
          <span className="text-[11px] text-slate-500">• Cosine + BM25 Hybrid Retrieval</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportChat}
            disabled={messages.length === 0}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 px-2 py-1 rounded hover:bg-slate-800/60 transition-colors disabled:opacity-40"
            title="Download conversation transcript"
          >
            <Download className="w-3 h-3" /> Export Chat
          </button>
          <button
            onClick={onClearChat}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-400 px-2 py-1 rounded hover:bg-slate-800/60 transition-colors"
            title="Reset conversation"
          >
            <Trash2 className="w-3 h-3" /> Clear
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="max-w-xl mx-auto py-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600/20 via-indigo-600/20 to-cyan-400/20 border border-blue-500/30 mx-auto flex items-center justify-center text-blue-400 mb-4 shadow-xl">
              <Bot className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">
              Trained on Your Enterprise Documents & Website
            </h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Ask any question to test semantic retrieval, verbatim source citations, and strict anti-hallucination guardrails.
            </p>

            {/* Starter Suggestion Pills */}
            <div className="text-left space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block px-1">
                Suggested Test Prompts:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {getStarterPrompts().map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSendMessage(prompt.query)}
                    className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-blue-500/50 text-left text-xs transition-all group"
                  >
                    <div className="font-medium text-slate-200 group-hover:text-blue-400 flex items-center justify-between">
                      <span>{prompt.label}</span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-blue-400 transition-opacity" />
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                      {prompt.query}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 max-w-3xl ${
                message.sender === 'user' ? 'ml-auto justify-end' : 'mr-auto justify-start'
              }`}
            >
              {message.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className="space-y-2 max-w-2xl">
                {/* Message Bubble */}
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white font-medium rounded-tr-sm shadow-md'
                      : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-sm backdrop-blur-sm'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>

                {/* Grounding & Citations Container (Assistant only) */}
                {message.sender === 'assistant' && (
                  <div className="space-y-2 pt-1">
                    {/* Confidence & Guardrail Header */}
                    <div className="flex flex-wrap items-center gap-2 text-[11px]">
                      {message.groundingConfidence && message.groundingConfidence > 50 ? (
                        <span className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
                          <ShieldCheck className="w-3 h-3" />
                          Evidence coverage {message.groundingConfidence}%
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full font-medium">
                          <ShieldAlert className="w-3 h-3" />
                          Strict Guardrail Triggered (No Hallucination)
                        </span>
                      )}

                      {message.citations && message.citations.length > 0 && (
                        <span className="text-slate-400">
                          {message.citations.length} sources cited
                        </span>
                      )}
                    </div>

                    {/* Clickable Citation Badges */}
                    {message.citations && message.citations.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {message.citations.map((cite) => (
                          <div
                            key={cite.id}
                            onClick={() => onSelectCitation(cite)}
                            className="bg-slate-950/80 hover:bg-slate-900 border border-slate-800/90 hover:border-blue-500/50 rounded-xl p-2.5 cursor-pointer transition-all group"
                          >
                            <div className="flex items-center justify-between text-[11px] font-semibold text-blue-400 mb-1">
                              <span className="flex items-center gap-1 truncate">
                                <FileText className="w-3 h-3" />
                                [{cite.index}] {cite.sourceName}
                              </span>
                              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded font-mono">
                                {cite.similarityScore}% match
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 line-clamp-2 leading-tight">
                              "{cite.excerpt}"
                            </p>
                            <span className="text-[10px] text-slate-500 group-hover:text-blue-400 flex items-center gap-0.5 mt-1.5 font-medium transition-colors">
                              Inspect source passage <ChevronRight className="w-2.5 h-2.5" />
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {message.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))
        )}

        {/* Thinking / Streaming Indicator */}
        {isThinking && (
          <div className="flex gap-3 max-w-xl mr-auto">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shrink-0 animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl rounded-tl-sm bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
              <span>Searching vector database & grounding response...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 backdrop-blur-md">
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-4xl mx-auto">
          <input
            type="text"
            placeholder="Ask anything about your uploaded files or indexed website..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isThinking}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isThinking}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-blue-500/20"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Ask AI</span>
          </button>
        </form>
        <p className="text-[11px] text-center text-slate-500 mt-2">
          Citely verifies facts against the vector index before answering. Hallucinations are actively suppressed.
        </p>
      </div>
    </div>
  );
};
