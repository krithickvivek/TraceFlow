/**
 * @file StepLog.jsx
 * @description Shows the current step description inline. The full step log
 *              is hidden behind a toggle button and only shown on demand.
 *              All colors use CSS custom properties for light/dark theme support.
 * @exports StepLog (default)
 */

import { useRef, useEffect, useState } from 'react';
import { useTrace } from '../context/TraceContext';
import { List, X } from 'lucide-react';

/** Maximum height of the expanded step log in pixels. */
const MAX_HEIGHT = 300;

/**
 * Map step type to inline badge styles using CSS variables.
 *
 * @param {string} type - Step type.
 * @returns {{ backgroundColor: string, color: string }}
 */
function badgeStyle(type) {
  switch (type) {
    case 'compare':
      return { backgroundColor: 'var(--color-badge-compare-bg)', color: 'var(--color-badge-compare-text)' };
    case 'swap':
      return { backgroundColor: 'var(--color-badge-swap-bg)', color: 'var(--color-badge-swap-text)' };
    case 'sorted':
      return { backgroundColor: 'var(--color-badge-sorted-bg)', color: 'var(--color-badge-sorted-text)' };
    case 'done':
      return { backgroundColor: 'var(--color-badge-done-bg)', color: 'var(--color-badge-done-text)' };
    default:
      return { backgroundColor: 'var(--color-badge-default-bg)', color: 'var(--color-badge-default-text)' };
  }
}

/**
 * Current step display with toggleable full log.
 *
 * @returns {JSX.Element}
 */
export default function StepLog() {
  const { state } = useTrace();
  const { steps, currentStep } = state;
  const [showLog, setShowLog] = useState(false);

  /** Ref to the active step row for auto-scrolling. */
  const activeRef = useRef(null);

  /* Auto-scroll to the active step in the full log. */
  useEffect(() => {
    if (showLog && activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [currentStep, showLog]);

  const step = currentStep >= 0 && currentStep < steps.length ? steps[currentStep] : null;

  /* Nothing to show before steps are generated. */
  if (steps.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* ── Current step description ── */}
      {step && (
        <div className="card flex items-center gap-3">
          <span className="badge shrink-0" style={badgeStyle(step.type)}>
            {step.type}
          </span>
          <p className="text-sm text-[var(--color-text)]">
            {step.description}
          </p>
        </div>
      )}

      {/* ── Toggle button for full log ── */}
      <div className="flex justify-center">
        <button
          onClick={() => setShowLog((prev) => !prev)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                     border border-[var(--color-border)] text-[var(--color-text-muted)]
                     hover:text-[var(--color-accent)] hover:border-[var(--color-accent)]
                     transition-colors"
        >
          {showLog ? <X size={16} /> : <List size={16} />}
          {showLog ? 'Hide Step Log' : 'View Full Step Log'}
        </button>
      </div>

      {/* ── Full step log (shown on demand) ── */}
      {showLog && (
        <div className="card overflow-y-auto space-y-1" style={{ maxHeight: MAX_HEIGHT }}>
          {steps.map((s, idx) => {
            const isActive = idx === currentStep;
            return (
              <div
                key={idx}
                ref={isActive ? activeRef : null}
                className="flex items-start gap-2 px-2 py-1.5 rounded-lg text-xs transition-colors"
                style={
                  isActive
                    ? { backgroundColor: 'var(--color-active-row-bg)', border: '1px solid var(--color-active-row-border)' }
                    : {}
                }
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'var(--color-row-hover)'; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = ''; }}
              >
                <span className="text-[var(--color-text-muted)] font-mono w-6 text-right shrink-0">
                  {idx + 1}
                </span>
                <span className="badge shrink-0" style={badgeStyle(s.type)}>
                  {s.type}
                </span>
                <span style={{ color: isActive ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
                  {s.description}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
