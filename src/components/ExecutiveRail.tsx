import React from 'react';
import {
  MessageSquare,
  MessageCircle,
  Settings,
  Bookmark,
  User,
  FileText,
  Home,
} from 'lucide-react';
import { RadialLogo } from './RadialLogo';
import { ThemeToggle } from './ThemeToggle';

interface ExecutiveRailProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenKnowledge: () => void;
  onOpenSettings: () => void;
  onGoHome: () => void;
}

export const ExecutiveRail: React.FC<ExecutiveRailProps> = ({
  activeTab,
  onSelectTab,
  onOpenKnowledge,
  onOpenSettings,
  onGoHome,
}) => {
  return (
    <aside className="espresso-rail">
      {/* Top Brand Mark (Radial 24-ray logo) */}
      <div
        onClick={onGoHome}
        className="rail-logo-btn group"
        title="Return to Citely Homepage"
      >
        <RadialLogo size={32} />
      </div>

      {/* Middle Nav Icons */}
      <nav className="rail-nav-list">
        {/* Home Overview */}
        <button
          onClick={onGoHome}
          className="rail-nav-item"
          title="Homepage &amp; Pricing"
        >
          <Home className="w-5 h-5" />
        </button>

        {/* Chat / Conversations with Badge */}
        <button
          onClick={() => onSelectTab('chat')}
          className={`rail-nav-item ${activeTab === 'chat' ? 'active' : ''}`}
          title="Active Executive Chats"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="rail-badge">4</span>
        </button>

        {/* Executive Boardroom */}
        <button
          onClick={() => onSelectTab('executives')}
          className={`rail-nav-item ${activeTab === 'executives' ? 'active' : ''}`}
          title="Executive Boardroom"
        >
          <MessageCircle className="w-5 h-5" />
        </button>

        {/* Knowledge Documents */}
        <button
          onClick={onOpenKnowledge}
          className="rail-nav-item"
          title="Knowledge Documents &amp; URL Indexer"
        >
          <FileText className="w-5 h-5" />
        </button>

        {/* Saved Citations */}
        <button
          onClick={() => onSelectTab('saved')}
          className={`rail-nav-item ${activeTab === 'saved' ? 'active' : ''}`}
          title="Bookmarked Citations"
        >
          <Bookmark className="w-5 h-5" />
        </button>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className="rail-nav-item"
          title="System Settings &amp; LLM Keys"
        >
          <Settings className="w-5 h-5" />
        </button>

        {/* User profile */}
        <button
          onClick={() => onSelectTab('profile')}
          className="rail-nav-item"
          title="Executive Workspace Profile"
        >
          <User className="w-5 h-5" />
        </button>
      </nav>

      {/* Theme toggle + user avatar with status badge */}
      <div className="flex flex-col items-center gap-3 shrink-0">
        <ThemeToggle className="compact" />
        <button
          onClick={() => onSelectTab('profile')}
          className="relative rail-avatar-wrap"
          title="View Workspace Profile"
        >
          <div className="rail-avatar">AK</div>
          <span className="rail-badge" style={{ top: '-6px', right: '-10px' }}>
            PRO
          </span>
        </button>
      </div>
    </aside>
  );
};
