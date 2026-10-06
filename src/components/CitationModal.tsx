import React, { useState } from 'react';
import { Citation } from '../lib/rag/types';
import { X, FileText, Globe, Check, Copy, ShieldCheck } from 'lucide-react';

interface CitationModalProps {
  citation: Citation | null;
  onClose: () => void;
}

export const CitationModal: React.FC<CitationModalProps> = ({ citation, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!citation) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(citation.excerpt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-surface border border-fg/[0.1] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-fg">
        {/* Header */}
        <div className="px-6 py-5 border-b border-fg/[0.06] flex items-center justify-between bg-surface-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#ffd000] text-[#0c0c0c] flex items-center justify-center font-bold text-xs">
              {citation.index}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-fg flex items-center gap-2">
                Verified Citation [{citation.index}]
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#86ca8a]/15 text-positive font-semibold">
                  {citation.similarityScore}% relevance
                </span>
              </h3>
              <p className="text-xs text-subtle truncate max-w-xs">{citation.sourceName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-subtle hover:text-fg hover:bg-fg/[0.08] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div>
            <span className="text-[11px] font-semibold text-subtle uppercase tracking-wider block mb-1">
              Document Location:
            </span>
            <div className="text-xs text-soft font-mono bg-surface-3 p-2.5 rounded-xl border border-fg/[0.06] break-all">
              {citation.pageOrUrl || citation.sourceName}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-subtle uppercase tracking-wider">
                Verbatim Chunk Excerpt:
              </span>
              <button
                onClick={handleCopy}
                className="text-[11px] text-accent font-semibold hover:text-accent-hi flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy Excerpt'}
              </button>
            </div>
            <div className="text-xs text-fg bg-surface-3 border border-fg/[0.06] rounded-xl p-4 leading-relaxed max-h-56 overflow-y-auto whitespace-pre-wrap font-sans">
              "{citation.excerpt}"
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-positive bg-[#86ca8a]/10 border border-[#86ca8a]/20 p-3 rounded-xl font-medium">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Strictly grounded via Cosine Vector Search + BM25 Lexical Re-ranking.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-fg/[0.06] bg-surface-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-fg text-canvas hover:bg-fg/85 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
