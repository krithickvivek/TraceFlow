/**
 * @file insertionSort.js
 * @description Insertion Sort step generator for TraceFlow V2. Builds a sorted
 *              portion one element at a time by shifting larger elements right.
 *              Produces step objects for every comparison and shift/swap.
 * @exports generateSteps, metadata, pseudoCode
 */

/** Algorithm metadata displayed in the UI and served by the API. */
export const metadata = {
  name: 'Insertion Sort',
  slug: 'insertion-sort',
  category: 'Sorting',
  difficulty: 'Beginner',
  icon: 'insertion',
  timeComplexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
  spaceComplexity: 'O(1)',
  complexityNote: 'n = number of elements in the array',
  stable: true,
  description:
    'Builds the sorted array one item at a time by repeatedly picking the next element and inserting it into its correct position among the already-sorted elements.'
};

/**
 * Pseudocode representation of Insertion Sort.
 *
 * @type {Array<{ line: number, code: string }>}
 */
export const pseudoCode = [
  { line: 1, code: 'function insertionSort(arr):' },
  { line: 2, code: '  for i = 1 to arr.length - 1:' },
  { line: 3, code: '    key = arr[i]' },
  { line: 4, code: '    j = i - 1' },
  { line: 5, code: '    while j >= 0 and arr[j] > key:' },
  { line: 6, code: '      arr[j + 1] = arr[j]  // shift right' },
  { line: 7, code: '      j = j - 1' },
  { line: 8, code: '    arr[j + 1] = key' },
  { line: 9, code: '  return arr' }
];

/**
 * Generate an array of step objects representing a full Insertion Sort execution.
 *
 * @param {number[]} inputArray - The array to sort. **Never mutated.**
 * @returns {Array<{
 *   type: 'compare'|'swap'|'sorted'|'done',
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

  for (let i = 1; i < n; i++) {
    const key = arr[i];
    let j = i - 1;

    /* ── Compare with the element to the left ── */
    while (j >= 0) {
      comparisons++;
      steps.push({
        type: 'compare',
        array: [...arr],
        indices: [j, j + 1],
        activeLines: [5],
        description: `Comparing ${arr[j]} (pos ${j}) with key ${key}`,
        pass: i,
        comparisons,
        swaps
      });

      if (arr[j] > key) {
        /* ── Shift right (swap) step ── */
        arr[j + 1] = arr[j];
        swaps++;
        steps.push({
          type: 'swap',
          array: [...arr],
          indices: [j, j + 1],
          activeLines: [6, 7],
          description: `Shifted ${arr[j]} from position ${j} to position ${j + 1}`,
          pass: i,
          comparisons,
          swaps
        });
        j--;
      } else {
        break;
      }
    }

    /* Place the key in its correct position. */
    arr[j + 1] = key;

    /* ── Sorted step: element i is now placed correctly in the sorted portion ── */
    steps.push({
      type: 'sorted',
      array: [...arr],
      indices: [j + 1],
      activeLines: [8],
      description: `Inserted ${key} at position ${j + 1}`,
      pass: i,
      comparisons,
      swaps
    });
  }

  /* Final done step. */
  steps.push({
    type: 'done',
    array: [...arr],
    indices: [],
    activeLines: [9],
    description: 'Array is fully sorted!',
    pass: -1,
    comparisons,
    swaps
  });

  return steps;
}
