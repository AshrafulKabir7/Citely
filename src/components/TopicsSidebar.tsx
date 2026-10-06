import React from 'react';
import { ExecutiveDefinition, ExecutiveId } from '../lib/rag/types';
import { Share2, Plus, Sparkles, ShieldCheck } from 'lucide-react';
import { executiveInitials } from '../lib/rag/executives';

interface TopicsSidebarProps {
  executives: ExecutiveDefinition[];
  activeExecutiveId: ExecutiveId;
  onSelectExecutive: (id: ExecutiveId) => void;
  onOpenNewConversation: () => void;
  onOpenKnowledge: () => void;
  onOpenDirectory: () => void;
  onShareTopic: (topicTitle: string) => void;
}

export const TopicsSidebar: React.FC<TopicsSidebarProps> = ({
  executives,
  activeExecutiveId,
  onSelectExecutive,
  onOpenNewConversation,
  onOpenKnowledge,
  onOpenDirectory,
  onShareTopic,
}) => {
  return (
    <aside className="topics-sidebar">
      <div className="flex-1 overflow-y-auto pr-1">
        {/* Header */}
        <div className="flex items-center justify-between mb-5 px-1">
          <div className="flex items-center gap-2">
            <span className="text-base text-accent">💬</span>
            <h2 className="text-base font-semibold text-fg tracking-tight">Executives</h2>
          </div>
          <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-fg/[0.05] text-muted">
            {executives.length} Active
          </span>
        </div>

        {/* Executives & Topics List */}
        <div className="space-y-1.5">
          {executives.map((exec, idx) => {
            const isActive = activeExecutiveId === exec.id;

            return (
              <div
                key={exec.id}
                onClick={() => onSelectExecutive(exec.id)}
                className={`topic-item ${isActive ? 'active' : ''}`}
              >
                {/* Left: Avatar & Text */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm text-[11px] font-bold"
                    style={{
                      background: isActive
                        ? 'linear-gradient(135deg, #ffd000 0%, #86ca8a 50%, #78d0cd 100%)'
                        : 'var(--surface-3)',
                      color: isActive ? '#0c0c0c' : 'var(--fg)',
                      border: isActive ? 'none' : '1px solid var(--hairline-strong)',
                    }}
                  >
                    {executiveInitials(exec.name)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs font-semibold text-fg truncate leading-tight">
                      {exec.name}
                    </h3>
                    <p className="text-[10px] text-subtle truncate mt-0.5">
                      {exec.role}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-subtle mt-1 font-medium">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onShareTopic(exec.name);
                        }}
                        className="flex items-center gap-0.5 hover:text-fg transition-colors"
                      >
                        <Share2 className="w-2.5 h-2.5" /> Share
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenKnowledge();
                        }}
                        className="flex items-center gap-0.5 hover:text-accent transition-colors cursor-pointer"
                      >
                        <Plus className="w-2.5 h-2.5" /> Sources
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right status badge */}
                <div className="shrink-0 flex items-center gap-1">
                  {isActive && (
                    <div className="w-2 h-2 rounded-full bg-[#ffd000] shadow-[0_0_8px_#ffd000]" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Directory and New Conversation button */}
      <div className="pt-4 border-t border-fg/[0.06] space-y-2">
        <button
          onClick={onOpenNewConversation}
          className="w-full py-2.5 px-3 rounded-xl bg-fg text-canvas hover:bg-fg/85 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>New Executive Brief</span>
        </button>

        <button
          onClick={onOpenDirectory}
          className="w-full py-2 px-3 rounded-xl bg-transparent hover:bg-fg/[0.05] text-muted hover:text-fg text-xs font-medium transition-colors text-center cursor-pointer"
        >
          Company Directory &amp; Roles
        </button>
      </div>
    </aside>
  );
};
