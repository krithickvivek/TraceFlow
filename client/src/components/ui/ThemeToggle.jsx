/**
 * @file ThemeToggle.jsx
 * @description Light/dark mode toggle button for TraceFlow V2. Reads
 *              `prefers-color-scheme` as the default, persists user choice
 *              in localStorage under `traceflow-theme`, and applies
 *              `data-theme` on the `<html>` element.
 * @module components/ui/ThemeToggle
 */

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

/** localStorage key for persisted theme preference. */
const STORAGE_KEY = 'traceflow-theme';

/**
 * Resolves the initial theme: stored preference > OS preference > dark.
 * @returns {'dark'|'light'}
 */
function getInitialTheme() {
  if (typeof window === 'undefined') return 'dark';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  if (window.matchMedia?.('(prefers-color-scheme: light)').matches) return 'light';
  return 'dark';
}

/**
 * Sun/Moon toggle button that switches between light and dark themes.
 * @returns {JSX.Element}
 */
export default function ThemeToggle() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.setAttribute('data-theme', 'light');
    } else {
      root.removeAttribute('data-theme');
    }
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  function toggle() {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="flex items-center justify-center w-9 h-9 rounded-lg
                 border border-[var(--border-subtle)] text-tf-text2
                 hover:text-tf-text hover:bg-tf-surface
                 transition-colors duration-200"
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
