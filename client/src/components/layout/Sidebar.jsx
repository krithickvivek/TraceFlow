/**
 * @file Sidebar.jsx
 * @description Compact algorithm navigation sidebar. Categories are collapsible
 *              sections with ONE icon per category header (not per algorithm).
 *              Search bar filters algorithms. Collapsed state is a clean icon rail.
 *              Supports Sorting, Searching, and Backtracking categories.
 * @module components/layout/Sidebar
 */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUpDown, Search, Grid3X3, Check, ChevronLeft, ChevronRight,
  ChevronDown, ChevronUp, LogIn, Undo2, GitBranch
} from 'lucide-react';
import { algorithms } from '../../algorithms/index.js';
import { useTrace, ActionTypes } from '../../context/TraceContext';
import { useAuth } from '../../context/AuthContext';
import { useLocalProgress } from '../../hooks/useLocalProgress';
import ThemeToggle from '../ui/ThemeToggle';
import Logo, { LogoMark } from '../ui/Logo';

/** localStorage key for sidebar collapsed state. */
const STORAGE_KEY = 'traceflow_sidebar';

/**
 * Get icon component for a category.
 *
 * @param {string} category
 * @returns {Function}
 */
function getCategoryIcon(category) {
  if (category === 'Searching') return Search;
  if (category === 'Backtracking') return Grid3X3;
  if (category === 'Graph') return GitBranch;
  return ArrowUpDown;
}

/**
 * Group algorithms by category, maintaining insertion order.
 *
 * @param {Object} algos
 * @returns {Object<string, Array<{slug: string, name: string, category: string}>>}
 */
function groupByCategory(algos) {
  const groups = {};
  Object.entries(algos).forEach(([slug, algo]) => {
    const { category, name } = algo.metadata;
    if (!groups[category]) groups[category] = [];
    groups[category].push({ slug, name, category });
  });
  return groups;
}

/**
 * Sidebar component with Sorting, Searching, and Backtracking categories.
 *
 * @returns {JSX.Element}
 */
