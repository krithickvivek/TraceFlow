/**
 * @file knightsTour.js
 * @description Knight's Tour step generator for TraceFlow V2. Produces an array
 *              of step objects that capture every move, backtrack, and trial so
 *              the visualizer can replay the algorithm frame-by-frame.
 *              Uses Warnsdorff's heuristic to dramatically reduce backtracking.
 * @exports generateSteps, metadata, pseudoCode, KNIGHT_MOVES
 */

/** Algorithm metadata displayed in the UI and served by the API. */
export const metadata = {
  name: "Knight's Tour",
  slug: 'knights-tour',
  category: 'Backtracking',
  difficulty: 'Advanced',
  timeComplexity: { best: 'O(n\u00B2)', average: 'O(n\u00B2) with heuristic', worst: 'O(8^(n\u00B2))' },
  spaceComplexity: 'O(n\u00B2)',
  complexityNote: 'n = board dimension (n×n board)',
  stable: null,
  description:
    "Moves a chess knight to visit every square on an N\u00D7N board exactly once. Uses Warnsdorff's heuristic to dramatically reduce backtracking.",
  icon: 'knight'
};

/**
 * Pseudocode representation of the Knight's Tour algorithm.
 * Each object maps a line number to the code string displayed in the UI.
 * The `activeLines` field on each step references these line numbers.
 *
 * @type {Array<{ line: number, code: string }>}
 */
export const pseudoCode = [
  { line: 0, code: 'procedure knightsTour(board, row, col, moveNum)' },
  { line: 1, code: '  board[row][col] = moveNum' },
  { line: 2, code: '  if moveNum == N\u00B2 \u2192 tour complete' },
  { line: 3, code: '  nextMoves = getWarnsdorffMoves(board, row, col)' },
  { line: 4, code: '  sort nextMoves by onward move count (ascending)' },
  { line: 5, code: '  for each (nextRow, nextCol) in nextMoves' },
  { line: 6, code: '    if knightsTour(board, nextRow, nextCol, moveNum+1)' },
  { line: 7, code: '      return true' },
  { line: 8, code: '  board[row][col] = -1  \u2190 backtrack' },
  { line: 9, code: '  return false' }
];

/** All eight possible L-shaped moves a knight can make. */
export const KNIGHT_MOVES = [
  [-2, -1], [-2, 1], [-1, -2], [-1, 2],
  [1, -2],  [1, 2],  [2, -1],  [2, 1]
];

/** Maximum number of visualization steps before truncation. */
const MAX_STEPS = 2000;

/**
 * Return a deep copy of a 2D grid.
 *
 * @param {number[][]} grid
 * @returns {number[][]}
 */
function cloneGrid(grid) {
  return grid.map(row => [...row]);
}

/**
 * Check whether (row, col) is within bounds and unvisited.
 *
 * @param {number[][]} grid
 * @param {number} row
 * @param {number} col
 * @param {number} n
 * @returns {boolean}
 */
function isValid(grid, row, col, n) {
  return row >= 0 && row < n && col >= 0 && col < n && grid[row][col] === -1;
}

/**
 * Count how many onward moves are available from (row, col).
 *
 * @param {number[][]} grid
 * @param {number} row
 * @param {number} col
 * @param {number} n
 * @returns {number}
 */
function countOnwardMoves(grid, row, col, n) {
  let count = 0;
  for (const [dr, dc] of KNIGHT_MOVES) {
    if (isValid(grid, row + dr, col + dc, n)) {
      count++;
    }
  }
  return count;
}

/**
 * Get all valid next moves from (row, col), sorted by Warnsdorff's heuristic
 * (fewest onward moves first).
 *
 * @param {number[][]} grid
 * @param {number} row
 * @param {number} col
 * @param {number} n
 * @returns {Array<{ row: number, col: number, onward: number }>}
 */
function getWarnsdorffMoves(grid, row, col, n) {
  const moves = [];
  for (const [dr, dc] of KNIGHT_MOVES) {
    const nr = row + dr;
    const nc = col + dc;
    if (isValid(grid, nr, nc, n)) {
      moves.push({ row: nr, col: nc, onward: countOnwardMoves(grid, nr, nc, n) });
    }
  }
  moves.sort((a, b) => a.onward - b.onward);
  return moves;
}

