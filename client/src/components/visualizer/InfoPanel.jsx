/**
 * @file InfoPanel.jsx
 * @description Algorithm metadata and live statistics panel. Adapts labels
 *              for backtracking algorithms (Attempts/Backtracks/Depth).
 * @module components/visualizer/InfoPanel
 */

import { algorithms } from '../../algorithms';
import { useTrace } from '../../context/TraceContext';
import Badge from '../ui/Badge';

/** @constant {Object<string, string>} */
const DIFFICULTY_VARIANT = {
  Beginner: 'success', Intermediate: 'warn', Advanced: 'danger'
};

/** @constant {Object<string, string>} */
const CATEGORY_VARIANT = {
  Sorting: 'info', Searching: 'info', Backtracking: 'warn'
};

/** Backtracking algorithm slugs for conditional display. */
const BACKTRACKING_SLUGS = new Set([
  'maze-solver', 'n-queens', 'knights-tour', 'sudoku-solver'
]);

/** Exploration order info per backtracking algorithm. */
const EXPLORATION_ORDER = {
  'maze-solver': {
    title: 'Exploration Order (DFS)',
    steps: [
      { label: 'UP', icon: '↑', color: '#3B82F6' },
      { label: 'RIGHT', icon: '→', color: '#2ECC71' },
      { label: 'DOWN', icon: '↓', color: '#F7DC6F' },
      { label: 'LEFT', icon: '←', color: '#E74C3C' },
    ],
    note: 'Tries each direction in order. If all directions are blocked or visited, it backtracks to the previous cell and tries the next untried direction.',
  },
  'n-queens': {
    title: 'Placement Strategy',
    steps: [
      { label: 'COL →', icon: '→', color: '#3B82F6' },
      { label: 'ROW ↓', icon: '↓', color: '#2ECC71' },
      { label: 'CHECK', icon: '✕', color: '#E74C3C' },
      { label: 'BACK', icon: '↩', color: '#F7DC6F' },
    ],
    note: 'Places one queen per column (left → right). Tries each row top-to-bottom. If no safe row exists, backtracks.',
  },
  'knights-tour': {
    title: 'Move Strategy (Warnsdorff)',
    steps: [
      { label: '8 MOVES', icon: '♞', color: '#3B82F6' },
      { label: 'SORT', icon: '⇅', color: '#2ECC71' },
      { label: 'MIN', icon: '✓', color: '#F7DC6F' },
      { label: 'BACK', icon: '↩', color: '#E74C3C' },
    ],
    note: 'From each cell, tries all 8 L-shaped moves. Picks the neighbor with fewest onward moves (Warnsdorff). Backtracks if stuck.',
  },
  'sudoku-solver': {
    title: 'Solving Strategy',
    steps: [
      { label: 'EMPTY', icon: '⬚', color: '#3B82F6' },
      { label: '1–9', icon: '#', color: '#2ECC71' },
      { label: 'VALID', icon: '✓', color: '#F7DC6F' },
      { label: 'BACK', icon: '↩', color: '#E74C3C' },
    ],
    note: 'Finds next empty cell (left→right, top→bottom). Tries digits 1–9, checks row/col/box. Backtracks when no digit fits.',
  },
};

/**
 * InfoPanel component — metadata, complexity, and live stats.
 *
 * @returns {JSX.Element|null}
 */
