/**
 * @file nQueens.js
 * @description N-Queens solver step generator for TraceFlow V2. Uses iterative
 *              backtracking to find the first valid placement of N queens on an
 *              N×N board such that no two queens attack each other. Produces
 *              step objects for every placement, conflict, and backtrack so the
 *              visualizer can replay the algorithm frame-by-frame.
 * @exports generateSteps, metadata, pseudoCode, isSafe
 */

/** Maximum number of steps before truncation. */
const MAX_STEPS = 2000;

/**
 * Grid cell values:
 *   0 = empty
 *   1 = queen
 *   2 = under attack
 *   3 = trying (current candidate)
 *   4 = conflicted
 */

/** Algorithm metadata displayed in the UI and served by the API. */
export const metadata = {
  name: 'N-Queens',
  slug: 'n-queens',
  category: 'Backtracking',
  difficulty: 'Intermediate',
  timeComplexity: { best: 'O(n)', average: 'O(n!)', worst: 'O(n!)' },
  spaceComplexity: 'O(n)',
  complexityNote: 'n = board size (number of queens to place)',
  stable: null,
  description:
    'Places N queens on an N×N chessboard so no two queens attack each other. Tries each column in each row, backtracks when a conflict is detected.',
  icon: 'queen'
};

/**
 * Pseudocode representation of the N-Queens backtracking algorithm.
 * Each object maps a line number to the code string displayed in the UI.
 * The `activeLines` field on each step references these line numbers.
 *
 * @type {Array<{ line: number, code: string }>}
 */
export const pseudoCode = [
  { line: 0, code: 'procedure nQueens(board, row)' },
  { line: 1, code: '  if row == N → solution found' },
  { line: 2, code: '  for col = 0 to N-1' },
  { line: 3, code: '    if isSafe(board, row, col)' },
  { line: 4, code: '      place queen at board[row][col]' },
  { line: 5, code: '      nQueens(board, row + 1)' },
  { line: 6, code: '      if solution found → return' },
  { line: 7, code: '      remove queen (backtrack)' },
  { line: 8, code: '  return false' }
];

/**
 * Check whether placing a queen at (row, col) is safe given existing queens.
 *
 * @param {Array<[number, number]>} queens - Array of [row, col] pairs for placed queens.
 * @param {number} row - The row to check.
 * @param {number} col - The column to check.
 * @returns {{ safe: boolean, conflictQueen: [number, number]|null }}
 *          Whether the position is safe, and if not, which queen causes the conflict.
 */
export function isSafe(queens, row, col) {
  for (let i = 0; i < queens.length; i++) {
    const [qr, qc] = queens[i];

    /* Same column */
    if (qc === col) {
      return { safe: false, conflictQueen: [qr, qc] };
    }

    /* Same diagonal (both directions) */
    if (Math.abs(qr - row) === Math.abs(qc - col)) {
      return { safe: false, conflictQueen: [qr, qc] };
    }
  }

  return { safe: true, conflictQueen: null };
}

/**
 * Build a 2D grid snapshot from the current queen placements.
 *
 * @param {number} n - Board size.
 * @param {Array<[number, number]>} queens - Placed queens as [row, col] pairs.
 * @returns {number[][]} n×n grid with cell values (0=empty, 1=queen, 2=under attack).
 */
function buildGrid(n, queens) {
  const grid = Array.from({ length: n }, () => Array(n).fill(0));

  for (const [qr, qc] of queens) {
    grid[qr][qc] = 1;

    /* Mark attacked cells */
    for (let i = 0; i < n; i++) {
      /* Same row */
      if (i !== qc) grid[qr][i] = grid[qr][i] === 1 ? 1 : 2;
      /* Same column */
      if (i !== qr) grid[i][qc] = grid[i][qc] === 1 ? 1 : 2;
    }

    /* Diagonals */
    for (let d = 1; d < n; d++) {
      const diags = [
        [qr - d, qc - d],
        [qr - d, qc + d],
        [qr + d, qc - d],
        [qr + d, qc + d]
      ];
      for (const [dr, dc] of diags) {
        if (dr >= 0 && dr < n && dc >= 0 && dc < n && grid[dr][dc] !== 1) {
          grid[dr][dc] = 2;
        }
      }
    }
  }

  return grid;
}

/**
 * Compute highlight cells: the current cell plus attack lines from placed queens
 * that reach the current cell.
 *
 * @param {number} n - Board size.
 * @param {Array<[number, number]>} queens - Placed queens.
 * @param {number} row - Current row.
 * @param {number} col - Current column.
 * @returns {Array<[number, number]>} Cells to highlight.
 */
function computeHighlightCells(n, queens, row, col, cellState) {
  const cells = [{ row, col, state: cellState || 'active' }];

  for (const [qr, qc] of queens) {
    /* Same column attack line */
    if (qc === col) {
      const minR = Math.min(qr, row);
      const maxR = Math.max(qr, row);
      for (let r = minR; r <= maxR; r++) {
        if (r !== row) cells.push({ row: r, col, state: 'danger' });
      }
    }

    /* Diagonal attack line */
    if (Math.abs(qr - row) === Math.abs(qc - col)) {
      const dRow = row > qr ? 1 : -1;
      const dCol = col > qc ? 1 : -1;
      let r = qr;
      let c = qc;
      while (r !== row || c !== col) {
        cells.push({ row: r, col: c, state: 'danger' });
        r += dRow;
        c += dCol;
      }
    }
  }

  return cells;
}

