import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Citation, ExecutiveDefinition } from '../lib/rag/types';
import {
  Search,
  FileText,
  ShieldCheck,
  Bookmark,
  Copy,
  Check,
  X,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { RadialLogo } from './RadialLogo';
import { executiveInitials } from '../lib/rag/executives';

interface ExecutiveChatProps {
  executive: ExecutiveDefinition;
  messages: ChatMessage[];
  isThinking: boolean;
  onSendMessage: (query: string) => void;
  onSelectCitation: (citation: Citation) => void;
  onOpenKnowledge: () => void;
  onOpenSettings: () => void;
  onBookmarkMessage: (msg: ChatMessage) => void;
  onInspectDocumentTitle: (title: string) => void;
  onToast: (msg: string) => void;
  /** Strict grounding: answer only when most of the question is covered by the documents. */
  strictGrounding: boolean;
  onToggleStrict: () => void;
}

export const ExecutiveChat: React.FC<ExecutiveChatProps> = ({
  executive,
  messages,
  isThinking,
  onSendMessage,
  onSelectCitation,
  onOpenKnowledge,
  onOpenSettings,
  onBookmarkMessage,
  onInspectDocumentTitle,
  onToast,
  strictGrounding,
  onToggleStrict,
}) => {
  const [inputText, setInputText] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [expandedReasoning, setExpandedReasoning] = useState<Record<string, boolean>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isThinking) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleCopyMessage = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedMsgId(id);
    onToast('Copied executive briefing to clipboard!');
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const toggleReasoning = (id: string) => {
    setExpandedReasoning((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const parseInlineMarkdown = (text: string) => {
    const regex = /(\*\*.*?\*\*|\[\d+\])/g;
    const parts = text.split(regex);

    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-fg">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (/^\[\d+\]$/.test(part)) {
        return (
          <span
            key={i}
            className="inline-flex items-center justify-center px-1.5 py-0.5 ml-1 text-[10px] font-bold font-mono rounded-full bg-[#ffd000] text-[#0c0c0c]"
          >
            {part.slice(1, -1)}
          </span>
        );
      }
      return part;
    });
  };

  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return <div key={idx} className="h-1" />;
      }

      if (line.startsWith('**') && line.endsWith('**')) {
        return (
          <div key={idx} className="font-bold text-fg text-sm sm:text-base mt-2 mb-1 tracking-tight">
            {line.slice(2, -2)}
          </div>
        );
      }

      if (line.includes('📌')) {
        return (
          <div
            key={idx}
            className="my-2 p-2.5 px-3.5 rounded-xl bg-surface-3 border border-fg/[0.08] text-xs font-semibold text-accent flex items-center gap-2"
          >
            {parseInlineMarkdown(line)}
          </div>
        );
      }

      if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
        const cleanText = trimmed.replace(/^[•\-]\s*/, '');
        return (
          <div key={idx} className="flex items-start gap-2 my-1 text-xs sm:text-[13.5px]">
            <span className="text-accent font-bold text-sm shrink-0 mt-0.5">•</span>
            <span className="text-fg leading-relaxed flex-1">{parseInlineMarkdown(cleanText)}</span>
          </div>
        );
      }

      return (
        <p key={idx} className="my-1 text-xs sm:text-[13.5px] leading-relaxed text-fg">
          {parseInlineMarkdown(line)}
        </p>
      );
    });
  };

  const filteredMessages = chatSearchQuery.trim()
    ? messages.filter((m) =>
        m.content.toLowerCase().includes(chatSearchQuery.toLowerCase())
      )
    : messages;

  return (
    <div className="chat-workspace">
      
      {/* Header */}
      <header className="chat-header">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-md shrink-0"
            style={{
              background:
                'linear-gradient(135deg, #ffd000 0%, #86ca8a 60%, #78d0cd 100%)',
              color: '#0c0c0c',
            }}
          >
            {executiveInitials(executive.name)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <h2 className="text-sm sm:text-base font-semibold text-fg tracking-tight truncate">
                {executive.name}
              </h2>
              <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-fg/[0.06] border border-fg/[0.08] shrink-0">
                <div className="live-dot" />
                <span className="text-[10px] font-bold text-accent uppercase tracking-wider">
                  Live Reasoning
                </span>
              </div>
            </div>
            <p className="text-[10px] sm:text-[11px] text-subtle truncate">
              {executive.role} • Grounded in {executive.sourceFileFocus}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {showSearch ? (
            <div className="flex items-center gap-1.5 bg-surface-3 border border-fg/[0.1] rounded-xl px-2.5 py-1">
              <Search className="w-3.5 h-3.5 text-subtle" />
              <input
                type="text"
                placeholder="Find in chat..."
                value={chatSearchQuery}
                onChange={(e) => setChatSearchQuery(e.target.value)}
                className="bg-transparent text-xs text-fg focus:outline-none w-28 sm:w-44"
                autoFocus
              />
              <button
                onClick={() => {
                  setShowSearch(false);
                  setChatSearchQuery('');
                }}
                className="text-subtle hover:text-fg"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowSearch(true)}
              className="p-2 rounded-lg text-muted hover:text-fg hover:bg-fg/[0.06] transition-colors"
              title="Search in this conversation"
            >
              <Search className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onOpenKnowledge}
            className="p-1.5 rounded-lg text-muted hover:text-fg hover:bg-fg/[0.06] transition-colors"
            title="Inspect Knowledge Sources"
          >
            <RadialLogo size={22} />
          </button>
        </div>
      </header>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
        {/* Date Divider */}
        <div className="flex items-center justify-center my-2">
          <div className="h-[1px] bg-fg/[0.06] flex-1" />
          <span className="px-4 text-[11px] font-semibold text-faint uppercase tracking-wider">
            Grounded session · answers quote cited sources
          </span>
          <div className="h-[1px] bg-fg/[0.06] flex-1" />
        </div>

        {/* Initial Suggestions if empty */}
        {filteredMessages.length === 0 && !chatSearchQuery && (
          <div className="max-w-xl mx-auto text-center py-12 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-fg/[0.05] border border-fg/[0.1] flex items-center justify-center mx-auto text-accent">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-medium text-fg">
              Consult {executive.name}
            </h3>
            <p className="text-xs text-subtle max-w-md mx-auto leading-relaxed">
              {executive.description} Ask any question to inspect live reasoning and verified document citations.
            </p>
            <div className="flex flex-col gap-2 pt-2">
              {executive.samplePrompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => onSendMessage(p)}
                  className="text-left text-xs text-soft hover:text-fg bg-surface-2 hover:bg-surface-3 border border-fg/[0.06] hover:border-fg/[0.15] p-3 rounded-xl transition-all"
                >
                  "{p}"
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages List */}
        {filteredMessages.map((message) => (
          <div key={message.id} className="w-full">
            {message.sender === 'user' ? (
              /* User Bubble (Right Aligned) */
              <div className="flex items-start justify-end gap-3 ml-auto max-w-2xl">
                <div className="user-speech-bubble">
                  <p className="text-xs sm:text-sm leading-relaxed text-fg font-normal">
                    {message.content}
                  </p>

                  {message.attachedDocuments && message.attachedDocuments.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-fg/10 space-y-1">
                      <p className="text-[10px] font-medium text-muted">
                        Executive scope:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {message.attachedDocuments.map((doc, idx) => (
                          <div
                            key={idx}
                            onClick={() => onInspectDocumentTitle(doc)}
                            className="attachment-pill"
                            title="Inspect verified document passages"
                          >
                            <FileText className="w-2.5 h-2.5 text-accent" />
                            <span className="truncate max-w-[200px]">{doc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Avatar */}
                <div className="w-7 h-7 rounded-full bg-surface-4 text-fg flex items-center justify-center shrink-0 mt-1 border border-fg/10">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="7" r="4" />
                    <path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
                  </svg>
                </div>
              </div>
            ) : (
              /* Assistant Bubble (Left Aligned) */
              <div className="flex items-start gap-3 mr-auto max-w-3xl">
                {/* Executive Avatar */}
                <div
                  className="w-7 h-7 rounded-full shrink-0 mt-1 shadow-md flex items-center justify-center text-[10px] font-bold text-[#0c0c0c]"
                  style={{
                    background:
                      'linear-gradient(105deg, #f5c40a 0%, #dcae3f 40%, #6ac6a0 62%, #22c0cf 100%)',
                  }}
                >
                  AI
                </div>

                <div className="space-y-2 flex-1">
                  <div className="ai-speech-bubble">
                    
                    {/* Live Reasoning Thought Trace Accordion */}
                    <div className="mb-3 pb-2.5 border-b border-fg/[0.06]">
                      <button
                        onClick={() => toggleReasoning(message.id)}
                        className="flex items-center justify-between w-full text-[11px] text-accent font-semibold hover:text-accent-hi transition-colors"
                      >
                        <span className="flex items-center gap-1.5">
                          <div className="live-dot" />
                          <span>How this was answered</span>
                        </span>
                        {expandedReasoning[message.id] ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {expandedReasoning[message.id] && (
                        <div className="mt-2 p-3 bg-canvas/60 border border-fg/[0.05] rounded-xl text-[11px] text-subtle font-mono leading-relaxed space-y-1">
                          {(message.trace ?? ['No retrieval trace recorded for this message.']).map((step, i) => (
                            <p key={i}>• {step}</p>
                          ))}
                          {message.groundingConfidence != null && (
                            <p className={message.citations?.length ? 'text-positive' : 'text-subtle'}>
                              {message.citations?.length
                                ? `✓ Evidence coverage ${message.groundingConfidence}%: every line above is quoted from a cited passage`
                                : '✓ Declined rather than guessing'}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Main Content */}
                    <div className="text-xs sm:text-[13.5px] leading-relaxed text-fg space-y-2">
                      {renderFormattedContent(message.content)}
                    </div>

                    {/* Citations Cards inside bubble */}
                    {message.citations && message.citations.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-fg/[0.06] space-y-2">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-positive">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Source passages:</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {message.citations.map((cite) => (
                            <div
                              key={cite.id}
                              onClick={() => onSelectCitation(cite)}
                              className="bg-surface-3 hover:bg-surface-4 border border-fg/[0.06] hover:border-fg/[0.18] rounded-xl p-2.5 cursor-pointer transition-all flex items-center justify-between gap-2 group"
                            >
                              <div className="flex items-center gap-2 truncate">
                                <span className="w-4 h-4 rounded-full bg-[#ffd000] text-[#0c0c0c] text-[9px] font-bold flex items-center justify-center shrink-0">
                                  {cite.index}
                                </span>
                                <span className="text-[11px] font-medium text-fg truncate">
                                  {cite.sourceName}
                                </span>
                              </div>
                              <span className="text-[10px] font-mono text-positive font-semibold shrink-0">
                                {cite.similarityScore}% relevance →
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Message Actions: Copy & Bookmark */}
                    <div className="mt-3 pt-2.5 border-t border-fg/[0.04] flex items-center gap-4 text-[11px] text-subtle">
                      <button
                        onClick={() => handleCopyMessage(message.content, message.id)}
                        className="flex items-center gap-1 hover:text-fg transition-colors"
                      >
                        {copiedMsgId === message.id ? (
                          <Check className="w-3 h-3 text-positive" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>{copiedMsgId === message.id ? 'Copied' : 'Copy'}</span>
                      </button>

                      <button
                        onClick={() => onBookmarkMessage(message)}
                        className="flex items-center gap-1 hover:text-accent transition-colors"
                      >
                        <Bookmark className="w-3 h-3" />
                        <span>Bookmark</span>
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Thinking Indicator */}
        {isThinking && (
          <div className="flex items-start gap-3 mr-auto">
            <div
              className="w-7 h-7 rounded-full shrink-0 mt-1 shadow-md flex items-center justify-center text-[10px] font-bold text-[#0c0c0c] animate-pulse"
              style={{
                background:
                  'linear-gradient(105deg, #f5c40a 0%, #dcae3f 40%, #6ac6a0 62%, #22c0cf 100%)',
              }}
            >
              AI
            </div>
            <div className="ai-speech-bubble py-3 px-4 flex items-center gap-2.5 text-xs text-subtle">
              <div className="live-dot" />
              <span className="animate-pulse text-accent">
                {executive.name} is inspecting verified company records...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Signature Composer Input Bar at Bottom */}
      <div className="p-4 sm:p-6 bg-canvas border-t border-fg/[0.06]">
        <div className="composer-shell max-w-4xl mx-auto">
          <div className="composer-glow" />

          <div className="composer-box p-3.5 sm:p-4 flex flex-col justify-between">
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isThinking}
                placeholder={`Ask ${executive.name} anything about ${executive.sourceFileFocus}...`}
                className="w-full bg-transparent text-xs sm:text-sm text-fg placeholder:text-subtle focus:outline-none border-none"
              />

              <div className="flex items-center gap-2 sm:gap-3 pt-2 border-t border-fg/[0.04]">
                {/* Round (+) button */}
                <button
                  type="button"
                  onClick={onOpenKnowledge}
                  className="chip-round"
                  title="Inspect Knowledge Sources"
                  style={{ width: 36, height: 36 }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </button>

                {/* Strict grounding toggle */}
                <button
                  type="button"
                  onClick={onToggleStrict}
                  aria-pressed={strictGrounding}
                  title={strictGrounding ? 'Strict: answers only when at least 60% of the question is covered by the documents' : 'Relaxed: answers from partial matches (40% coverage) and flags missing terms'}
                  className={`chip-pill ${strictGrounding ? 'active' : ''}`}
                  style={{ height: 36, fontSize: '0.8rem', padding: '0 12px' }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-7 7c0 2.6 1.4 4.8 3.5 6a1.5 1.5 0 0 1 .5 1.1V17h6v-.9c0-.4.2-.8.5-1.1A7 7 0 0 0 12 2z" />
                  </svg>
                  <span>{strictGrounding ? 'Strict grounding' : 'Relaxed grounding'}</span>
                </button>

                <div className="flex-1" />

                {/* Mic button */}
                <button
                  type="button"
                  className="p-1.5 text-soft hover:text-fg transition-colors"
                  title="Voice input"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="22" />
                  </svg>
                </button>

                {/* Ambient Send Button */}
                <button
                  type="submit"
                  disabled={!inputText.trim() || isThinking}
                  className="send-ambient-btn disabled:opacity-40"
                  style={{ width: 38, height: 38 }}
                  title="Send query"
                >
                  <div className="send-ambient-inner">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="12" y1="19" x2="12" y2="5" />
                      <polyline points="5 12 12 5 19 12" />
                    </svg>
                  </div>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

    </div>
  );
};
