/**
 * @file Controls.jsx
 * @description Simple step-through control bar with Start, Prev, Next, and
 *              Reset buttons. No auto-play — students advance at their own pace.
 * @exports Controls (default)
 */

import { useTrace, ActionTypes } from '../context/TraceContext';
import { useAnimationEngine } from '../hooks/useAnimationEngine';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  RotateCcw
} from 'lucide-react';

/**
 * Step-through control bar component.
 *
 * @returns {JSX.Element}
 */
export default function Controls() {
  const { state } = useTrace();
  const { status, steps, currentStep } = state;
  const { stepForward, stepBackward, reset } = useAnimationEngine();

  const hasSteps = steps.length > 0;
  const notStarted = currentStep === -1;
  const atStart = currentStep <= 0 && currentStep === -1;
  const atEnd = currentStep >= steps.length - 1;

  /** Handle the Start button — just steps to the first step. */
  const handleStart = () => {
    stepForward();
  };

  /** Common button styles. */
  const btnBase =
    'flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed';

  return (
    <div className="card flex flex-wrap items-center justify-center gap-3">
      {/* Prev */}
      <button
        onClick={stepBackward}
        disabled={!hasSteps || atStart}
        className={`${btnBase} border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-bg)]`}
        aria-label="Previous step"
      >
        <ChevronLeft size={18} />
        Prev
      </button>

      {/* Start / Next */}
      {notStarted ? (
        <button
          onClick={handleStart}
          disabled={!hasSteps}
          className={`${btnBase} bg-[var(--color-accent)] text-white hover:opacity-90`}
          aria-label="Start"
        >
          <Play size={18} />
          Start
        </button>
      ) : (
        <button
          onClick={stepForward}
          disabled={!hasSteps || atEnd}
          className={`${btnBase} bg-[var(--color-accent)] text-white hover:opacity-90`}
          aria-label="Next step"
        >
          Next
          <ChevronRight size={18} />
        </button>
      )}

      {/* Reset */}
      <button
        onClick={reset}
        disabled={!hasSteps}
        className={`${btnBase} border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-bg)]`}
        aria-label="Reset"
      >
        <RotateCcw size={16} />
        Reset
      </button>

      {/* Step counter */}
      {hasSteps && (
        <span className="text-sm text-[var(--color-text-muted)] ml-2">
          Step {currentStep >= 0 ? currentStep + 1 : 0} of {steps.length}
        </span>
      )}
    </div>
  );
}