/**
 * Build highlight cells for the current position and up to 3 prior moves.
 *
 * @param {number} row       - Current row.
 * @param {number} col       - Current column.
 * @param {Array<{row: number, col: number}>} moveHistory - Previous positions.
 * @returns {Array<{ row: number, col: number, type: string, color: string }>}
 */
function buildHighlightCells(row, col, moveHistory) {
  const cells = [
    { row, col, state: 'active' }
  ];

  /* Last 3 moves with fading green highlights. */
  const len = moveHistory.length;
  for (let i = 0; i < 3 && i < len; i++) {
    const prev = moveHistory[len - 1 - i];
    cells.push({
      row: prev.row,
      col: prev.col,
      state: 'success'
    });
  }

  return cells;
}

/**
 * Generate an array of step objects representing a full Knight's Tour execution
 * using Warnsdorff's heuristic with backtracking.
 *
 * @param {Object}  [params={}]
 * @param {number}  [params.n=6]        - Board size (N x N).
 * @param {number}  [params.startRow=0] - Starting row.
 * @param {number}  [params.startCol=0] - Starting column.
 * @returns {Array<{
 *   type: 'move'|'try'|'backtrack'|'done'|'truncated',
 *   description: string,
 *   activeLines: number[],
 *   comparisons: number,
 *   swaps: number,
 *   pass: number,
 *   grid: number[][],
 *   row: number,
 *   col: number,
 *   highlightCells: Array<Object>,
 *   fromRow: number,
 *   fromCol: number,
 *   toRow: number,
 *   toCol: number
 * }>} Ordered list of steps from first placement to final "done" or "truncated" marker.
 */