/**
 * Generate an array of step objects representing the N-Queens solving process
 * using iterative backtracking. Finds the FIRST solution only.
 *
 * @param {{ n?: number }} [params={}]
 * @param {number} [params.n=8] - Board size (min 4, max 8).
 * @returns {Array<{
 *   type: 'place'|'conflict'|'backtrack'|'safe'|'done'|'truncated',
 *   description: string,
 *   activeLines: number[],
 *   comparisons: number,
 *   swaps: number,
 *   pass: number,
 *   grid: number[][],
 *   row: number,
 *   col: number,
 *   highlightCells: Array<[number, number]>
 * }>} Ordered list of steps.
 */
export function generateSteps({ n = 8 } = {}) {
  /* Clamp n to valid range. */
  const size = Math.max(4, Math.min(8, Math.floor(n)));

  /** @type {Array<Object>} */
  const steps = [];

  /** Running counters */
  let comparisons = 0;
  let swaps = 0;

  /**
   * Queens placed so far as [row, col] pairs.
   * @type {Array<[number, number]>}
   */
  const queens = [];

  /**
   * Column tracker per row: colTracker[r] holds the next column to try in row r.
   * @type {number[]}
   */
  const colTracker = Array(size).fill(0);

  let row = 0;
  let solved = false;

  while (row >= 0) {
    if (steps.length >= MAX_STEPS) {
      const grid = buildGrid(size, queens);
      steps.push({
        type: 'truncated',
        description: `Step limit (${MAX_STEPS}) reached. Stopping visualization.`,
        activeLines: [],
        comparisons,
        swaps,
        pass: queens.length,
        grid,
        row,
        col: colTracker[row],
        highlightCells: []
      });
      break;
    }

    /* All queens placed — solution found */
    if (row === size) {
      const grid = buildGrid(size, queens);
      steps.push({
        type: 'done',
        description: `Solution found! All ${size} queens placed without conflicts.`,
        activeLines: [1, 6],
        comparisons,
        swaps,
        pass: size,
        grid,
        row: -1,
        col: -1,
        highlightCells: queens.map(([qr, qc]) => ({ row: qr, col: qc, state: 'success' }))
      });
      solved = true;
      break;
    }

    /* All columns exhausted in this row — backtrack */
    if (colTracker[row] >= size) {
      colTracker[row] = 0; /* Reset for future revisits */

      if (queens.length === 0) {
        /* No solution (shouldn't happen for n >= 4) */
        break;
      }

      const removed = queens.pop();
      const grid = buildGrid(size, queens);
      /* Mark the removed cell as trying=3 in grid snapshot for visual feedback */
      grid[removed[0]][removed[1]] = 0;

      steps.push({
        type: 'backtrack',
        description: `All columns exhausted in row ${row}. Backtracking: removing queen from (${removed[0]}, ${removed[1]}).`,
        activeLines: [7, 8],
        comparisons,
        swaps,
        pass: queens.length,
        grid,
        row: removed[0],
        col: removed[1],
        highlightCells: [{ row: removed[0], col: removed[1], state: 'danger' }]
      });

      row = removed[0];
      /* colTracker[row] was already advanced past this column before we recursed,
         so we continue from the next column. */
      continue;
    }

    const col = colTracker[row];
    colTracker[row]++;

    /* Check if position is safe */
    comparisons++;
    const { safe, conflictQueen } = isSafe(queens, row, col);

    if (!safe) {
      /* ── Conflict step ── */
      const grid = buildGrid(size, queens);
      grid[row][col] = 4; /* Mark as conflicted */

      const highlightCells = computeHighlightCells(size, queens, row, col, 'danger');

      steps.push({
        type: 'conflict',
        description: `Conflict at (${row}, ${col}): attacked by queen at (${conflictQueen[0]}, ${conflictQueen[1]}).`,
        activeLines: [2, 3],
        comparisons,
        swaps,
        pass: queens.length,
        grid,
        row,
        col,
        highlightCells
      });
    } else {
      /* ── Safe step ── */
      const safeGrid = buildGrid(size, queens);
      safeGrid[row][col] = 3; /* Mark as trying */

      steps.push({
        type: 'safe',
        description: `Position (${row}, ${col}) is safe. No conflicts detected.`,
        activeLines: [3],
        comparisons,
        swaps,
        pass: queens.length,
        grid: safeGrid,
        row,
        col,
        highlightCells: [{ row, col, state: 'warn' }]
      });

      /* ── Place step ── */
      queens.push([row, col]);
      swaps++;
      const placeGrid = buildGrid(size, queens);

      steps.push({
        type: 'place',
        description: `Placed queen #${queens.length} at (${row}, ${col}).`,
        activeLines: [4, 5],
        comparisons,
        swaps,
        pass: queens.length,
        grid: placeGrid,
        row,
        col,
        highlightCells: queens.map(([qr, qc]) => ({ row: qr, col: qc, state: 'success' }))
      });

      /* Move to next row */
      row++;
    }
  }

  /* If we exited without finding a solution and without truncating */
  if (!solved && steps.length > 0 && steps[steps.length - 1].type !== 'truncated') {
    const grid = buildGrid(size, queens);
    steps.push({
      type: 'done',
      description: `No solution exists for ${size}-Queens (unexpected).`,
      activeLines: [8],
      comparisons,
      swaps,
      pass: -1,
      grid,
      row: -1,
      col: -1,
      highlightCells: []
    });
  }

  return steps;
}
