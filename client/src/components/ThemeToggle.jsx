/**
 * @file ThemeToggle.jsx
 * @description Light/dark mode toggle button. Persists preference to
 *              localStorage and respects the system's prefers-color-scheme
 *              on first visit. Toggles data-theme on <html>.
 * @exports ThemeToggle (default)
 */

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

/** localStorage key for persisted theme preference. */
const STORAGE_KEY = 'traceflow-theme';

/**
 * Resolve the initial theme from localStorage or system preference.
 *
 * @returns {'light' | 'dark'}
 */
function getInitialTheme() {
  /* Check localStorage first. */
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'dark' || stored === 'light') return stored;

  /* Fall back to OS preference. */
  if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark';
  return 'light';
}

/**
 * Apply theme to the <html> element.
 *
 * @param {'light' | 'dark'} theme
 */
function applyTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
}

/**
 * Theme toggle button with animated sun/moon icons.
 *
 * @returns {JSX.Element}
 */
export default function ThemeToggle() {
  const [theme, setTheme] = useState(getInitialTheme);

  /* Apply theme on mount and whenever it changes. */
  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  /** Toggle between light and dark. */
  const toggle = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggle}
      className="w-9 h-9 rounded-lg flex items-center justify-center
                 border border-[var(--color-border)]
                 text-[var(--color-text-muted)]
                 hover:text-[var(--color-accent)]
                 hover:border-[var(--color-accent)]
                 transition-colors"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
