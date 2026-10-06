import React from 'react';
import { Bot, ShieldCheck, Sparkles, Sliders, Code2, Database, Globe } from 'lucide-react';

interface NavbarProps {
  chunkCount: number;
  docCount: number;
  onOpenSettings: () => void;
  onOpenWidgetModal: () => void;
  onLoadPreset: (presetId: string) => void;
  activePreset: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  chunkCount,
  docCount,
  onOpenSettings,
  onOpenWidgetModal,
  onLoadPreset,
  activePreset,
}) => {
  return (
    <header className="w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
          <Bot className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
              Citely <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">Enterprise 2.0</span>
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            Document & Website Grounded AI Assistant
          </p>
        </div>
      </div>

      {/* Preset Switcher for Demos */}
      <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 p-1 rounded-xl text-xs">
        <span className="text-slate-400 px-2 font-medium flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Demo Presets:
        </span>
        <button
          onClick={() => onLoadPreset('saas')}
          className={`px-2.5 py-1 rounded-lg transition-all ${
            activePreset === 'saas'
              ? 'bg-blue-600 text-white font-medium shadow-sm'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          Acme Cloud SaaS
        </button>
        <button
          onClick={() => onLoadPreset('hr')}
          className={`px-2.5 py-1 rounded-lg transition-all ${
            activePreset === 'hr'
              ? 'bg-blue-600 text-white font-medium shadow-sm'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          Nexus HR Policy
        </button>
        <button
          onClick={() => onLoadPreset('ecommerce')}
          className={`px-2.5 py-1 rounded-lg transition-all ${
            activePreset === 'ecommerce'
              ? 'bg-blue-600 text-white font-medium shadow-sm'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          NovaTech Store
        </button>
      </div>

      {/* Knowledge Base Metrics & Actions */}
      <div className="flex items-center gap-2.5">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
          <ShieldCheck className="w-4 h-4" />
          <span>Strict Anti-Hallucination</span>
        </div>

        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
          <Database className="w-3.5 h-3.5 text-blue-400" />
          <span>{docCount} Sources • {chunkCount} Chunks</span>
        </div>

        <button
          onClick={onOpenWidgetModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-xs font-medium text-slate-200 transition-colors"
          title="Get Website Embed Code"
        >
          <Code2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>Embed Widget</span>
        </button>

        <button
          onClick={onOpenSettings}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-xs font-medium text-slate-200 transition-colors"
          title="Configure RAG Parameters"
        >
          <Sliders className="w-3.5 h-3.5 text-purple-400" />
          <span>Settings</span>
        </button>
      </div>
    </header>
  );
};
