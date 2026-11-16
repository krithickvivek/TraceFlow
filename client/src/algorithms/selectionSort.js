/**
 * @file selectionSort.js
 * @description Selection Sort step generator for TraceFlow V2. Finds the minimum
 *              element in the unsorted portion and swaps it into position. Produces
 *              step objects for every comparison, min-update, and swap.
 * @exports generateSteps, metadata, pseudoCode
 */

/** Algorithm metadata displayed in the UI and served by the API. */
export const metadata = {
  name: 'Selection Sort',
  slug: 'selection-sort',
  category: 'Sorting',
  difficulty: 'Beginner',
  icon: 'selection',
  timeComplexity: { best: 'O(n²)', average: 'O(n²)', worst: 'O(n²)' },
  spaceComplexity: 'O(1)',
  complexityNote: 'n = number of elements in the array',
  stable: false,
  description:
    'Divides the array into sorted and unsorted regions, repeatedly selecting the smallest element from the unsorted region and moving it to the end of the sorted region.'
};

/**
 * Pseudocode representation of Selection Sort.
 * Each object maps a line number to the code string displayed in the UI.
 *
 * @type {Array<{ line: number, code: string }>}
 */
export const pseudoCode = [
  { line: 1, code: 'function selectionSort(arr):' },
  { line: 2, code: '  n = arr.length' },
  { line: 3, code: '  for i = 0 to n - 2:' },
  { line: 4, code: '    minIndex = i' },
  { line: 5, code: '    for j = i + 1 to n - 1:' },
  { line: 6, code: '      if arr[j] < arr[minIndex]:' },
  { line: 7, code: '        minIndex = j' },
  { line: 8, code: '    if minIndex != i:' },
  { line: 9, code: '      swap(arr[i], arr[minIndex])' },
  { line: 10, code: '    // arr[i] is now sorted' },
  { line: 11, code: '  return arr' }
];

/**
 * Generate an array of step objects representing a full Selection Sort execution.
 *
 * @param {number[]} inputArray - The array to sort. **Never mutated.**
 * @returns {Array<{
 *   type: 'compare'|'set'|'swap'|'sorted'|'done',
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

  for (let i = 0; i < n - 1; i++) {
    let minIndex = i;

    for (let j = i + 1; j < n; j++) {
      /* ── Compare step ── */
      comparisons++;
      steps.push({
        type: 'compare',
        array: [...arr],
        indices: [j, minIndex],
        activeLines: [5, 6],
        description: `Comparing ${arr[j]} (pos ${j}) with current min ${arr[minIndex]} (pos ${minIndex})`,
        pass: i,
        comparisons,
        swaps
      });

      if (arr[j] < arr[minIndex]) {
        /* ── Set (new minimum found) step ── */
        minIndex = j;
        steps.push({
          type: 'set',
          array: [...arr],
          indices: [j, minIndex],
          activeLines: [7],
          description: `New minimum found: ${arr[minIndex]} at position ${minIndex}`,
          pass: i,
          comparisons,
          swaps
        });
      }
    }

    if (minIndex !== i) {
      /* ── Swap step ── */
      [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];
      swaps++;
      steps.push({
        type: 'swap',
        array: [...arr],
        indices: [i, minIndex],
        activeLines: [8, 9],
        description: `Swapped ${arr[i]} (pos ${i}) with ${arr[minIndex]} (pos ${minIndex})`,
        pass: i,
        comparisons,
        swaps
      });
    }

    /* ── Sorted step ── */
    steps.push({
      type: 'sorted',
      array: [...arr],
      indices: [i],
      activeLines: [10],
      description: `Position ${i} (value ${arr[i]}) is now in its final sorted position`,
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
    activeLines: [11],
    description: 'Array is fully sorted!',
    pass: -1,
    comparisons,
    swaps
  });

  return steps;
}
