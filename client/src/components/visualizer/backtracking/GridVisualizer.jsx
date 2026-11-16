/**
 * @file GridVisualizer.jsx
 * @description Reusable 2D grid visualizer for Maze Solver, N-Queens, and
 *              Knight's Tour. Renders a responsive CSS grid where each cell is
 *              colored based on its state. Reads from TraceContext.
 * @module components/visualizer/backtracking/GridVisualizer
 */

import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useTrace } from '../../../context/TraceContext';
import BacktrackingLegend from './BacktrackingLegend';

/* ── Cell size constraints ── */
/** @constant {number} */
const MIN_CELL = 28;
/** @constant {number} */
const MAX_CELL = 56;

/* ── Maze cell state → color mapping ── */
const MAZE_COLORS = {
  0: 'var(--maze-open)',
  1: 'var(--maze-wall)',
  2: 'var(--maze-visited)',
  3: 'var(--accent-primary, #6C63FF)',
  4: 'var(--accent-danger, #FF4D6D)',
  5: 'var(--accent-success, #00C896)',
};

/* ── N-Queens cell state → color mapping ── */
const QUEEN_COLORS = {
  0: 'var(--maze-open)',
  1: 'var(--accent-primary, #6C63FF)',
  2: 'var(--queen-attack)',
  3: 'var(--accent-warn, #FFB347)',
  4: 'var(--accent-danger, #FF4D6D)',
};

/* ── Knight's Tour cell state → color mapping ── */
const KNIGHT_COLORS = {
  unvisited: 'var(--maze-open)',
  current: 'var(--accent-primary, #6C63FF)',
  recent: 'var(--accent-success, #00C896)',
  visited: 'var(--maze-visited)',
};

/**
 * Build a lookup map from highlightCells array for O(1) access.
 *
 * @param {Array<{row: number, col: number, state: string}>} highlights
 * @returns {Map<string, string>} key "row,col" → state string
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
 * Determine background color for a maze cell.
 *
 * @param {number} val - Grid cell value (0–5).
 * @param {string|undefined} hlState - Highlight state override.
 * @returns {string} CSS color value.
 */
function getMazeCellColor(val, hlState) {
  if (hlState === 'active') return 'var(--accent-primary, #6C63FF)';
  if (hlState === 'path') return 'var(--accent-success, #00C896)';
  if (hlState === 'danger') return 'var(--accent-danger, #FF4D6D)';
  if (hlState === 'warn') return 'var(--accent-warn, #FFB347)';
  if (hlState === 'start' || hlState === 'end') return 'var(--accent-secondary, #00E5CC)';
  return MAZE_COLORS[val] ?? 'var(--bg-card)';
}

/**
 * Determine background color for an N-Queens cell.
 *
 * @param {number} val - Grid cell value (0–4).
 * @param {string|undefined} hlState - Highlight state override.
 * @returns {string} CSS color value.
 */
function getQueenCellColor(val, hlState) {
  if (hlState === 'active') return 'var(--accent-primary, #6C63FF)';
  if (hlState === 'success') return 'var(--accent-success, #00C896)';
  if (hlState === 'danger') return 'var(--accent-danger, #FF4D6D)';
  if (hlState === 'warn') return 'var(--accent-warn, #FFB347)';
  return QUEEN_COLORS[val] ?? 'var(--bg-card)';
}

/**
 * Determine background color for a Knight's Tour cell.
 *
 * @param {number} val - Grid cell value (-1 or move number).
 * @param {string|undefined} hlState - Highlight state override.
 * @param {number} moveNum - Current total move number for recency.
 * @returns {string} CSS color value.
 */