export default function InfoPanel() {
  const { state } = useTrace();
  const { selectedAlgorithm, steps, currentStep, totalComparisons, totalSwaps } = state;

  const algo = algorithms[selectedAlgorithm];
  if (!algo) return null;

  const { metadata } = algo;
  const stepDisplay = currentStep >= 0 ? currentStep + 1 : 0;
  const isBacktracking = BACKTRACKING_SLUGS.has(selectedAlgorithm);

  /** Current step data for depth display. */
  const currentStepData = currentStep >= 0 && currentStep < steps.length
    ? steps[currentStep]
    : null;
  const depth = currentStepData?.pass ?? 0;

  return (
    <div className="p-3 h-full flex flex-col justify-between gap-3">
      {/* Top: badges + name + description */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge variant={CATEGORY_VARIANT[metadata.category] || 'info'}>
            {metadata.category}
          </Badge>
          <Badge variant={DIFFICULTY_VARIANT[metadata.difficulty] || 'muted'}>
            {metadata.difficulty}
          </Badge>
        </div>

        <div>
          <h2 className="text-sm font-bold text-tf-text">{metadata.name}</h2>
          <p className="text-[11px] text-tf-text2 mt-1 leading-relaxed">{metadata.description}</p>
        </div>
      </div>

      {/* Exploration order — backtracking only */}
      {isBacktracking && EXPLORATION_ORDER[selectedAlgorithm] && (() => {
        const info = EXPLORATION_ORDER[selectedAlgorithm];
        return (
          <div className="space-y-1.5">
            <h3 className="text-[10px] font-semibold text-tf-muted uppercase tracking-wider">
              {info.title}
            </h3>
            <div className="flex items-center gap-1 justify-center">
              {info.steps.map((s, i) => (
                <div key={s.label} className="flex items-center gap-1">
                  <div
                    className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold"
                    style={{ backgroundColor: s.color + '20', color: s.color }}
                  >
                    <span className="text-xs">{s.icon}</span>
                    <span>{s.label}</span>
                  </div>
                  {i < info.steps.length - 1 && (
                    <span className="text-tf-muted text-[10px] font-bold mx-0.5">→</span>
                  )}
                </div>
              ))}
            </div>
            <p className="text-[10px] text-tf-text2 leading-relaxed">{info.note}</p>
          </div>
        );
      })()}

      {/* Middle: complexity table */}
      <div className="space-y-1">
        <h3 className="text-[10px] font-semibold text-tf-muted uppercase tracking-wider">
          Time Complexity
        </h3>
        <table className="w-full text-xs">
          <tbody>
            {['best', 'average', 'worst'].map((key) => (
              <tr key={key} className="border-b border-[var(--border-subtle)]">
                <td className="py-1.5 text-tf-text2 capitalize">{key}</td>
                <td className="py-1.5 text-right font-mono text-tf-blue font-semibold text-[11px]">
                  {metadata.timeComplexity[key]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex items-center justify-between text-xs pt-1">
          <div>
            <span className="text-tf-text2">Space: </span>
            <span className="font-mono text-tf-blue font-semibold">{metadata.spaceComplexity}</span>
          </div>
          {metadata.stable !== null && (
            <Badge variant={metadata.stable ? 'success' : 'danger'}>
              {metadata.stable ? 'Stable' : 'Unstable'}
            </Badge>
          )}
        </div>

        {/* Variable definitions */}
        {metadata.complexityNote && (
          <p className="text-[10px] text-tf-muted italic mt-1.5 leading-relaxed"
             style={{ borderLeft: '2px solid var(--accent-primary)', paddingLeft: 8 }}>
            Where: {metadata.complexityNote}
          </p>
        )}
      </div>

      {/* Bottom: live stats — adapted for backtracking */}
      <div className="space-y-1">
        <h3 className="text-[10px] font-semibold text-tf-muted uppercase tracking-wider">
          Live Stats
        </h3>
        <div className={`grid ${isBacktracking ? 'grid-cols-4' : 'grid-cols-3'} gap-2 text-center`}>
          <div className="rounded-lg p-2" style={{ backgroundColor: 'var(--bg-primary)' }}>
            <div className="text-lg font-bold text-tf-blue">{stepDisplay}</div>
            <div className="text-[9px] text-tf-muted">Step</div>
            <div className="text-[9px] text-tf-muted opacity-60">of {steps.length}</div>
          </div>
          <div className="rounded-lg p-2" style={{ backgroundColor: 'var(--bg-primary)' }}>
            <div className="text-lg font-bold text-tf-gold">{totalComparisons}</div>
            <div className="text-[9px] text-tf-muted">
              {isBacktracking ? 'Attempts' : 'Compares'}
            </div>
          </div>
          <div className="rounded-lg p-2" style={{ backgroundColor: 'var(--bg-primary)' }}>
            <div className="text-lg font-bold text-tf-rose">{totalSwaps}</div>
            <div className="text-[9px] text-tf-muted">
              {isBacktracking ? 'Backtracks' : 'Swaps'}
            </div>
          </div>
          {isBacktracking && (
            <div className="rounded-lg p-2" style={{ backgroundColor: 'var(--bg-primary)' }}>
              <div className="text-lg font-bold text-tf-teal">{depth}</div>
              <div className="text-[9px] text-tf-muted">Depth</div>
            </div>
          )}
        </div>
      </div>

      {/* Keyboard hints — fills remaining space */}
      <div className="mt-auto pt-2 border-t border-[var(--border-subtle)]">
        <h3 className="text-[10px] font-semibold text-tf-muted uppercase tracking-wider mb-1">
          Keyboard Shortcuts
        </h3>
        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px]">
          <div className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-tf-text2 font-mono text-[9px]">Space</kbd>
            <span className="text-tf-muted">Play/Pause</span>
          </div>
          <div className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-tf-text2 font-mono text-[9px]">←→</kbd>
            <span className="text-tf-muted">Step</span>
          </div>
          <div className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-tf-text2 font-mono text-[9px]">R</kbd>
            <span className="text-tf-muted">Reset</span>
          </div>
          <div className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-tf-text2 font-mono text-[9px]">Enter</kbd>
            <span className="text-tf-muted">Generate</span>
          </div>
        </div>
      </div>
    </div>
  );
}
