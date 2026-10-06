import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../lib/theme';

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const [theme, toggle] = useTheme();
  const isDark = theme === 'dark';
  const label = isDark ? 'Switch to day mode' : 'Switch to night mode';

  return (
    <button
      type="button"
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        toggle({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
      }}
      className={`theme-toggle ${isDark ? 'is-dark' : 'is-light'} ${className}`}
      aria-label={label}
      title={label}
    >
      <span className="theme-toggle-track">
        <Sun className="theme-toggle-icon sun" />
        <Moon className="theme-toggle-icon moon" />
        <span className="theme-toggle-thumb" />
      </span>
    </button>
  );
};