export function generateSteps({ n = 6, startRow = 0, startCol = 0 } = {}) {
  /* Build a fresh n×n grid filled with -1 (unvisited). */
  const grid = Array.from({ length: n }, () => Array(n).fill(-1));

  /** @type {Array<Object>} Accumulated step objects */
  const steps = [];

  /** Running counters */
  let comparisons = 0;
  let swaps = 0;

  /** Track move history for highlight fading. */
  const moveHistory = [];

  /** Place the knight at the starting position (move 1). */
  grid[startRow][startCol] = 1;
  let moveCount = 1;

  steps.push({
    type: 'move',
    description: `Placed knight at (${startRow}, ${startCol}) as move 1`,
    activeLines: [0, 1],
    comparisons,
    swaps,
    pass: moveCount,
    grid: cloneGrid(grid),
    row: startRow,
    col: startCol,
    highlightCells: buildHighlightCells(startRow, startCol, moveHistory),
    fromRow: startRow,
    fromCol: startCol,
    toRow: startRow,
    toCol: startCol
  });

  /**
   * Recursive solver with Warnsdorff's heuristic.
   *
   * @param {number} row      - Current row.
   * @param {number} col      - Current column.
   * @param {number} moveNum  - Current move number.
   * @returns {boolean} True if the tour is complete.
   */
  function solve(row, col, moveNum) {
    /* Check for step budget. */
    if (steps.length >= MAX_STEPS) {
      return false;
    }

    /* Tour complete? */
    if (moveNum === n * n) {
      steps.push({
        type: 'done',
        description: `Tour complete! All ${n * n} squares visited.`,
        activeLines: [2],
        comparisons,
        swaps,
        pass: moveNum,
        grid: cloneGrid(grid),
        row,
        col,
        highlightCells: buildHighlightCells(row, col, moveHistory),
        fromRow: row,
        fromCol: col,
        toRow: row,
        toCol: col
      });
      return true;
    }

    /* Get candidate moves sorted by Warnsdorff's heuristic. */
    const candidates = getWarnsdorffMoves(grid, row, col, n);
    comparisons += candidates.length;

    /* Try each candidate. */
    for (const candidate of candidates) {
      if (steps.length >= MAX_STEPS) {
        steps.push({
          type: 'truncated',
          description: `Step limit (${MAX_STEPS}) reached. Truncating visualization.`,
          activeLines: [],
          comparisons,
          swaps,
          pass: moveNum,
          grid: cloneGrid(grid),
          row,
          col,
          highlightCells: buildHighlightCells(row, col, moveHistory),
          fromRow: row,
          fromCol: col,
          toRow: candidate.row,
          toCol: candidate.col
        });
        return false;
      }

      /* Emit 'try' step before committing. */
      steps.push({
        type: 'try',
        description: `Trying move ${moveNum + 1}: (${row}, ${col}) \u2192 (${candidate.row}, ${candidate.col}) [${candidate.onward} onward moves]`,
        activeLines: [3, 4, 5],
        comparisons,
        swaps,
        pass: moveNum,
        grid: cloneGrid(grid),
        row,
        col,
        highlightCells: [
          ...buildHighlightCells(row, col, moveHistory),
          { row: candidate.row, col: candidate.col, state: 'warn' }
        ],
        fromRow: row,
        fromCol: col,
        toRow: candidate.row,
        toCol: candidate.col
      });

      /* Place the knight. */
      moveCount++;
      grid[candidate.row][candidate.col] = moveCount;
      moveHistory.push({ row, col });
      swaps++;

      /* Emit 'move' step. */
      steps.push({
        type: 'move',
        description: `Move ${moveCount}: (${row}, ${col}) \u2192 (${candidate.row}, ${candidate.col})`,
        activeLines: [1, 6],
        comparisons,
        swaps,
        pass: moveCount,
        grid: cloneGrid(grid),
        row: candidate.row,
        col: candidate.col,
        highlightCells: buildHighlightCells(candidate.row, candidate.col, moveHistory),
        fromRow: row,
        fromCol: col,
        toRow: candidate.row,
        toCol: candidate.col
      });

      /* Recurse. */
      if (solve(candidate.row, candidate.col, moveNum + 1)) {
        return true;
      }

      /* Undo the move (backtrack). */
      grid[candidate.row][candidate.col] = -1;
      moveCount--;
      moveHistory.pop();

      if (steps.length >= MAX_STEPS) {
        steps.push({
          type: 'truncated',
          description: `Step limit (${MAX_STEPS}) reached. Truncating visualization.`,
          activeLines: [],
          comparisons,
          swaps,
          pass: moveNum,
          grid: cloneGrid(grid),
          row,
          col,
          highlightCells: buildHighlightCells(row, col, moveHistory),
          fromRow: candidate.row,
          fromCol: candidate.col,
          toRow: row,
          toCol: col
        });
        return false;
      }

      /* Emit 'backtrack' step. */
      steps.push({
        type: 'backtrack',
        description: `Backtracking from (${candidate.row}, ${candidate.col}) to (${row}, ${col})`,
        activeLines: [8, 9],
        comparisons,
        swaps,
        pass: moveCount,
        grid: cloneGrid(grid),
        row,
        col,
        highlightCells: [
          ...buildHighlightCells(row, col, moveHistory),
          { row: candidate.row, col: candidate.col, state: 'danger' }
        ],
        fromRow: candidate.row,
        fromCol: candidate.col,
        toRow: row,
        toCol: col
      });
    }

    return false;
  }

  /* Kick off the solver from move 1 (already placed). */
  const solved = solve(startRow, startCol, moveCount);

  /* If we ran out of steps without a done/truncated, add a truncated marker. */
  if (!solved && steps.length > 0) {
    const lastStep = steps[steps.length - 1];
    if (lastStep.type !== 'done' && lastStep.type !== 'truncated') {
      steps.push({
        type: 'truncated',
        description: `Step limit (${MAX_STEPS}) reached. Truncating visualization.`,
        activeLines: [],
        comparisons,
        swaps,
        pass: moveCount,
        grid: cloneGrid(grid),
        row: startRow,
        col: startCol,
        highlightCells: [],
        fromRow: startRow,
        fromCol: startCol,
        toRow: startRow,
        toCol: startCol
      });
    }
  }

  return steps;
}
