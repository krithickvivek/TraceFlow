/**
 * @file StepLog.jsx
 * @description Compact scrollable step history for TraceFlow V2. Always visible
 *              in the "Steps" tab — no toggle button. Current step highlighted
 *              at top, auto-scrolls to active step. Compact rows.
 * @module components/visualizer/StepLog
 * @exports StepLog (default)
 */

import { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTrace } from '../../context/TraceContext';
import Badge from '../ui/Badge';

/**
 * Map step type to Badge variant.
 * @type {Record<string, string>}
 */
const TYPE_BADGE_VARIANT = {
  /* Sorting / Searching */
  compare: 'warn',
  swap: 'danger',
  sorted: 'success',
  done: 'info',
  pivot: 'info',
  found: 'info',
  merge: 'warn',
  set: 'info',
  'not-found': 'danger',
  /* Backtracking */
  explore: 'info',
  place: 'success',
  conflict: 'danger',
  backtrack: 'danger',
  safe: 'success',
  move: 'info',
  try: 'warn',
  path: 'success',
  visited: 'muted',
  'no-solution': 'danger',
  truncated: 'muted',
};

/**
 * @param {string} type
 * @returns {string}
 */
function badgeVariant(type) {
  return TYPE_BADGE_VARIANT[type] || 'muted';
}

/**
 * Compact step log — always visible, no toggle.
 * @returns {JSX.Element|null}
 */
export default function StepLog() {
  const { state } = useTrace();
  const { steps, currentStep } = state;
  const activeRef = useRef(null);

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [currentStep]);

  if (steps.length === 0) {
    return (
      <div className="p-3 text-center text-[11px] text-tf-muted">
        No steps generated yet.
      </div>
    );
  }

  return (
    <div className="p-2 space-y-0.5">
      {steps.map((s, idx) => {
        const isActive = idx === currentStep;
        return (
          <div
            key={idx}
            ref={isActive ? activeRef : null}
            className={[
              'flex items-start gap-1.5 px-2 py-1 rounded-md text-[11px] transition-colors duration-150',
              isActive
                ? 'bg-tf-primary/15 border border-tf-primary/30'
                : 'hover:bg-white/[0.03]'
            ].join(' ')}
          >
            <span className="text-tf-muted font-mono w-5 text-right shrink-0 text-[10px]">
              {idx + 1}
            </span>
            <Badge variant={badgeVariant(s.type)} className="shrink-0 !text-[9px] !px-1.5 !py-0">
              {s.type}
            </Badge>
            <span className={[
              'leading-snug',
              isActive ? 'text-tf-text' : 'text-tf-text2'
            ].join(' ')}>
              {s.description}
            </span>
          </div>
        );
      })}
    </div>
  );
}

StepLog.propTypes = {};
