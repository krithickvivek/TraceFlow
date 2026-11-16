/**
 * @file bubbleSort.js
 * @description Bubble Sort step generator for TraceFlow V2. Produces an array of
 *              step objects that capture every comparison and swap so the
 *              visualizer can replay the algorithm frame-by-frame.
 * @exports generateSteps, metadata, pseudoCode
 */

/** Algorithm metadata displayed in the UI and served by the API. */
export const metadata = {
  name: 'Bubble Sort',
  slug: 'bubble-sort',
  category: 'Sorting',
  difficulty: 'Beginner',
  icon: 'bubble',
  timeComplexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
  spaceComplexity: 'O(1)',
  complexityNote: 'n = number of elements in the array',
  stable: true,
  description:
    'Repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order.'
};

/**
 * Pseudocode representation of Bubble Sort.
 * Each object maps a line number to the code string displayed in the UI.
 * The `activeLines` field on each step references these line numbers.
 *
 * @type {Array<{ line: number, code: string }>}
 */
export const pseudoCode = [
  { line: 1, code: 'function bubbleSort(arr):' },
  { line: 2, code: '  n = arr.length' },
  { line: 3, code: '  for pass = 0 to n - 2:' },
  { line: 4, code: '    swapped = false' },
  { line: 5, code: '    for j = 0 to n - 2 - pass:' },
  { line: 6, code: '      if arr[j] > arr[j + 1]:' },
  { line: 7, code: '        swap(arr[j], arr[j + 1])' },
  { line: 8, code: '        swapped = true' },
  { line: 9, code: '    if not swapped:' },
  { line: 10, code: '      break  // array is sorted' },
  { line: 11, code: '  return arr' }
];

/**
 * Generate an array of step objects representing a full Bubble Sort execution.
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
 * }>} Ordered list of steps from first comparison to final "done" marker.
 */
export function generateSteps(inputArray) {
  /* Work on a copy so the caller's data stays intact. */
  const arr = [...inputArray];
  const n = arr.length;

  /** @type {Array<Object>} Accumulated step objects */
  const steps = [];

  /** Running counters */
  let comparisons = 0;
  let swaps = 0;

  for (let pass = 0; pass < n - 1; pass++) {
    let swappedThisPass = false;

    for (let j = 0; j < n - 1 - pass; j++) {
      /* ── Compare step ── */
      comparisons++;
      steps.push({
        type: 'compare',
        array: [...arr],
        indices: [j, j + 1],
        activeLines: [5, 6],
        description: `Comparing ${arr[j]} and ${arr[j + 1]} at positions ${j} and ${j + 1}`,
        pass,
        comparisons,
        swaps
      });

      if (arr[j] > arr[j + 1]) {
        /* ── Swap step ── */
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swaps++;
        swappedThisPass = true;

        steps.push({
          type: 'swap',
          array: [...arr],
          indices: [j, j + 1],
          activeLines: [7, 8],
          description: `Swapped ${arr[j + 1]} and ${arr[j]} at positions ${j} and ${j + 1}`,
          pass,
          comparisons,
          swaps
        });
      }
    }

    /* After each pass the last unsorted element is now in place. */
    const sortedIdx = n - 1 - pass;

    steps.push({
      type: 'sorted',
      array: [...arr],
      indices: [sortedIdx],
      activeLines: [3],
      description: `Position ${sortedIdx} (value ${arr[sortedIdx]}) is now in its final sorted position`,
      pass,
      comparisons,
      swaps
    });

    /* Early termination: no swaps means array is already sorted. */
    if (!swappedThisPass) {
      break;
    }
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
