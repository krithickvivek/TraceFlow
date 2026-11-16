/**
 * @file useLocalProgress.js
 * @description Hook for tracking algorithm completion progress. Saves to
 *              backend for authenticated users, localStorage for guests.
 * @module hooks/useLocalProgress
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { progressAPI } from '../services/api';
import { log } from '../utils/logger';

/** localStorage key for guest progress. */
const PROGRESS_KEY = 'traceflow_progress';

/**
 * Load guest progress from localStorage.
 * @returns {Object<string, boolean>} Map of slug → completed.
 */
function loadGuestProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Hook for saving and loading algorithm progress.
 *
 * @returns {{
 *   progress: Object<string, boolean>,
 *   markCompleted: (slug: string, stepsExplored: number) => Promise<void>,
 *   isCompleted: (slug: string) => boolean
 * }}
 */
export function useLocalProgress() {
  const { isAuthenticated } = useAuth();
  const [progress, setProgress] = useState({});

  /* Load progress on mount. */
  useEffect(() => {
    async function load() {
      if (isAuthenticated) {
        try {
          const data = await progressAPI.getAll();
          const map = {};
          data.progress.forEach((p) => { map[p.algorithm_slug] = true; });
          setProgress(map);
        } catch {
          setProgress(loadGuestProgress());
        }
      } else {
        setProgress(loadGuestProgress());
      }
    }
    load();
  }, [isAuthenticated]);

  /**
   * Mark an algorithm as completed.
   * @param {string} slug
   * @param {number} stepsExplored
   */
  const markCompleted = useCallback(async (slug, stepsExplored) => {
    if (isAuthenticated) {
      try {
        await progressAPI.save(slug, stepsExplored);
      } catch (err) {
        log('Failed to save progress to server:', err);
      }
    }

    /* Always update local state + localStorage. */
    setProgress((prev) => {
      const next = { ...prev, [slug]: true };
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(next));
      return next;
    });
  }, [isAuthenticated]);

  /**
   * Check if an algorithm is completed.
   * @param {string} slug
   * @returns {boolean}
   */
  const isCompleted = useCallback((slug) => !!progress[slug], [progress]);

  return { progress, markCompleted, isCompleted };
}
