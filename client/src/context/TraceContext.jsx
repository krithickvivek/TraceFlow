/**
 * @file TraceContext.jsx
 * @description Global state management for TraceFlow V2 using React Context
 *              and useReducer. Supports sorting, searching, and backtracking algorithms.
 * @module context/TraceContext
 * @exports TraceProvider, useTrace, ActionTypes
 */

import { createContext, useContext, useReducer } from 'react';
import PropTypes from 'prop-types';

/* ── Constants ── */

/** Default algorithm shown on first load. */
const DEFAULT_ALGORITHM = 'bubble-sort';

/** Default array used before the user provides custom input. */
const DEFAULT_ARRAY = [64, 34, 25, 12, 22, 11, 90];

/** Minimum speed in milliseconds per step. */
export const MIN_SPEED = 50;

/** Maximum speed in milliseconds per step. */
export const MAX_SPEED = 1500;

/** Speed slider step size. */
export const SPEED_STEP = 50;

/** Default speed overrides per algorithm for optimal viewing experience. */
const ALGO_DEFAULT_SPEEDS = {
  'maze-solver': 300,
  'n-queens': 400,
  'knights-tour': 200,
  'sudoku-solver': 80,
  'graph-bfs': 500,
};

/* ── Initial state ── */

/** @type {TraceState} */
const initialState = {
  selectedAlgorithm: DEFAULT_ALGORITHM,
  inputArray: DEFAULT_ARRAY,
  searchTarget: null,
  inputConfig: null,
  steps: [],
  currentStep: -1,
  status: 'idle',
  speed: 500,
  totalComparisons: 0,
  totalSwaps: 0,
  isGenerated: false
};

/* ── Action types ── */

/**
 * @readonly
 * @enum {string}
 */
export const ActionTypes = {
  SET_ALGORITHM: 'SET_ALGORITHM',
  SET_INPUT: 'SET_INPUT',
  SET_TARGET: 'SET_TARGET',
  SET_INPUT_CONFIG: 'SET_INPUT_CONFIG',
  GENERATE_STEPS: 'GENERATE_STEPS',
  SET_STEP: 'SET_STEP',
  NEXT_STEP: 'NEXT_STEP',
  PREV_STEP: 'PREV_STEP',
  SET_STATUS: 'SET_STATUS',
  SET_SPEED: 'SET_SPEED',
  RESET: 'RESET'
};

/**
 * Pure reducer function for trace state transitions.
 *
 * @param {TraceState} state
 * @param {{ type: string, payload?: any, algorithms?: object }} action
 * @returns {TraceState}
 */
