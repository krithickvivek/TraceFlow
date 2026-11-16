/**
 * @file Controls.jsx
 * @description Music-player-style centered playback controls with a
 *              Spotify-style scrubber bar (hover tooltip, click-to-seek,
 *              drag-to-scrub). Clicking or dragging the scrubber while
 *              playing automatically pauses playback.
 * @module components/visualizer/Controls
 */

import { useState, useRef, useCallback } from 'react';
import {
  SkipBack,
  SkipForward,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

/** Color map for step type badges. */
const TYPE_COLORS = {
  /* Sorting / Searching */
  compare: '#F7DC6F',
  swap: '#E74C3C',
  sorted: '#2ECC71',
  pivot: '#FF6B35',
  found: '#4ECDC4',
  done: '#3B82F6',
  set: '#3B82F6',
  merge: '#FF6B35',
  'not-found': '#E74C3C',
  /* Backtracking */
  explore: '#6C63FF',
  place: '#2ECC71',
  conflict: '#EF4444',
  backtrack: '#E74C3C',
  safe: '#00C896',
  move: '#6C63FF',
  try: '#FFB347',
  path: '#00C896',
  visited: '#94A3B8',
  'no-solution': '#E74C3C',
  truncated: '#94A3B8',
};
import { useAnimationEngine } from '../../hooks/useAnimationEngine';
import { useTrace, ActionTypes, MIN_SPEED, MAX_SPEED, SPEED_STEP } from '../../context/TraceContext';

function speedLabel(ms) {
  if (ms <= 150) return 'Blazing';
  if (ms <= 400) return 'Fast';
  if (ms <= 800) return 'Normal';
  return 'Slow';
}

export default function Controls({ compact = false }) {
  const { state, dispatch } = useTrace();
  const { steps, currentStep, speed } = state;
  const { play, pause, stepForward, stepBackward, reset, isPlaying } = useAnimationEngine();

  const hasSteps = steps.length > 0;
  const atStart = currentStep <= 0 && currentStep === -1;
  const atEnd = currentStep >= steps.length - 1;
  const stepDisplay = currentStep >= 0 ? currentStep + 1 : 0;
  const progress = hasSteps ? (stepDisplay / steps.length) * 100 : 0;
  const step = currentStep >= 0 && currentStep < steps.length ? steps[currentStep] : null;

  const dis = 'disabled:opacity-25 disabled:cursor-not-allowed';

  /* ── Scrubber state ── */
  const scrubberRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverPercent, setHoverPercent] = useState(0);
  const [hoverStep, setHoverStep] = useState(0);

  /** Convert a mouse/touch X position to a step index. */
  const getStepFromX = useCallback((clientX) => {
    if (!scrubberRef.current || !hasSteps) return 0;
    const rect = scrubberRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const pct = x / rect.width;
    return Math.max(0, Math.min(steps.length - 1, Math.round(pct * (steps.length - 1))));
  }, [hasSteps, steps.length]);

  /** Convert a mouse X to a percentage for positioning. */
  const getPercentFromX = useCallback((clientX) => {
    if (!scrubberRef.current) return 0;
    const rect = scrubberRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    return (x / rect.width) * 100;
  }, []);

  /** Seek to a step — pauses if currently playing. */
  const seekToStep = useCallback((targetStep) => {
    if (isPlaying) pause();
    dispatch({ type: ActionTypes.SET_STEP, payload: targetStep });
    dispatch({ type: ActionTypes.SET_STATUS, payload: targetStep >= steps.length - 1 ? 'done' : 'paused' });
  }, [isPlaying, pause, dispatch, steps.length]);

  /* ── Mouse move on scrubber (hover preview) ── */
  const handleMouseMove = useCallback((e) => {
    setHoverPercent(getPercentFromX(e.clientX));
    setHoverStep(getStepFromX(e.clientX));

    // If dragging, also seek in real-time
    if (isDragging) {
      seekToStep(getStepFromX(e.clientX));
    }
  }, [getPercentFromX, getStepFromX, isDragging, seekToStep]);

  /* ── Mouse down — start drag ── */
  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    if (!hasSteps) return;
    setIsDragging(true);
    const targetStep = getStepFromX(e.clientX);
    seekToStep(targetStep);

    // Global listeners for drag + release
    const onMouseMove = (moveEvent) => {
      const pct = getPercentFromX(moveEvent.clientX);
      setHoverPercent(pct);
      const step = getStepFromX(moveEvent.clientX);
      setHoverStep(step);
      seekToStep(step);
    };

    const onMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, [hasSteps, getStepFromX, getPercentFromX, seekToStep]);

  const showKnob = isHovering || isDragging;

  if (compact) {
    return (
      <div className="shrink-0 flex flex-col items-center gap-1 px-2 py-1">
        {/* Row 1: Scrubber + playback + speed all in one line */}
        <div className="w-full flex items-center gap-3">
          {/* Scrubber */}
          <div className="flex-1 min-w-0">
            {hasSteps && (
              <div
                ref={scrubberRef}
                className="w-full group relative cursor-pointer py-1 select-none"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => { if (!isDragging) setIsHovering(false); }}
                onMouseMove={handleMouseMove}
                onMouseDown={handleMouseDown}
              >
                <div className={`w-full rounded-full bg-[var(--border-subtle)] overflow-hidden transition-all duration-150 ${showKnob ? 'h-1.5' : 'h-1'}`}>
                  <div className="h-full rounded-full bg-tf-blue transition-[width] duration-100" style={{ width: `${progress}%` }} />
                </div>
                <div
                  className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-md transition-all duration-100 pointer-events-none ${showKnob ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
                  style={{ left: `calc(${progress}% - 6px)` }}
                />
                {(isHovering || isDragging) && (
                  <div className="absolute -top-7 -translate-x-1/2 px-1.5 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-lg pointer-events-none z-20 whitespace-nowrap" style={{ left: `${hoverPercent}%` }}>
                    <span className="text-[9px] font-mono text-tf-text font-semibold">Step {hoverStep + 1} / {steps.length}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Playback buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={reset} disabled={!hasSteps} className={`p-1.5 rounded-full text-tf-text2 hover:text-tf-text hover:bg-[var(--bg-primary)] transition-all ${dis}`} title="Reset (R)">
              <RotateCcw size={14} />
            </button>
            <button onClick={stepBackward} disabled={!hasSteps || atStart} className={`p-1.5 rounded-full text-tf-text2 hover:text-tf-text hover:bg-[var(--bg-primary)] transition-all ${dis}`} title="Previous (←)">
              <SkipBack size={16} />
            </button>
            <button onClick={isPlaying ? pause : play} disabled={!hasSteps}
              className={`w-9 h-9 flex items-center justify-center rounded-full bg-tf-blue text-white shadow-lg hover:shadow-[0_0_16px_rgba(59,130,246,0.4)] hover:scale-105 active:scale-95 transition-all duration-200 ${dis}`}
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}>
              {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
            </button>
            <button onClick={stepForward} disabled={!hasSteps || atEnd} className={`p-1.5 rounded-full text-tf-text2 hover:text-tf-text hover:bg-[var(--bg-primary)] transition-all ${dis}`} title="Next (→)">
              <SkipForward size={16} />
            </button>
            <span className="text-[10px] text-tf-muted font-mono tabular-nums min-w-[36px] text-center">
              {stepDisplay}/{steps.length || 0}
            </span>
          </div>

          {/* Speed */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[9px] text-tf-muted">Slow</span>
            <input type="range" min={MIN_SPEED} max={MAX_SPEED} step={SPEED_STEP}
              value={MIN_SPEED + MAX_SPEED - speed}
              onChange={(e) => dispatch({ type: ActionTypes.SET_SPEED, payload: MIN_SPEED + MAX_SPEED - Number(e.target.value) })}
              className="w-20 accent-tf-blue cursor-pointer" />
            <span className="text-[9px] text-tf-muted">Fast</span>
            <span className="text-[9px] text-tf-blue font-mono font-semibold">{speedLabel(speed)}</span>
          </div>
        </div>

        {/* Row 2: Step description — single line */}
        {step && (
          <div className="w-full flex items-center justify-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md font-mono text-[11px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] max-w-full truncate">
              <span className="font-bold shrink-0" style={{ color: TYPE_COLORS[step.type] || 'var(--text-secondary)' }}>
                [{step.type.toUpperCase()}]
              </span>
              <span className="text-tf-text2 truncate">{step.description}</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="shrink-0 flex flex-col items-center gap-2 px-6 py-3">
      {/* Scrubber bar — Spotify-style with hover tooltip + drag-to-seek */}
      {hasSteps && (
        <div
          ref={scrubberRef}
          className="w-full max-w-md group relative cursor-pointer py-1.5 select-none"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => { if (!isDragging) setIsHovering(false); }}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
        >
          {/* Track background */}
          <div className={`w-full rounded-full bg-[var(--border-subtle)] overflow-hidden transition-all duration-150
                          ${showKnob ? 'h-1.5' : 'h-1'}`}>
            {/* Filled progress */}
            <div
              className="h-full rounded-full bg-tf-blue transition-[width] duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Hover fill preview (lighter shade up to hover position) */}
          {isHovering && !isDragging && (
            <div
              className="absolute top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-white/10 pointer-events-none"
              style={{ width: `${hoverPercent}%`, left: 0 }}
            />
          )}

          {/* Scrubber knob — at current position */}
          <div
            className={`absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-md
                       transition-all duration-100 pointer-events-none
                       ${showKnob ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
            style={{ left: `calc(${progress}% - 7px)` }}
          />

          {/* Hover tooltip — shows step number */}
          {(isHovering || isDragging) && (
            <div
              className="absolute -top-8 -translate-x-1/2 px-2 py-0.5 rounded bg-[var(--bg-card)]
                         border border-[var(--border-subtle)] shadow-lg pointer-events-none z-20
                         whitespace-nowrap"
              style={{ left: `${hoverPercent}%` }}
            >
              <span className="text-[10px] font-mono text-tf-text font-semibold">
                Step {hoverStep + 1} / {steps.length}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Main controls — centered like a music player */}
      <div className="flex items-center gap-5">
        {/* Reset */}
        <button
          onClick={reset}
          disabled={!hasSteps}
          className={`p-2 rounded-full text-tf-text2 hover:text-tf-text hover:bg-[var(--bg-primary)] transition-all ${dis}`}
          title="Reset (R)"
        >
          <RotateCcw size={16} />
        </button>

        {/* Prev */}
        <button
          onClick={stepBackward}
          disabled={!hasSteps || atStart}
          className={`p-2 rounded-full text-tf-text2 hover:text-tf-text hover:bg-[var(--bg-primary)] transition-all ${dis}`}
          aria-label="Previous step"
          title="Previous (←)"
        >
          <SkipBack size={20} />
        </button>

        {/* Play / Pause — large centered button */}
        <button
          onClick={isPlaying ? pause : play}
          disabled={!hasSteps}
          className={`w-12 h-12 flex items-center justify-center rounded-full
                     bg-tf-blue text-white shadow-lg
                     hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:scale-105
                     active:scale-95 transition-all duration-200 ${dis}`}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
        >
          {isPlaying ? <Pause size={22} /> : <Play size={22} className="ml-0.5" />}
        </button>

        {/* Next */}
        <button
          onClick={stepForward}
          disabled={!hasSteps || atEnd}
          className={`p-2 rounded-full text-tf-text2 hover:text-tf-text hover:bg-[var(--bg-primary)] transition-all ${dis}`}
          aria-label="Next step"
          title="Next (→)"
        >
          <SkipForward size={20} />
        </button>

        {/* Step counter */}
        <span className="text-xs text-tf-muted font-mono tabular-nums min-w-[40px] text-center">
          {stepDisplay}/{steps.length || 0}
        </span>
      </div>

      {/* Speed slider row */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-tf-muted">Slow</span>
        <input
          type="range"
          min={MIN_SPEED}
          max={MAX_SPEED}
          step={SPEED_STEP}
          value={MIN_SPEED + MAX_SPEED - speed}
          onChange={(e) => {
            const inverted = MIN_SPEED + MAX_SPEED - Number(e.target.value);
            dispatch({ type: ActionTypes.SET_SPEED, payload: inverted });
          }}
          className="w-28 accent-tf-blue cursor-pointer"
        />
        <span className="text-[10px] text-tf-muted">Fast</span>
        <span className="text-[10px] text-tf-blue font-mono font-semibold ml-1">
          {speedLabel(speed)}
        </span>
      </div>

      {/* Step description — fixed height (2-line) to prevent layout shifts */}
      <div className={`w-full max-w-xl flex items-start justify-center pt-1 ${compact ? 'h-[36px]' : 'h-[52px]'}`}>
        {step ? (
          <div className="inline-flex items-start gap-2 px-4 py-1.5 rounded-lg font-mono text-xs
                          bg-[var(--bg-surface)] border border-[var(--border-subtle)] max-w-full">
            <span className="font-bold shrink-0" style={{ color: TYPE_COLORS[step.type] || 'var(--text-secondary)' }}>
              [{step.type.toUpperCase()}]
            </span>
            <span className="text-tf-text2 break-words whitespace-normal">
              {step.description}
            </span>
          </div>
        ) : (
          <span className="text-[10px] text-tf-muted font-mono">Ready</span>
        )}
      </div>
    </div>
  );
}
