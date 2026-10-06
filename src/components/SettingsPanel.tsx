import React from 'react';
import { RAGConfig } from '../lib/rag/types';
import { X, Sliders, ShieldCheck, Cpu } from 'lucide-react';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  config: RAGConfig;
  onChangeConfig: (newConfig: RAGConfig) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  config,
  onChangeConfig,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-surface border border-fg/[0.1] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-fg">
        {/* Header */}
        <div className="px-6 py-5 border-b border-fg/[0.06] flex items-center justify-between bg-surface-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-fg/[0.06] border border-fg/[0.1] text-accent flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-fg">RAG Engine &amp; Retrieval Parameters</h3>
              <p className="text-xs text-subtle">Configure vector chunk bounds and anti-hallucination</p>
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
        <div className="p-6 space-y-5">
          {/* Top-K Chunks Slider */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-fg mb-1.5">
              <span>Top-K Retrieved Context Passages</span>
              <span className="font-mono text-accent">{config.topK} Chunks</span>
            </div>
            <input
              type="range"
              min="1"
              max="8"
              step="1"
              value={config.topK}
              onChange={(e) =>
                onChangeConfig({ ...config, topK: parseInt(e.target.value, 10) })
              }
              className="w-full accent-[#ffd000] cursor-pointer"
            />
            <span className="text-[11px] text-subtle block mt-1">
              Controls how many document sections are provided to the Executive Assistant.
            </span>
          </div>

          {/* Similarity Threshold Slider */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-fg mb-1.5">
              <span>Cosine Similarity Cutoff Threshold</span>
              <span className="font-mono text-positive">{config.similarityThreshold}</span>
            </div>
            <input
              type="range"
              min="0.10"
              max="0.50"
              step="0.02"
              value={config.similarityThreshold}
              onChange={(e) =>
                onChangeConfig({ ...config, similarityThreshold: parseFloat(e.target.value) })
              }
              className="w-full accent-[#86ca8a] cursor-pointer"
            />
            <span className="text-[11px] text-subtle block mt-1">
              Passages scoring lower than this value are eliminated to guarantee factual accuracy.
            </span>
          </div>

          {/* Anti-Hallucination Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-surface-2 border border-fg/[0.06]">
            <div>
              <span className="text-xs font-semibold text-fg block">
                Strict Anti-Hallucination Guardrail
              </span>
              <span className="text-[11px] text-subtle">
                Refuse to speculate if verified company records do not contain the answer
              </span>
            </div>
            <input
              type="checkbox"
              checked={config.strictGroundingOnly}
              onChange={(e) =>
                onChangeConfig({ ...config, strictGroundingOnly: e.target.checked })
              }
              className="w-4 h-4 accent-[#ffd000] cursor-pointer"
            />
          </div>

          {/* Provider Selection */}
          <div>
            <span className="text-xs font-semibold text-fg block mb-1.5">
              Generator Model Backend:
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => onChangeConfig({ ...config, provider: 'local_rag' })}
                className={`p-3 rounded-xl border text-left transition-all ${
                  config.provider === 'local_rag'
                    ? 'border-[#ffd000] bg-[#ffd000]/10 text-accent'
                    : 'border-fg/[0.06] bg-surface-2 text-subtle hover:text-fg'
                }`}
              >
                <span className="font-semibold block text-fg">Client TF-IDF / Vectors</span>
                <span className="text-[10px] text-subtle">100% Private, Zero External Latency</span>
              </button>

              <button
                type="button"
                onClick={() => onChangeConfig({ ...config, provider: 'openai' })}
                className={`p-3 rounded-xl border text-left transition-all ${
                  config.provider === 'openai'
                    ? 'border-[#ffd000] bg-[#ffd000]/10 text-accent'
                    : 'border-fg/[0.06] bg-surface-2 text-subtle hover:text-fg'
                }`}
              >
                <span className="font-semibold block text-fg">Custom LLM API</span>
                <span className="text-[10px] text-subtle">GPT-4o, Claude 3.5, or Ollama</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-fg/[0.06] bg-surface-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-fg text-canvas hover:bg-fg/85 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Save &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
};
