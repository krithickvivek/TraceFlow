/**
 * @file PseudoCode.jsx
 * @description Pseudocode panel with full-width code visibility.
 *              Horizontal scroll when code overflows with a visible scrollbar.
 *              Active lines highlighted with blue accent.
 * @module components/visualizer/PseudoCode
 */

import { algorithms } from '../../algorithms';
import { useTrace } from '../../context/TraceContext';

export default function PseudoCode() {
  const { state } = useTrace();
  const { selectedAlgorithm, steps, currentStep } = state;

  const algo = algorithms[selectedAlgorithm];
  if (!algo || !algo.pseudoCode) return null;

  const { pseudoCode, metadata } = algo;
  const step = currentStep >= 0 && currentStep < steps.length ? steps[currentStep] : null;
  const activeLines = step ? step.activeLines || [] : [];
  const isDone = step?.type === 'done';
  const isIdle = !step;

  return (
    <div className="p-2 h-full flex flex-col gap-2">
      {/* Header */}
      <div className="shrink-0 px-1 flex items-center justify-between">
        <span className="font-mono text-[10px] text-tf-muted uppercase tracking-wider">
          {metadata.name}
        </span>
        {step && (
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-tf-blue/10 text-tf-blue font-mono font-semibold">
            Line {(activeLines[0] ?? 0) + 1}
          </span>
        )}
      </div>

      {/* Code block — fills remaining height, scrolls both ways */}
      <div className="flex-1 min-h-0 rounded-lg border border-[var(--border-subtle)] overflow-hidden flex flex-col"
           style={{ backgroundColor: 'var(--bg-primary)' }}>
        {/* Terminal dots header */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-[var(--border-subtle)] shrink-0">
          <span className="w-2 h-2 rounded-full bg-red-400/70" />
          <span className="w-2 h-2 rounded-full bg-yellow-400/70" />
          <span className="w-2 h-2 rounded-full bg-green-400/70" />
          <span className="ml-2 text-[9px] text-tf-muted font-mono">pseudocode</span>
        </div>

        {/* Scrollable code area — both vertical and horizontal */}
        <div className="flex-1 overflow-auto py-1">
          <div className="min-w-max">
            {pseudoCode.map((entry) => {
              const isActive = activeLines.includes(entry.line);
              return (
                <div
                  key={entry.line}
                  className="flex items-start transition-all duration-200"
                  style={{
                    backgroundColor: isActive ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
                    borderLeft: isActive ? '3px solid #3B82F6' : '3px solid transparent',
                    opacity: (isIdle || isDone) ? 0.85 : (isActive ? 1 : 0.3),
                    padding: '2px 12px 2px 6px',
                  }}
                >
                  {/* Line number */}
                  <span
                    className="select-none shrink-0 text-right"
                    style={{
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: '11px',
                      lineHeight: '1.7',
                      color: isActive ? '#3B82F6' : 'var(--text-muted)',
                      width: '1.8rem',
                      marginRight: '10px',
                      fontWeight: isActive ? '700' : '400',
                    }}
                  >
                    {entry.line + 1}
                  </span>

                  {/* Code — no wrapping, full width visible */}
                  <code
                    style={{
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: '12px',
                      lineHeight: '1.7',
                      color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                      whiteSpace: 'pre',
                      fontWeight: isActive ? '500' : '400',
                    }}
                  >
                    {entry.code}
                  </code>

                  {isActive && (
                    <span className="ml-3 shrink-0 text-[10px]" style={{ color: '#3B82F6' }}>
                      ◀
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer hint */}
        {!step && (
          <div className="px-3 py-1.5 border-t border-[var(--border-subtle)] text-center shrink-0">
            <span className="text-[9px] text-tf-muted">
              Press Play or Next to highlight active lines
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
