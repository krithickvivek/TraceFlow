/**
 * @file mergeSort.js
 * @description Bottom-up iterative Merge Sort step generator for TraceFlow V2.
 *              Merges successively larger subarrays without recursion. Produces
 *              step objects for every comparison and merge operation.
 * @exports generateSteps, metadata, pseudoCode
 */

/** Algorithm metadata displayed in the UI and served by the API. */
export const metadata = {
  name: 'Merge Sort',
  slug: 'merge-sort',
  category: 'Sorting',
  difficulty: 'Intermediate',
  icon: 'merge',
  timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
  spaceComplexity: 'O(n)',
  complexityNote: 'n = number of elements in the array',
  stable: true,
  description:
    'Divides the array into smaller subarrays, sorts each, and merges them back together. This implementation uses a bottom-up iterative approach.'
};

/**
 * Pseudocode representation of bottom-up Merge Sort.
 *
 * @type {Array<{ line: number, code: string }>}
 */
export const pseudoCode = [
  { line: 1, code: 'function mergeSort(arr):' },
  { line: 2, code: '  n = arr.length' },
  { line: 3, code: '  for width = 1; width < n; width *= 2:' },
  { line: 4, code: '    for left = 0; left < n; left += 2 * width:' },
  { line: 5, code: '      mid = min(left + width, n)' },
  { line: 6, code: '      right = min(left + 2 * width, n)' },
  { line: 7, code: '      merge(arr, left, mid, right)' },
  { line: 8, code: '' },
  { line: 9, code: 'function merge(arr, left, mid, right):' },
  { line: 10, code: '  temp = []' },
  { line: 11, code: '  i = left, j = mid' },
  { line: 12, code: '  while i < mid and j < right:' },
  { line: 13, code: '    if arr[i] <= arr[j]: temp.push(arr[i++])' },
  { line: 14, code: '    else: temp.push(arr[j++])' },
  { line: 15, code: '  copy remaining from left and right halves' },
  { line: 16, code: '  copy temp back into arr[left..right]' },
  { line: 17, code: '  return arr' }
];

/**
 * Generate an array of step objects representing a full bottom-up Merge Sort execution.
 *
 * @param {number[]} inputArray - The array to sort. **Never mutated.**
 * @returns {Array<{
 *   type: 'compare'|'merge'|'sorted'|'done',
 *   array: number[],
 *   indices: number[],
 *   activeLines: number[],
 *   description: string,
 *   pass: number,
 *   comparisons: number,
 *   swaps: number
 * }>} Ordered list of steps.
 */
export function generateSteps(inputArray) {
  /* Clone to avoid mutating the caller's data. */
  const arr = [...inputArray];
  const n = arr.length;

  /** @type {Array<Object>} */
  const steps = [];

  let comparisons = 0;
  let swaps = 0;
  let pass = 0;

  /**
   * Merge arr[left..mid) and arr[mid..right) in place, recording steps.
   *
   * @param {number} left  - Start index (inclusive).
   * @param {number} mid   - Boundary between left and right halves.
   * @param {number} right - End index (exclusive).
   */
  function merge(left, mid, right) {
    const temp = [];
    let i = left;
    let j = mid;

    while (i < mid && j < right) {
      comparisons++;
      steps.push({
        type: 'compare',
        array: [...arr],
        indices: [i, j],
        activeLines: [12, 13],
        description: `Comparing ${arr[i]} (pos ${i}) with ${arr[j]} (pos ${j})`,
        pass,
        comparisons,
        swaps
      });

      if (arr[i] <= arr[j]) {
        temp.push(arr[i++]);
      } else {
        temp.push(arr[j++]);
      }
    }

    /* Copy remaining elements from the left half. */
    while (i < mid) {
      temp.push(arr[i++]);
    }

    /* Copy remaining elements from the right half. */
    while (j < right) {
      temp.push(arr[j++]);
    }

    /* Write the merged result back into the main array. */
    for (let k = 0; k < temp.length; k++) {
      arr[left + k] = temp[k];
    }
    swaps += temp.length;

    /* ── Merge step: show the merged window ── */
    steps.push({
      type: 'merge',
      array: [...arr],
      indices: [left, right - 1],
      activeLines: [15, 16],
      description: `Merged subarray from position ${left} to ${right - 1}`,
      pass,
      comparisons,
      swaps
    });
  }

  /* ── Bottom-up iteration: double the width each pass ── */
  for (let width = 1; width < n; width *= 2) {
    for (let left = 0; left < n; left += 2 * width) {
      const mid = Math.min(left + width, n);
      const right = Math.min(left + 2 * width, n);

      if (mid < right) {
        merge(left, mid, right);
      }
    }
    pass++;
  }

  /* ── Mark every position as sorted ── */
  for (let i = 0; i < n; i++) {
    steps.push({
      type: 'sorted',
      array: [...arr],
      indices: [i],
      activeLines: [17],
      description: `Position ${i} (value ${arr[i]}) is in its final sorted position`,
      pass,
      comparisons,
      swaps
    });
  }

  /* Final done step. */
  steps.push({
    type: 'done',
    array: [...arr],
    indices: [],
    activeLines: [17],
    description: 'Array is fully sorted!',
    pass: -1,
    comparisons,
    swaps
  });

  return steps;
}
