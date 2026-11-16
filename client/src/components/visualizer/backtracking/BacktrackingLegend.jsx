/**
 * @file BacktrackingLegend.jsx
 * @description Color legend for backtracking visualizers. Shows colored squares
 *              with labels for each cell state. Different legend items shown per
 *              algorithm. Renders below GridVisualizer and SudokuVisualizer.
 * @module components/visualizer/backtracking/BacktrackingLegend
 */

import PropTypes from 'prop-types';

/** Legend items grouped by algorithm slug. */
const LEGEND_ITEMS = {
  'maze-solver': [
    { color: 'var(--maze-open)', label: 'Open' },
    { color: 'var(--maze-wall)', label: 'Wall' },
    { color: 'var(--accent-primary)', label: 'Exploring' },
    { color: 'var(--maze-visited)', label: 'Visited' },
    { color: 'var(--accent-danger)', label: 'Dead End' },
    { color: 'var(--accent-success)', label: 'Solution' },
  ],
  'n-queens': [
    { color: 'var(--maze-open)', label: 'Empty' },
    { color: 'var(--accent-primary)', label: 'Queen' },
    { color: 'var(--accent-warn)', label: 'Trying' },
    { color: 'var(--accent-danger)', label: 'Conflict' },
    { color: 'var(--accent-success)', label: 'Safe' },
    { color: 'var(--queen-attack)', label: 'Under Attack' },
  ],
  'knights-tour': [
    { color: 'var(--maze-open)', label: 'Unvisited' },
    { color: 'var(--accent-primary)', label: 'Current' },
    { color: 'var(--accent-success)', label: 'Visited' },
    { color: 'var(--accent-warn)', label: 'Trying' },
    { color: 'var(--accent-danger)', label: 'Backtrack' },
  ],
  'sudoku-solver': [
    { color: 'var(--bg-surface)', label: 'Fixed (Clue)' },
    { color: '#FBBF24', label: 'Trying' },
    { color: '#22C55E', label: 'Placed' },
    { color: '#EF4444', label: 'Conflict' },
    { color: '#3B82F6', label: 'Solved' },
  ],
  'graph-bfs': [
    { color: 'var(--maze-open)', label: 'Unvisited' },
    { color: 'var(--accent-warn)', label: 'In Queue' },
    { color: 'var(--accent-primary)', label: 'Processing' },
    { color: 'var(--maze-visited)', label: 'Visited' },
    { color: 'var(--accent-success)', label: 'Path Found' },
  ],
};

/**
 * Renders a horizontal legend of colored squares with labels.
 *
 * @param {{ algorithmSlug: string }} props
 * @returns {JSX.Element}
 */
export default function BacktrackingLegend({ algorithmSlug }) {
  const items = LEGEND_ITEMS[algorithmSlug] || LEGEND_ITEMS['maze-solver'];

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-2 py-2">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <span
            className="inline-block w-3 h-3 rounded-sm shrink-0 border border-[var(--grid-border)]"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-[10px] text-tf-text2 font-mono whitespace-nowrap">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}

BacktrackingLegend.propTypes = {
  algorithmSlug: PropTypes.string.isRequired,
};
