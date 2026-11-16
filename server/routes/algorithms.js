/**
 * @file algorithms.js
 * @description API route that returns metadata for all available algorithms.
 * @module routes/algorithms
 */

const express = require('express');
const router = express.Router();

/** Static list of algorithm metadata served by the API. */
const ALGORITHMS = [
  {
    name: 'Bubble Sort', slug: 'bubble-sort', category: 'Sorting',
    difficulty: 'Beginner',
    timeComplexity: { best: 'O(n)', average: 'O(n\u00B2)', worst: 'O(n\u00B2)' },
    spaceComplexity: 'O(1)', stable: true,
    description: 'Repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order.'
  },
  {
    name: 'Selection Sort', slug: 'selection-sort', category: 'Sorting',
    difficulty: 'Beginner',
    timeComplexity: { best: 'O(n\u00B2)', average: 'O(n\u00B2)', worst: 'O(n\u00B2)' },
    spaceComplexity: 'O(1)', stable: false,
    description: 'Finds the minimum element from the unsorted part and moves it to the beginning.'
  },
  {
    name: 'Insertion Sort', slug: 'insertion-sort', category: 'Sorting',
    difficulty: 'Beginner',
    timeComplexity: { best: 'O(n)', average: 'O(n\u00B2)', worst: 'O(n\u00B2)' },
    spaceComplexity: 'O(1)', stable: true,
    description: 'Builds the sorted array one element at a time by inserting each into its correct position.'
  },
  {
    name: 'Merge Sort', slug: 'merge-sort', category: 'Sorting',
    difficulty: 'Intermediate',
    timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
    spaceComplexity: 'O(n)', stable: true,
    description: 'Divides the array into halves, sorts each half, and merges them back together.'
  },
  {
    name: 'Quick Sort', slug: 'quick-sort', category: 'Sorting',
    difficulty: 'Intermediate',
    timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n\u00B2)' },
    spaceComplexity: 'O(log n)', stable: false,
    description: 'Picks a pivot, partitions elements around it, and recursively sorts the partitions.'
  },
  {
    name: 'Linear Search', slug: 'linear-search', category: 'Searching',
    difficulty: 'Beginner',
    timeComplexity: { best: 'O(1)', average: 'O(n)', worst: 'O(n)' },
    spaceComplexity: 'O(1)', stable: true,
    description: 'Sequentially checks each element until the target is found or the list is exhausted.'
  },
  {
    name: 'Binary Search', slug: 'binary-search', category: 'Searching',
    difficulty: 'Beginner',
    timeComplexity: { best: 'O(1)', average: 'O(log n)', worst: 'O(log n)' },
    spaceComplexity: 'O(1)', stable: true,
    description: 'Repeatedly divides the sorted search interval in half to locate the target.'
  }
];

/**
 * GET /api/algorithms
 * Returns the full list of algorithm metadata.
 */
router.get('/', (_req, res) => {
  res.json({ algorithms: ALGORITHMS });
});

module.exports = router;
