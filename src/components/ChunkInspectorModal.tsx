import React from 'react';
import { IngestedDocument } from '../lib/rag/types';
import { X, Layers, Hash } from 'lucide-react';

interface ChunkInspectorModalProps {
  document: IngestedDocument | null;
  onClose: () => void;
}

export const ChunkInspectorModal: React.FC<ChunkInspectorModalProps> = ({
  document,
  onClose,
}) => {
  if (!document) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-surface border border-fg/[0.1] rounded-2xl w-full max-w-2xl max-h-[85vh] shadow-2xl flex flex-col overflow-hidden text-fg">
        {/* Header */}
        <div className="px-6 py-4 border-b border-fg/[0.06] flex items-center justify-between bg-surface-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-fg/[0.06] border border-fg/[0.1] text-accent flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-fg flex items-center gap-2">
                RAG Vector Chunk Inspector
                <span className="text-[10px] bg-fg/[0.06] text-accent px-2 py-0.5 rounded font-mono font-semibold">
                  {document.chunkCount} Chunks
                </span>
              </h3>
              <p className="text-xs text-subtle truncate max-w-md">{document.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-subtle hover:text-fg hover:bg-fg/[0.08] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Chunks List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-canvas-alt">
          {document.chunks.map((chunk, idx) => (
            <div
              key={chunk.id}
              className="bg-surface-2 border border-fg/[0.06] rounded-xl p-3.5 space-y-2"
            >
              <div className="flex items-center justify-between text-xs text-subtle border-b border-fg/[0.04] pb-2">
                <span className="font-mono text-accent font-medium flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5" /> Chunk #{idx + 1} ({chunk.id})
                </span>
                <div className="flex items-center gap-2 text-[11px]">
                  <span>~{chunk.tokensEstimate} tokens</span>
                  <span>•</span>
                  <span className="text-positive font-mono font-medium">256-dim vector generated</span>
                </div>
              </div>

              <p className="text-xs text-fg leading-relaxed whitespace-pre-wrap font-sans">
                {chunk.content}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-fg/[0.06] bg-surface-2 flex justify-between items-center text-xs text-subtle">
          <span>Sliding overlap: 50 words • Tokenizer: Subword BPE Vector</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-fg text-canvas hover:bg-fg/85 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
