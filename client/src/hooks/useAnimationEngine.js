/**
 * @file useAnimationEngine.js
 * @description Custom hook that drives step-by-step animation playback.
 *              Supports play/pause/step/reset with speed control and keyboard shortcuts.
 * @module hooks/useAnimationEngine
 * @exports useAnimationEngine
 */

import { useRef, useEffect, useCallback } from 'react';
import { useTrace, ActionTypes } from '../context/TraceContext';

/**
 * Provides animation playback controls for the visualizer.
 *
 * @returns {{
 *   play: () => void,
 *   pause: () => void,
 *   stepForward: () => void,
 *   stepBackward: () => void,
 *   reset: () => void,
 *   isPlaying: boolean
 * }}
 */
export function useAnimationEngine() {
  const { state, dispatch } = useTrace();
  const { steps, currentStep, status, speed } = state;

  /** Ref holding the setInterval ID. */
  const intervalRef = useRef(null);

  /** Whether playback is currently active. */
  const isPlaying = status === 'playing';

  /**
   * Clear any active playback interval.
   */
  const clearPlayback = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  /**
   * Start auto-advancing through steps at the configured speed.
   */
  const play = useCallback(() => {
    if (steps.length === 0) return;
    clearPlayback();

    /* If at the end, restart from beginning. */
    let startIdx = currentStep;
    if (currentStep >= steps.length - 1) {
      startIdx = -1;
      dispatch({ type: ActionTypes.SET_STEP, payload: -1 });
    }

    dispatch({ type: ActionTypes.SET_STATUS, payload: 'playing' });

    let idx = startIdx;
    intervalRef.current = setInterval(() => {
      idx++;
      if (idx >= steps.length) {
        clearPlayback();
        dispatch({ type: ActionTypes.SET_STATUS, payload: 'done' });
        return;
      }
      dispatch({ type: ActionTypes.SET_STEP, payload: idx });
      if (idx >= steps.length - 1) {
        clearPlayback();
        dispatch({ type: ActionTypes.SET_STATUS, payload: 'done' });
      }
    }, speed);
  }, [steps, currentStep, speed, dispatch, clearPlayback]);

  /**
   * Pause playback.
   */
  const pause = useCallback(() => {
    clearPlayback();
    dispatch({ type: ActionTypes.SET_STATUS, payload: 'paused' });
  }, [dispatch, clearPlayback]);

  /**
   * Advance by one step.
   */
  const stepForward = useCallback(() => {
    if (steps.length === 0) return;
    clearPlayback();
    const next = currentStep + 1;
    if (next < steps.length) {
      dispatch({ type: ActionTypes.SET_STEP, payload: next });
      dispatch({
        type: ActionTypes.SET_STATUS,
        payload: next >= steps.length - 1 ? 'done' : 'paused'
      });
    }
  }, [steps, currentStep, dispatch, clearPlayback]);

  /**
   * Go back by one step.
   */
  const stepBackward = useCallback(() => {
    clearPlayback();
    const prev = currentStep - 1;
    if (prev >= 0) {
      dispatch({ type: ActionTypes.SET_STEP, payload: prev });
      dispatch({ type: ActionTypes.SET_STATUS, payload: 'paused' });
    } else if (currentStep === 0) {
      dispatch({ type: ActionTypes.SET_STEP, payload: -1 });
      dispatch({ type: ActionTypes.SET_STATUS, payload: 'idle' });
    }
  }, [currentStep, dispatch, clearPlayback]);

  /**
   * Full reset.
   */
  const reset = useCallback(() => {
    clearPlayback();
    dispatch({ type: ActionTypes.RESET });
  }, [dispatch, clearPlayback]);

  /* Clean up interval on unmount. */
  useEffect(() => {
    return () => clearPlayback();
  }, [clearPlayback]);

  /* Restart interval when speed changes during playback. */
  useEffect(() => {
    if (status === 'playing') {
      play();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speed]);

  /* Keyboard shortcuts. */
  useEffect(() => {
    function handleKey(e) {
      /* Don't capture when user is typing in an input or textarea. */
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          if (isPlaying) pause();
          else play();
          break;
        case 'ArrowRight':
          e.preventDefault();
          stepForward();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          stepBackward();
          break;
        case 'KeyR':
          e.preventDefault();
          reset();
          break;
        default:
          break;
      }
    }

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isPlaying, play, pause, stepForward, stepBackward, reset]);

  return { play, pause, stepForward, stepBackward, reset, isPlaying };
}
