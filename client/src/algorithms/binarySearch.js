/**
 * @file binarySearch.js
 * @description Binary Search step generator for TraceFlow V2. Silently sorts the
 *              input array first, then performs iterative binary search. Produces
 *              step objects for every comparison and boundary update.
 * @exports generateSteps, metadata, pseudoCode
 */

/** Algorithm metadata displayed in the UI and served by the API. */
export const metadata = {
  name: 'Binary Search',
  slug: 'binary-search',
  category: 'Searching',
  difficulty: 'Intermediate',
  icon: 'binary',
  timeComplexity: { best: 'O(1)', average: 'O(log n)', worst: 'O(log n)' },
  spaceComplexity: 'O(1)',
  complexityNote: 'n = number of elements in the array',
  stable: true,
  description:
    'Efficiently finds a target value in a sorted array by repeatedly dividing the search interval in half. The input is silently sorted before searching.'
};

/**
 * Pseudocode representation of Binary Search.
 *
 * @type {Array<{ line: number, code: string }>}
 */
export const pseudoCode = [
  { line: 1, code: 'function binarySearch(arr, target):' },
  { line: 2, code: '  arr = sort(arr)  // ensure sorted' },
  { line: 3, code: '  left = 0' },
  { line: 4, code: '  right = arr.length - 1' },
  { line: 5, code: '  while left <= right:' },
  { line: 6, code: '    mid = floor((left + right) / 2)' },
  { line: 7, code: '    if arr[mid] == target:' },
  { line: 8, code: '      return mid  // found' },
  { line: 9, code: '    else if arr[mid] < target:' },
  { line: 10, code: '      left = mid + 1' },
  { line: 11, code: '    else:' },
  { line: 12, code: '      right = mid - 1' },
  { line: 13, code: '  return -1  // not found' }
];

/**
 * Generate an array of step objects representing a full Binary Search execution.
 * The input array is silently sorted (ascending) before the search begins.
 *
 * @param {{ array: number[], target: number }} params
 * @param {number[]} params.array  - The array to search. **Never mutated.**
 * @param {number}   params.target - The value to search for.
 * @returns {Array<{
 *   type: 'compare'|'set'|'found'|'not-found'|'done',
 *   array: number[],
 *   indices: number[],
 *   activeLines: number[],
 *   description: string,
 *   pass: number,
 *   comparisons: number,
 *   swaps: number
 * }>} Ordered list of steps. `indices` is always [left, mid, right].
 */
export function generateSteps({ array: inputArray, target }) {
  /* Clone and silently sort to guarantee binary search precondition. */
  const arr = [...inputArray].sort((a, b) => a - b);
  const n = arr.length;

  /** @type {Array<Object>} */
  const steps = [];

  let comparisons = 0;
  const swaps = 0; // Binary search never swaps.
  let pass = 0;

  let left = 0;
  let right = n - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    /* ── Compare step ── */
    comparisons++;
    steps.push({
      type: 'compare',
      array: [...arr],
      indices: [left, mid, right],
      activeLines: [6, 7],
      description: `Checking mid=${mid}: arr[${mid}] = ${arr[mid]}, target = ${target} (left=${left}, right=${right})`,
      pass,
      comparisons,
      swaps
    });

    if (arr[mid] === target) {
      /* ── Found step ── */
      steps.push({
        type: 'found',
        array: [...arr],
        indices: [left, mid, right],
        activeLines: [7, 8],
        description: `Found target ${target} at position ${mid}`,
        pass,
        comparisons,
        swaps
      });

      /* ── Done step ── */
      steps.push({
        type: 'done',
        array: [...arr],
        indices: [left, mid, right],
        activeLines: [8],
        description: `Search complete! Target ${target} found at index ${mid}.`,
        pass: -1,
        comparisons,
        swaps
      });

      return steps;
    } else if (arr[mid] < target) {
      /* ── Set step: move left boundary right ── */
      left = mid + 1;
      steps.push({
        type: 'set',
        array: [...arr],
        indices: [left, mid, right],
        activeLines: [9, 10],
        description: `${arr[mid]} < ${target}, moving left boundary to ${left}`,
        pass,
        comparisons,
        swaps
      });
    } else {
      /* ── Set step: move right boundary left ── */
      right = mid - 1;
      steps.push({
        type: 'set',
        array: [...arr],
        indices: [left, mid, right],
        activeLines: [11, 12],
        description: `${arr[mid]} > ${target}, moving right boundary to ${right}`,
        pass,
        comparisons,
        swaps
      });
    }

    pass++;
  }

  /* ── Not found step ── */
  steps.push({
    type: 'not-found',
    array: [...arr],
    indices: [],
    activeLines: [13],
    description: `Target ${target} was not found in the array`,
    pass,
    comparisons,
    swaps
  });

  /* ── Done step ── */
  steps.push({
    type: 'done',
    array: [...arr],
    indices: [],
    activeLines: [13],
    description: `Search complete! Target ${target} is not in the array.`,
    pass: -1,
    comparisons,
    swaps
  });

  return steps;
}
