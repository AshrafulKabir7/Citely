import { useSyncExternalStore } from 'react';

export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'citely-theme';
const listeners = new Set<() => void>();

function readInitialTheme(): Theme {
  const attr = document.documentElement.getAttribute('data-theme');
  if (attr === 'light' || attr === 'dark') return attr;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    /* storage unavailable */
  }
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

let currentTheme: Theme = readInitialTheme();
applyTheme(currentTheme);

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  root.style.colorScheme = theme;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme === 'light' ? '#f7f6f2' : '#0c0c0c');
}

export function setTheme(theme: Theme) {
  if (theme === currentTheme) return;
  currentTheme = theme;

  // Suppress per-element transitions during the swap so colors change in one frame
  const root = document.documentElement;
  root.classList.add('theme-switching');
  applyTheme(theme);
  window.setTimeout(() => root.classList.remove('theme-switching'), 50);

  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* storage unavailable */
  }
  listeners.forEach((l) => l());
}

type ViewTransitionDocument = Document & {
  startViewTransition?: (cb: () => void) => { ready: Promise<void> };
};

/**
 * Flip the theme. When an origin point is given and the browser supports
 * View Transitions, the new theme expands as a circle from that point.
 */
export function toggleTheme(origin?: { x: number; y: number }) {
  const next: Theme = currentTheme === 'dark' ? 'light' : 'dark';
  const doc = document as ViewTransitionDocument;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!origin || !doc.startViewTransition || reduceMotion) {
    setTheme(next);
    return;
  }

  const radius = Math.hypot(
    Math.max(origin.x, window.innerWidth - origin.x),
    Math.max(origin.y, window.innerHeight - origin.y)
  );
  const transition = doc.startViewTransition(() => setTheme(next));
  transition.ready
    .then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${origin.x}px ${origin.y}px)`,
            `circle(${radius}px at ${origin.x}px ${origin.y}px)`,
          ],
        },
        {
          duration: 550,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          pseudoElement: '::view-transition-new(root)',
        }
      );
    })
    .catch(() => {
      /* transition skipped */
    });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useTheme(): [Theme, typeof toggleTheme] {
  const theme = useSyncExternalStore(subscribe, () => currentTheme);
  return [theme, toggleTheme];
}