function getKnightCellColor(val, hlState, moveNum) {
  if (hlState === 'active') return KNIGHT_COLORS.current;
  if (hlState === 'success') return KNIGHT_COLORS.recent;
  if (hlState === 'danger') return 'var(--accent-danger, #FF4D6D)';
  if (hlState === 'warn') return 'var(--accent-warn, #FFB347)';
  if (val === -1) return KNIGHT_COLORS.unvisited;
  if (moveNum > 0 && val >= moveNum - 2) return KNIGHT_COLORS.recent;
  return KNIGHT_COLORS.visited;
}

/**
 * Render cell content for maze (S/E labels).
 *
 * @param {number} r
 * @param {number} c
 * @param {Object|null} step
 * @returns {string|null}
 */
function getMazeCellLabel(r, c, step) {
  if (!step) return null;
  const hl = step.highlightCells?.find(h => h.row === r && h.col === c);
  if (hl?.state === 'start') return 'S';
  if (hl?.state === 'end') return 'E';
  return null;
}

/**
 * Reusable 2D grid visualizer for backtracking algorithms.
 *
 * @param {{ algorithmSlug: string }} props
 * @returns {JSX.Element}
 */
export default function GridVisualizer({ algorithmSlug }) {
  const { state } = useTrace();
  const { steps, currentStep, inputConfig } = state;

  const step = currentStep >= 0 && currentStep < steps.length ? steps[currentStep] : null;
  const grid = step?.grid || inputConfig?.grid || null;

  const rows = grid?.length || 0;
  const cols = rows > 0 ? (grid[0]?.length || 0) : 0;
  const moveNum = step?.pass ?? 0;

  const highlightMap = useMemo(() => buildHighlightMap(step?.highlightCells), [step]);

  if (!grid || rows === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-tf-muted text-sm font-mono">
          Click &quot;Generate&quot; to start the visualization.
        </p>
      </div>
    );
  }

  /** Compute cell size based on container constraints. */
  const cellSize = Math.max(MIN_CELL, Math.min(MAX_CELL, Math.floor(360 / Math.max(rows, cols))));

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-2">
      {/* Grid */}
      <div
        className="inline-grid border-2 border-[var(--grid-border)] rounded-lg overflow-hidden shadow-sm"
        style={{
          gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
        }}
      >
        {grid.map((row, r) =>
          row.map((val, c) => {
            const key = `${r},${c}`;
            const hlState = highlightMap.get(key);
            const isActive = hlState === 'active';

            let bg;
            let content = null;
            let textColor = 'var(--text-primary)';

            if (algorithmSlug === 'maze-solver') {
              bg = getMazeCellColor(val, hlState);
              const label = getMazeCellLabel(r, c, step);
              if (label) {
                content = label;
                textColor = 'var(--bg-primary)';
              }
            } else if (algorithmSlug === 'n-queens') {
              bg = getQueenCellColor(val, hlState);
              if (val === 1) {
                content = '\u265B';
                textColor = val === 1 && !hlState ? 'white' : 'var(--bg-primary)';
              }
            } else if (algorithmSlug === 'knights-tour') {
              bg = getKnightCellColor(val, hlState, moveNum);
              if (hlState === 'active') {
                content = '\u265E';
                textColor = 'white';
              } else if (val >= 0) {
                content = val + 1;
                textColor = 'var(--text-primary)';
              }
            }

            return (
              <div
                key={key}
                className={`flex items-center justify-center border border-[var(--grid-border)] font-mono text-xs font-semibold select-none
                           transition-colors duration-200 ease-in-out
                           ${isActive ? 'ring-2 ring-[var(--accent-primary,#6C63FF)] ring-inset animate-pulse' : ''}`}
                style={{
                  backgroundColor: bg,
                  color: textColor,
                  width: cellSize,
                  height: cellSize,
                  fontSize: cellSize > 36 ? '14px' : '10px',
                }}
              >
                {content}
              </div>
            );
          })
        )}
      </div>

      {/* Legend */}
      <BacktrackingLegend algorithmSlug={algorithmSlug} />
    </div>
  );
}

GridVisualizer.propTypes = {
  algorithmSlug: PropTypes.string.isRequired,
};
