/**
 * @file InfoPanel.jsx
 * @description Displays metadata for the selected algorithm — name, description,
 *              complexity table, stability badge, and live step/comparison/swap stats.
 *              All colors use CSS custom properties for light/dark theme support.
 * @exports InfoPanel (default)
 */

import { algorithms } from '../algorithms';
import { useTrace } from '../context/TraceContext';

/**
 * Algorithm information and live stats panel.
 *
 * @returns {JSX.Element}
 */
export default function InfoPanel() {
  const { state } = useTrace();
  const { selectedAlgorithm, steps, currentStep, totalComparisons, totalSwaps } = state;

  const algo = algorithms[selectedAlgorithm];
  if (!algo) return null;

  const { metadata } = algo;
  const stepDisplay = currentStep >= 0 ? currentStep + 1 : 0;

  return (
    <div className="space-y-4">
      {/* ── Header ── */}
      <div>
        <h2 className="text-xl font-bold">{metadata.name}</h2>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">{metadata.description}</p>
      </div>

      {/* ── Complexity table ── */}
      <div className="space-y-1">
        <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
          Time Complexity
        </h3>
        <table className="w-full text-sm">
          <tbody>
            {['best', 'average', 'worst'].map((key) => (
              <tr key={key} className="border-b border-[var(--color-border)]">
                <td className="py-1 text-[var(--color-text-muted)] capitalize">{key}</td>
                <td className="py-1 text-right font-mono text-[var(--color-accent)] font-semibold">
                  {metadata.timeComplexity[key]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Space + stability ── */}
      <div className="flex items-center justify-between text-sm">
        <div>
          <span className="text-[var(--color-text-muted)]">Space: </span>
          <span className="font-mono text-[var(--color-accent)] font-semibold">{metadata.spaceComplexity}</span>
        </div>
        <span
          className="badge"
          style={
            metadata.stable
              ? { backgroundColor: 'var(--color-stable-bg)', color: 'var(--color-stable-text)' }
              : { backgroundColor: 'var(--color-unstable-bg)', color: 'var(--color-unstable-text)' }
          }
        >
          {metadata.stable ? 'Stable' : 'Unstable'}
        </span>
      </div>

      {/* ── Live stats ── */}
      <div className="space-y-1">
        <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
          Current Stats
        </h3>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg p-2" style={{ backgroundColor: 'var(--color-bg)' }}>
            <div className="text-lg font-bold text-[var(--color-accent)]">{stepDisplay}</div>
            <div className="text-[10px] text-[var(--color-text-muted)]">Step</div>
            <div className="text-[10px] text-[var(--color-text-muted)] opacity-60">of {steps.length}</div>
          </div>
          <div className="rounded-lg p-2" style={{ backgroundColor: 'var(--color-bg)' }}>
            <div className="text-lg font-bold" style={{ color: 'var(--color-compare)' }}>{totalComparisons}</div>
            <div className="text-[10px] text-[var(--color-text-muted)]">Comparisons</div>
          </div>
          <div className="rounded-lg p-2" style={{ backgroundColor: 'var(--color-bg)' }}>
            <div className="text-lg font-bold" style={{ color: 'var(--color-swap)' }}>{totalSwaps}</div>
            <div className="text-[10px] text-[var(--color-text-muted)]">Swaps</div>
          </div>
        </div>
      </div>
    </div>
  );
}