function traceReducer(state, action) {
  switch (action.type) {
    /* Switch to a different algorithm; clears steps. */
    case ActionTypes.SET_ALGORITHM:
      return {
        ...state,
        selectedAlgorithm: action.payload,
        steps: [],
        currentStep: -1,
        status: 'idle',
        totalComparisons: 0,
        totalSwaps: 0,
        isGenerated: false,
        inputConfig: null
      };

    /* Update the input array from user input or randomize. */
    case ActionTypes.SET_INPUT:
      return {
        ...state,
        inputArray: action.payload,
        steps: [],
        currentStep: -1,
        status: 'idle',
        totalComparisons: 0,
        totalSwaps: 0,
        isGenerated: false
      };

    /* Set search target for search algorithms. */
    case ActionTypes.SET_TARGET:
      return { ...state, searchTarget: action.payload };

    /* Store backtracking input configuration. */
    case ActionTypes.SET_INPUT_CONFIG:
      return {
        ...state,
        inputConfig: action.payload,
        steps: [],
        currentStep: -1,
        status: 'idle',
        totalComparisons: 0,
        totalSwaps: 0,
        isGenerated: false
      };

    /* Generate steps using the algorithm registry passed via action. */
    case ActionTypes.GENERATE_STEPS: {
      const algos = action.algorithms;
      if (!algos) return state;
      const algo = algos[state.selectedAlgorithm];
      if (!algo) return state;

      const category = algo.metadata.category;
      const isSearch = category === 'Searching';
      const isBacktracking = category === 'Backtracking' || category === 'Graph';
      const needsSorted = state.selectedAlgorithm === 'binary-search';
      let steps;
      let finalArray = state.inputArray;

      if (isBacktracking) {
        /* Backtracking algorithms use inputConfig instead of inputArray */
        const config = state.inputConfig || { type: 'backtracking', slug: state.selectedAlgorithm };
        steps = algo.generateSteps(config);
      } else if (isSearch) {
        /* Binary Search needs a sorted array — sort it and update state */
        if (needsSorted) {
          finalArray = [...state.inputArray].sort((a, b) => a - b);
        }
        const target = state.searchTarget ?? finalArray[0];
        steps = algo.generateSteps({ array: finalArray, target });
      } else {
        steps = algo.generateSteps(state.inputArray);
      }

      /* Auto-set speed for backtracking algorithms on first generate */
      const autoSpeed = ALGO_DEFAULT_SPEEDS[state.selectedAlgorithm];

      return {
        ...state,
        inputArray: finalArray,
        steps,
        currentStep: steps.length > 0 ? 0 : -1,
        status: 'idle',
        totalComparisons: steps.length > 0 ? (steps[0].comparisons || 0) : 0,
        totalSwaps: steps.length > 0 ? (steps[0].swaps || 0) : 0,
        isGenerated: true,
        ...(autoSpeed && !state.isGenerated ? { speed: autoSpeed } : {})
      };
    }

    /* Jump to a specific step index; update running stats. */
    case ActionTypes.SET_STEP: {
      const idx = action.payload;
      const step = state.steps[idx];
      return {
        ...state,
        currentStep: idx,
        totalComparisons: step ? step.comparisons : 0,
        totalSwaps: step ? step.swaps : 0
      };
    }

    /* Advance by one step. */
    case ActionTypes.NEXT_STEP: {
      const next = state.currentStep + 1;
      if (next >= state.steps.length) return state;
      const step = state.steps[next];
      return {
        ...state,
        currentStep: next,
        totalComparisons: step ? step.comparisons : 0,
        totalSwaps: step ? step.swaps : 0,
        status: next >= state.steps.length - 1 ? 'done' : state.status
      };
    }

    /* Go back one step. */
    case ActionTypes.PREV_STEP: {
      const prev = state.currentStep - 1;
      if (prev < -1) return state;
      const step = prev >= 0 ? state.steps[prev] : null;
      return {
        ...state,
        currentStep: prev,
        totalComparisons: step ? step.comparisons : 0,
        totalSwaps: step ? step.swaps : 0,
        status: prev < 0 ? 'idle' : 'paused'
      };
    }

    /* Transition playback status. */
    case ActionTypes.SET_STATUS:
      return { ...state, status: action.payload };

    /* Adjust playback speed (ms per step). */
    case ActionTypes.SET_SPEED:
      return { ...state, speed: action.payload };

    /* Full reset: keep algorithm and input, clear playback. */
    case ActionTypes.RESET:
      return {
        ...state,
        currentStep: -1,
        status: 'idle',
        totalComparisons: 0,
        totalSwaps: 0
      };

    default:
      return state;
  }
}

/* ── Context ── */

const TraceContext = createContext(null);

/**
 * Provider component that wraps the application and supplies trace state.
 *
 * @param {{ children: React.ReactNode }} props
 * @returns {JSX.Element}
 */
export function TraceProvider({ children }) {
  const [state, dispatch] = useReducer(traceReducer, initialState);

  return (
    <TraceContext.Provider value={{ state, dispatch }}>
      {children}
    </TraceContext.Provider>
  );
}

TraceProvider.propTypes = {
  children: PropTypes.node.isRequired
};

/**
 * Custom hook for accessing trace state and dispatch.
 *
 * @returns {{ state: TraceState, dispatch: Function }}
 */
export function useTrace() {
  const context = useContext(TraceContext);
  if (!context) throw new Error('useTrace must be used within a TraceProvider');
  return context;
}
