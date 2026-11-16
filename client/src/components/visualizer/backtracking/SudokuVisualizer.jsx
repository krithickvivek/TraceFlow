/**
 * @file SudokuVisualizer.jsx
 * @description Dedicated 9x9 Sudoku board visualizer with thick 3x3 box borders.
 *              Reads from TraceContext. Fixed (clue) cells are displayed with brighter
 *              text. Placed cells use accent-primary color. Cell states drive background
 *              color via smooth CSS transitions.
 * @module components/visualizer/backtracking/SudokuVisualizer
 */

import { useMemo } from 'react';
import { useTrace } from '../../../context/TraceContext';
import BacktrackingLegend from './BacktrackingLegend';

/* ── Grid dimensions ── */
/** @constant {number} */
const GRID_SIZE = 9;
/** @constant {number} */
const BOX_SIZE = 3;

/* ── State → background color mapping ── */
const STATE_BG = {
  fixed: 'var(--bg-surface)',
  empty: 'var(--bg-card)',
  trying: '#FBBF24',          /* Amber/yellow — currently attempting */
  placed: '#22C55E',          /* Green — successfully placed */
  conflict: '#EF4444',        /* Red — conflict */
  backtrack: 'rgba(239,68,68,0.25)', /* Light red — backtracking */
  solved: '#3B82F6',          /* Blue — final solved */
};

/* ── State → text color mapping ── */
const STATE_TEXT = {
  fixed: 'var(--text-primary)',
  empty: 'transparent',
  trying: '#000',
  placed: 'white',
  conflict: 'white',
  backtrack: '#EF4444',
  solved: 'white',
};

/**
 * Build a highlight lookup from step.highlightCells.
 *
 * @param {Array<{row: number, col: number, state: string}>|undefined} highlights
 * @returns {Map<string, string>}
 */
function buildHighlightMap(highlights) {
  const map = new Map();
  if (!highlights) return map;
  for (const h of highlights) {
    map.set(`${h.row},${h.col}`, h.state);
  }
  return map;
}

/**
 * Determine if a cell is on a 3x3 box boundary.
 *
 * @param {number} r - Row index.
 * @param {number} c - Column index.
 * @returns {{ borderRight: boolean, borderBottom: boolean }}
 */
function isBoxBoundary(r, c) {
  return {
    borderRight: (c + 1) % BOX_SIZE === 0 && c < GRID_SIZE - 1,
    borderBottom: (r + 1) % BOX_SIZE === 0 && r < GRID_SIZE - 1,
  };
}

/**
 * Sudoku board visualizer. Renders a 9x9 grid with 3x3 box separators,
 * color-coded cell states, and smooth transitions.
 *
 * @returns {JSX.Element}
 */
export default function SudokuVisualizer() {
  const { state } = useTrace();
  const { steps, currentStep } = state;

  const step = currentStep >= 0 && currentStep < steps.length ? steps[currentStep] : null;
  const grid = step?.grid || null;

  const highlightMap = useMemo(() => buildHighlightMap(step?.highlightCells), [step]);

  if (!grid || grid.length !== GRID_SIZE) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-tf-muted text-sm font-mono">
          Click &quot;Generate&quot; to start solving the puzzle.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-2">
      {/* Sudoku board */}
      <div
        className="inline-grid rounded-lg overflow-hidden"
        style={{
          gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
          border: '3px solid var(--accent-primary, #6C63FF)',
          width: 'min(320px, 85vw, 55vh)',
          height: 'min(320px, 85vw, 55vh)',
        }}
      >
        {grid.map((row, r) =>
          row.map((cell, c) => {
            const key = `${r},${c}`;
            const hlState = highlightMap.get(key);
            const bounds = isBoxBoundary(r, c);

            /** Determine cell value and state. */
            const isObj = typeof cell === 'object' && cell !== null;
            const value = isObj ? cell.value : cell;
            const cellState = isObj ? cell.state : (value > 0 ? 'fixed' : 'empty');

            /** Override bg if highlighted. */
            let bg = STATE_BG[cellState] || STATE_BG.empty;
            let textColor = STATE_TEXT[cellState] || STATE_TEXT.empty;

            if (hlState === 'danger') {
              bg = STATE_BG.conflict;
              textColor = STATE_TEXT.conflict;
            } else if (hlState === 'success') {
              bg = STATE_BG.placed;
              textColor = STATE_TEXT.placed;
            } else if (hlState === 'active') {
              bg = STATE_BG.trying;
              textColor = STATE_TEXT.trying;
            } else if (hlState === 'warn') {
              bg = 'rgba(255,179,71,0.3)';
              textColor = 'var(--text-primary)';
            } else if (hlState === 'subtle') {
              bg = 'rgba(108,99,255,0.06)';
            }

            const isActive = step?.row === r && step?.col === c;

            return (
              <div
                key={key}
                className={`flex items-center justify-center font-mono select-none
                           transition-all duration-200 ease-in-out
                           ${isActive ? 'ring-2 ring-[var(--accent-primary,#6C63FF)] ring-inset z-10' : ''}`}
                style={{
                  backgroundColor: bg,
                  color: textColor,
                  fontSize: '16px',
                  fontWeight: cellState === 'fixed' ? 600 : 400,
                  borderRight: bounds.borderRight
                    ? '2px solid var(--text-secondary)'
                    : '0.5px solid var(--border-subtle)',
                  borderBottom: bounds.borderBottom
                    ? '2px solid var(--text-secondary)'
                    : '0.5px solid var(--border-subtle)',
                  aspectRatio: '1 / 1',
                }}
              >
                {value > 0 ? value : ''}
              </div>
            );
          })
        )}
      </div>

      {/* Legend */}
      <BacktrackingLegend algorithmSlug="sudoku-solver" />
    </div>
  );
}
