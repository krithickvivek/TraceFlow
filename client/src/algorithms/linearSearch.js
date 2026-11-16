/**
 * @file linearSearch.js
 * @description Linear Search step generator for TraceFlow V2. Scans the array
 *              from left to right looking for a target value. Produces step
 *              objects for every comparison.
 * @exports generateSteps, metadata, pseudoCode
 */

/** Algorithm metadata displayed in the UI and served by the API. */
export const metadata = {
  name: 'Linear Search',
  slug: 'linear-search',
  category: 'Searching',
  difficulty: 'Beginner',
  icon: 'linear',
  timeComplexity: { best: 'O(1)', average: 'O(n)', worst: 'O(n)' },
  spaceComplexity: 'O(1)',
  complexityNote: 'n = number of elements in the array',
  stable: true,
  description:
    'Sequentially checks each element of the array until the target is found or the end of the array is reached.'
};

/**
 * Pseudocode representation of Linear Search.
 *
 * @type {Array<{ line: number, code: string }>}
 */
export const pseudoCode = [
  { line: 1, code: 'function linearSearch(arr, target):' },
  { line: 2, code: '  for i = 0 to arr.length - 1:' },
  { line: 3, code: '    if arr[i] == target:' },
  { line: 4, code: '      return i  // found' },
  { line: 5, code: '  return -1  // not found' }
];

/**
 * Generate an array of step objects representing a full Linear Search execution.
 *
 * @param {{ array: number[], target: number }} params
 * @param {number[]} params.array  - The array to search. **Never mutated.**
 * @param {number}   params.target - The value to search for.
 * @returns {Array<{
 *   type: 'compare'|'found'|'not-found'|'done',
 *   array: number[],
 *   indices: number[],
 *   activeLines: number[],
 *   description: string,
 *   pass: number,
 *   comparisons: number,
 *   swaps: number
 * }>} Ordered list of steps.
 */
export function generateSteps({ array: inputArray, target }) {
  /* Clone to avoid mutating the caller's data. */
  const arr = [...inputArray];
  const n = arr.length;

  /** @type {Array<Object>} */
  const steps = [];

  let comparisons = 0;
  const swaps = 0; // Linear search never swaps.

  for (let i = 0; i < n; i++) {
    comparisons++;

    if (arr[i] === target) {
      /* ── Found step ── */
      steps.push({
        type: 'found',
        array: [...arr],
        indices: [i],
        activeLines: [3, 4],
        description: `Found target ${target} at position ${i}`,
        pass: i,
        comparisons,
        swaps
      });

      /* ── Done step ── */
      steps.push({
        type: 'done',
        array: [...arr],
        indices: [i],
        activeLines: [4],
        description: `Search complete! Target ${target} found at index ${i}.`,
        pass: -1,
        comparisons,
        swaps
      });

      return steps;
    }

    /* ── Compare step (not a match) ── */
    steps.push({
      type: 'compare',
      array: [...arr],
      indices: [i],
      activeLines: [2, 3],
      description: `Checking position ${i}: ${arr[i]} ≠ ${target}`,
      pass: i,
      comparisons,
      swaps
    });
  }

  /* ── Not found step ── */
  steps.push({
    type: 'not-found',
    array: [...arr],
    indices: [],
    activeLines: [5],
    description: `Target ${target} was not found in the array`,
    pass: n,
    comparisons,
    swaps
  });

  /* ── Done step ── */
  steps.push({
    type: 'done',
    array: [...arr],
    indices: [],
    activeLines: [5],
    description: `Search complete! Target ${target} is not in the array.`,
    pass: -1,
    comparisons,
    swaps
  });

  return steps;
}
