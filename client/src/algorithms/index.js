/**
 * @file index.js
 * @description Algorithm registry for TraceFlow V2. Every algorithm module is
 *              imported here and exposed through a single `algorithms` map
 *              keyed by slug. To add a new algorithm, import its module and
 *              add an entry — the rest of the app picks it up automatically.
 *
 *              Each entry includes a `visualizerType` field:
 *              - 'bar'    → D3 bar chart (sorting/searching)
 *              - 'grid'   → CSS grid visualizer (maze, n-queens, knight's tour)
 *              - 'sudoku' → dedicated 9×9 Sudoku board
 * @exports {Object} algorithms
 */

import * as bubbleSort from './bubbleSort';
import * as selectionSort from './selectionSort';
import * as insertionSort from './insertionSort';
import * as mergeSort from './mergeSort';
import * as quickSort from './quickSort';
import * as linearSearch from './linearSearch';
import * as binarySearch from './binarySearch';
import * as mazeSolver from './mazeSolver';
import * as nQueens from './nQueens';
import * as knightsTour from './knightsTour';
import * as sudokuSolver from './sudokuSolver';
import * as graphBFS from './graphBFS';

/**
 * Registry of available algorithms.
 * Key   = algorithm slug (used in URLs and state)
 * Value = { metadata, generateSteps, pseudoCode, visualizerType }
 *
 * @type {Object.<string, {metadata: Object, generateSteps: Function, pseudoCode: Array, visualizerType: string}>}
 */
export const algorithms = {
  /* ── Sorting ── */
  [bubbleSort.metadata.slug]: {
    metadata: bubbleSort.metadata,
    generateSteps: bubbleSort.generateSteps,
    pseudoCode: bubbleSort.pseudoCode,
    visualizerType: 'bar',
  },
  [selectionSort.metadata.slug]: {
    metadata: selectionSort.metadata,
    generateSteps: selectionSort.generateSteps,
    pseudoCode: selectionSort.pseudoCode,
    visualizerType: 'bar',
  },
  [insertionSort.metadata.slug]: {
    metadata: insertionSort.metadata,
    generateSteps: insertionSort.generateSteps,
    pseudoCode: insertionSort.pseudoCode,
    visualizerType: 'bar',
  },
  [mergeSort.metadata.slug]: {
    metadata: mergeSort.metadata,
    generateSteps: mergeSort.generateSteps,
    pseudoCode: mergeSort.pseudoCode,
    visualizerType: 'bar',
  },
  [quickSort.metadata.slug]: {
    metadata: quickSort.metadata,
    generateSteps: quickSort.generateSteps,
    pseudoCode: quickSort.pseudoCode,
    visualizerType: 'bar',
  },

  /* ── Searching ── */
  [linearSearch.metadata.slug]: {
    metadata: linearSearch.metadata,
    generateSteps: linearSearch.generateSteps,
    pseudoCode: linearSearch.pseudoCode,
    visualizerType: 'bar',
  },
  [binarySearch.metadata.slug]: {
    metadata: binarySearch.metadata,
    generateSteps: binarySearch.generateSteps,
    pseudoCode: binarySearch.pseudoCode,
    visualizerType: 'bar',
  },

  /* ── Backtracking ── */
  [mazeSolver.metadata.slug]: {
    metadata: mazeSolver.metadata,
    generateSteps: mazeSolver.generateSteps,
    pseudoCode: mazeSolver.pseudoCode,
    visualizerType: 'grid',
  },
  [nQueens.metadata.slug]: {
    metadata: nQueens.metadata,
    generateSteps: nQueens.generateSteps,
    pseudoCode: nQueens.pseudoCode,
    visualizerType: 'grid',
  },
  [knightsTour.metadata.slug]: {
    metadata: knightsTour.metadata,
    generateSteps: knightsTour.generateSteps,
    pseudoCode: knightsTour.pseudoCode,
    visualizerType: 'grid',
  },
  [sudokuSolver.metadata.slug]: {
    metadata: sudokuSolver.metadata,
    generateSteps: sudokuSolver.generateSteps,
    pseudoCode: sudokuSolver.pseudoCode,
    visualizerType: 'sudoku',
  },

  /* ── Graph ── */
  [graphBFS.metadata.slug]: {
    metadata: graphBFS.metadata,
    generateSteps: graphBFS.generateSteps,
    pseudoCode: graphBFS.pseudoCode,
    visualizerType: 'graph',
  },
};

/* ADDING A NEW ALGORITHM:
 * 1. Create src/algorithms/yourAlgo.js — export generateSteps, metadata, pseudoCode
 * 2. Set visualizerType: 'bar' | 'grid' | 'sudoku' | 'table' (future)
 * 3. Import and register here
 * 4. Add icon mapping in Sidebar.jsx if new category
 * Done. No other files need to change.
 */
