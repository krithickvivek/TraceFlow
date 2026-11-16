/**
 * @file quickSort.js
 * @description Iterative Quick Sort step generator for TraceFlow V2. Uses an
 *              explicit stack instead of recursion. Produces step objects for
 *              pivot selection, comparisons, and swaps.
 * @exports generateSteps, metadata, pseudoCode
 */

/** Algorithm metadata displayed in the UI and served by the API. */
export const metadata = {
  name: 'Quick Sort',
  slug: 'quick-sort',
  category: 'Sorting',
  difficulty: 'Intermediate',
  icon: 'quick',
  timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n²)' },
  spaceComplexity: 'O(log n)',
  complexityNote: 'n = number of elements in the array',
  stable: false,
  description:
    'Selects a pivot element and partitions the array so that smaller elements go left and larger elements go right. This implementation uses an explicit stack for iteration.'
};

/**
 * Pseudocode representation of iterative Quick Sort (Lomuto partition).
 *
 * @type {Array<{ line: number, code: string }>}
 */
export const pseudoCode = [
  { line: 1, code: 'function quickSort(arr):' },
  { line: 2, code: '  stack = [(0, arr.length - 1)]' },
  { line: 3, code: '  while stack is not empty:' },
  { line: 4, code: '    (low, high) = stack.pop()' },
  { line: 5, code: '    if low < high:' },
  { line: 6, code: '      pivotIndex = partition(arr, low, high)' },
  { line: 7, code: '      stack.push((low, pivotIndex - 1))' },
  { line: 8, code: '      stack.push((pivotIndex + 1, high))' },
  { line: 9, code: '' },
  { line: 10, code: 'function partition(arr, low, high):' },
  { line: 11, code: '  pivot = arr[high]' },
  { line: 12, code: '  i = low - 1' },
  { line: 13, code: '  for j = low to high - 1:' },
  { line: 14, code: '    if arr[j] <= pivot:' },
  { line: 15, code: '      i++; swap(arr[i], arr[j])' },
  { line: 16, code: '  swap(arr[i + 1], arr[high])' },
  { line: 17, code: '  return i + 1' }
];

/**
 * Generate an array of step objects representing a full iterative Quick Sort execution.
 *
 * @param {number[]} inputArray - The array to sort. **Never mutated.**
 * @returns {Array<{
 *   type: 'pivot'|'compare'|'swap'|'sorted'|'done',
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

  /** Set of indices confirmed in their final sorted position. */
  const sortedSet = new Set();

  /**
   * Lomuto partition scheme.
   * Partitions arr[low..high] around arr[high] as pivot.
   *
   * @param {number} low  - Start index (inclusive).
   * @param {number} high - End index (inclusive), also the pivot position.
   * @returns {number} The final index of the pivot element.
   */
  function partition(low, high) {
    const pivot = arr[high];

    /* ── Pivot step ── */
    steps.push({
      type: 'pivot',
      array: [...arr],
      indices: [high],
      activeLines: [10, 11],
      description: `Pivot selected: ${pivot} at position ${high}`,
      pass,
      comparisons,
      swaps
    });

    let i = low - 1;

    for (let j = low; j < high; j++) {
      comparisons++;
      steps.push({
        type: 'compare',
        array: [...arr],
        indices: [j, high],
        activeLines: [13, 14],
        description: `Comparing ${arr[j]} (pos ${j}) with pivot ${pivot}`,
        pass,
        comparisons,
        swaps
      });

      if (arr[j] <= pivot) {
        i++;
        if (i !== j) {
          [arr[i], arr[j]] = [arr[j], arr[i]];
          swaps++;
          steps.push({
            type: 'swap',
            array: [...arr],
            indices: [i, j],
            activeLines: [15],
            description: `Swapped ${arr[i]} (pos ${i}) with ${arr[j]} (pos ${j})`,
            pass,
            comparisons,
            swaps
          });
        }
      }
    }

    /* Place pivot in its correct position. */
    const pivotFinal = i + 1;
    if (pivotFinal !== high) {
      [arr[pivotFinal], arr[high]] = [arr[high], arr[pivotFinal]];
      swaps++;
      steps.push({
        type: 'swap',
        array: [...arr],
        indices: [pivotFinal, high],
        activeLines: [16],
        description: `Placed pivot ${pivot} at its sorted position ${pivotFinal}`,
        pass,
        comparisons,
        swaps
      });
    }

    /* ── The pivot is now in its final sorted position ── */
    sortedSet.add(pivotFinal);
    steps.push({
      type: 'sorted',
      array: [...arr],
      indices: [pivotFinal],
      activeLines: [17],
      description: `Position ${pivotFinal} (value ${arr[pivotFinal]}) is now in its final sorted position`,
      pass,
      comparisons,
      swaps
    });

    return pivotFinal;
  }

  /* ── Iterative quick sort with explicit stack ── */
  /** @type {Array<[number, number]>} Stack of [low, high] pairs. */
  const stack = [[0, n - 1]];

  while (stack.length > 0) {
    const [low, high] = stack.pop();

    if (low < high) {
      const pivotIndex = partition(low, high);
      pass++;

      /* Push left subarray. */
      if (low < pivotIndex - 1) {
        stack.push([low, pivotIndex - 1]);
      } else if (pivotIndex - 1 >= 0 && pivotIndex - 1 < n) {
        /* Single element is automatically sorted. */
        sortedSet.add(low);
      }

      /* Push right subarray. */
      if (pivotIndex + 1 < high) {
        stack.push([pivotIndex + 1, high]);
      } else if (pivotIndex + 1 < n) {
        /* Single element is automatically sorted. */
        sortedSet.add(high);
      }
    } else if (low === high && low >= 0 && low < n) {
      /* Single-element partition is inherently sorted. */
      sortedSet.add(low);
    }
  }

  /* Mark any remaining unsorted positions (single-element partitions). */
  for (let i = 0; i < n; i++) {
    if (!sortedSet.has(i)) {
      steps.push({
        type: 'sorted',
        array: [...arr],
        indices: [i],
        activeLines: [17],
        description: `Position ${i} (value ${arr[i]}) is now in its final sorted position`,
        pass,
        comparisons,
        swaps
      });
    }
  }

  /* Final done step. */
  steps.push({
    type: 'done',
    array: [...arr],
    indices: [],
    activeLines: [1],
    description: 'Array is fully sorted!',
    pass: -1,
    comparisons,
    swaps
  });

  return steps;
}
