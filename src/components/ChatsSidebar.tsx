import React, { useState } from 'react';
import { Search, Plus, Bookmark, Star, Trash2, HelpCircle, X, Sparkles } from 'lucide-react';

interface ChatsSidebarProps {
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  onOpenKnowledge: () => void;
  onOpenWidgetModal: () => void;
  bookmarkCount: number;
  trashCount: number;
  searchTerm: string;
  onSearchChange: (val: string) => void;
}

export const ChatsSidebar: React.FC<ChatsSidebarProps> = ({
  activeCategory,
  onSelectCategory,
  onOpenKnowledge,
  onOpenWidgetModal,
  bookmarkCount,
  trashCount,
  searchTerm,
  onSearchChange,
}) => {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <aside className="chats-sidebar">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-1.5">
          <h2 className="text-lg font-semibold text-fg tracking-tight">Chats</h2>
          <button
            onClick={() => {
              setShowSearch(!showSearch);
              if (showSearch) onSearchChange('');
            }}
            className="p-1.5 rounded-lg text-muted hover:text-fg hover:bg-fg/[0.06] transition-colors"
            title="Toggle Search"
          >
            {showSearch ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-[11px] font-normal text-subtle mb-4">
          All Conversations • 4 Executives
        </p>

        {/* Inline Search Bar */}
        {showSearch && (
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search chat history..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-surface-3 border border-fg/[0.1] rounded-xl px-3 py-1.5 text-xs text-fg placeholder:text-subtle focus:outline-none focus:border-[#ffd000]"
              autoFocus
            />
          </div>
        )}

        {/* Category List */}
        <div className="space-y-1">
          <button
            onClick={() => onSelectCategory('current')}
            className={`chats-menu-item ${activeCategory === 'current' ? 'active' : ''}`}
          >
            <span className="flex items-center gap-2.5 min-w-0 flex-1">
              <span className="w-4 h-4 flex items-center justify-center font-bold text-xs shrink-0">☷</span>
              <span className="truncate">Current</span>
            </span>
            <span className="chats-item-count shrink-0">4</span>
          </button>

          <button
            onClick={() => onSelectCategory('bookmark')}
            className={`chats-menu-item ${activeCategory === 'bookmark' ? 'active' : ''}`}
          >
            <span className="flex items-center gap-2.5 min-w-0 flex-1">
              <Bookmark className="w-4 h-4 shrink-0" />
              <span className="truncate">Saved Citations</span>
            </span>
            <span className="chats-item-count shrink-0">{bookmarkCount}</span>
          </button>

          <button
            onClick={() => onSelectCategory('favorites')}
            className={`chats-menu-item ${activeCategory === 'favorites' ? 'active' : ''}`}
          >
            <span className="flex items-center gap-2.5 min-w-0 flex-1">
              <Star className="w-4 h-4 shrink-0" />
              <span className="truncate">Priority Briefs</span>
            </span>
            <span className="chats-item-count shrink-0">12</span>
          </button>

          <button
            onClick={() => onSelectCategory('trash')}
            className={`chats-menu-item ${activeCategory === 'trash' ? 'active' : ''}`}
          >
            <span className="flex items-center gap-2.5 min-w-0 flex-1">
              <Trash2 className="w-4 h-4 shrink-0" />
              <span className="truncate">Archived</span>
            </span>
            <span className="chats-item-count shrink-0">{trashCount}</span>
          </button>
        </div>
      </div>

      {/* Bottom Knowledge Ingest Card & Footer */}
      <div className="space-y-4">
        {/* Ingest Documents Card */}
        <div onClick={onOpenKnowledge} className="invite-card">
          <div className="w-8 h-8 rounded-full border border-fg/20 bg-fg/10 flex items-center justify-center mx-auto mb-2 text-accent">
            <Plus className="w-4 h-4" />
          </div>
          <p className="text-xs font-semibold text-fg leading-tight">
            Ingest Documents &amp; Web
          </p>
          <p className="text-[10.5px] text-muted mt-1">
            Embed PDFs &amp; URLs into Vector Store
          </p>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-[9.5px] font-semibold text-faint tracking-wider uppercase">
            CITELY<br />STRICT GROUNDING ENGINE
          </p>
        </div>
      </div>
    </aside>
  );
};