export default function Sidebar() {
  const navigate = useNavigate();
  const { state, dispatch } = useTrace();
  const { user, isAuthenticated } = useAuth();
  const { isCompleted } = useLocalProgress();
  const searchRef = useRef(null);

  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) === 'true'; } catch { return false; }
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [openCategories, setOpenCategories] = useState({
    Sorting: true,
    Searching: true,
    Backtracking: true,
    Graph: true,
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, String(collapsed)); } catch { /* noop */ }
  }, [collapsed]);

  const groups = useMemo(() => groupByCategory(algorithms), []);

  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return groups;
    const q = searchQuery.toLowerCase().trim();
    const result = {};
    Object.entries(groups).forEach(([cat, algos]) => {
      const f = algos.filter(a => a.name.toLowerCase().includes(q) || cat.toLowerCase().includes(q));
      if (f.length > 0) result[cat] = f;
    });
    return result;
  }, [groups, searchQuery]);

  const handleSelect = useCallback((slug) => {
    dispatch({ type: ActionTypes.SET_ALGORITHM, payload: slug });
    /* Only auto-generate for bar-chart algorithms; backtracking needs manual input */
    const algo = algorithms[slug];
    if (algo?.metadata?.category !== 'Backtracking' && algo?.metadata?.category !== 'Graph') {
      dispatch({ type: ActionTypes.GENERATE_STEPS, algorithms });
    }
    navigate(`/visualizer/${slug}`);
  }, [dispatch, navigate]);

  const toggleCategory = (cat) => {
    setOpenCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  /* ── Mobile: horizontal pill row ── */
  const mobilePills = (
    <div className="md:hidden flex items-center gap-1.5 px-3 py-1.5 overflow-x-auto bg-tf-bg2 border-b border-[var(--border-subtle)] scrollbar-hide">
      {Object.entries(filteredGroups).flatMap(([, algos]) =>
        algos.map((algo) => {
          const active = state.selectedAlgorithm === algo.slug;
          return (
            <button
              key={algo.slug}
              onClick={() => handleSelect(algo.slug)}
              className={`whitespace-nowrap px-3 py-1 rounded-full text-[11px] font-body transition-colors border-none cursor-pointer shrink-0 ${
                active ? 'bg-tf-primary/20 text-tf-primary font-semibold' : 'text-tf-text2 hover:text-tf-text'
              }`}
            >
              {algo.name}
            </button>
          );
        })
      )}
    </div>
  );

  /* ── Desktop sidebar ── */
  return (
    <>
      {mobilePills}

      <aside
        className={`hidden md:flex flex-col bg-tf-bg2 border-r border-[var(--border-subtle)] h-full transition-[width] duration-200 ease-in-out overflow-hidden shrink-0 ${
          collapsed ? 'w-12' : 'w-52'
        }`}
      >
        {/* Home logo link — hidden when Navbar is visible (authenticated) */}
        {!isAuthenticated && (
          <div className={`flex items-center border-b border-[var(--border-subtle)] shrink-0 ${
            collapsed ? 'justify-center py-2.5' : 'px-3 py-2.5'
          }`}>
            {collapsed ? (
              <Link to="/" className="flex items-center justify-center" title="Back to Home">
                <LogoMark className="w-7 h-7" />
              </Link>
            ) : (
              <Logo size="sm" linkToHome />
            )}
          </div>
        )}

        {/* Header */}
        <div className={`flex items-center h-10 border-b border-[var(--border-subtle)] shrink-0 ${
          collapsed ? 'justify-center' : 'justify-between px-3'
        }`}>
          {!collapsed && (
            <span className="font-body text-[10px] font-semibold uppercase tracking-widest text-tf-muted">
              Algorithms
            </span>
          )}
          <button
            onClick={() => setCollapsed(p => !p)}
            className="flex items-center justify-center w-7 h-7 rounded-md text-tf-muted hover:text-tf-text transition-colors bg-transparent border-none cursor-pointer"
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* Search (expanded only) */}
        {!collapsed && (
          <div className="px-2 py-2 shrink-0">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-tf-muted pointer-events-none" />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full bg-tf-bg border border-[var(--border-subtle)] rounded-md pl-7 pr-2 py-1 text-[11px] text-tf-text placeholder:text-tf-muted focus:outline-none focus:border-tf-blue transition-colors"
              />
            </div>
          </div>
        )}

        {/* Algorithm groups */}
        <div className="flex-1 overflow-y-auto">
          {Object.entries(filteredGroups).map(([category, algos]) => {
            const Icon = getCategoryIcon(category);
            const isOpen = openCategories[category] !== false;

            if (collapsed) {
              /* Collapsed: just one static icon per category, no clickable items */
              return (
                <div key={category} className="flex justify-center py-2">
                  <div className="text-tf-muted" title={category}>
                    <Icon size={18} />
                  </div>
                </div>
              );
            }

            /* Expanded: collapsible category with algorithm list */
            return (
              <div key={category}>
                {/* Category header — clickable to toggle */}
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-left bg-transparent border-none cursor-pointer hover:bg-[var(--sidebar-hover)] transition-colors"
                >
                  <Icon size={13} className="text-tf-muted shrink-0" />
                  <span className="font-body text-[11px] font-bold uppercase tracking-wider text-tf-muted flex-1">
                    {category}
                  </span>
                  <span className="text-[9px] text-tf-muted font-mono mr-1">
                    {algos.length}
                  </span>
                  <span className="text-tf-muted">
                    {isOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </span>
                </button>

                {/* Algorithm items */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      {algos.map(algo => {
                        const active = state.selectedAlgorithm === algo.slug;
                        const completed = isCompleted(algo.slug);
                        return (
                          <button
                            key={algo.slug}
                            onClick={() => handleSelect(algo.slug)}
                            className={`w-full flex items-center gap-2 pl-8 pr-3 py-1.5 font-body text-[12px] transition-all duration-150 border-none cursor-pointer text-left ${
                              active
                                ? 'border-l-[3px] border-l-[var(--sidebar-selected-border)] bg-[var(--sidebar-selected-bg)] text-tf-text font-semibold'
                                : 'border-l-[3px] border-l-transparent text-tf-text2 hover:text-tf-text hover:bg-[var(--sidebar-hover)] bg-transparent'
                            }`}
                          >
                            {completed && <Check size={11} className="text-tf-green shrink-0" />}
                            <span className="truncate">{algo.name}</span>
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Footer — only show for non-authenticated users (authenticated have navbar) */}
        {!isAuthenticated && (
          <div className="border-t border-[var(--border-subtle)] px-2 py-1.5 shrink-0 flex items-center justify-center gap-2">
            <ThemeToggle />
            {!collapsed && (
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-1 text-[10px] text-tf-muted hover:text-tf-text bg-transparent border-none cursor-pointer"
              >
                <LogIn size={11} /> Login
              </button>
            )}
          </div>
        )}
      </aside>
    </>
  );
}
