/**
 * @file sudokuSolver.js
 * @description Sudoku Solver — direct translation of the Java backtracking algorithm.
 *              Scans row-by-row, col-by-col for empty cells. Tries digits 1–9,
 *              checks validity, places if valid, recurses, backtracks if stuck.
 *              Identical logic to the Java SudokuSolver class.
 * @exports generateSteps, metadata, pseudoCode, isValidPlacement
 */

const MAX_STEPS = 200000;

export const metadata = {
  name: 'Sudoku Solver',
  slug: 'sudoku-solver',
  category: 'Backtracking',
  difficulty: 'Advanced',
  timeComplexity: { best: 'O(n²)', average: 'O(9^m)', worst: 'O(9^m)' },
  spaceComplexity: 'O(m)',
  complexityNote: 'n = grid size (9), m = number of empty cells',
  stable: null,
  description:
    'Solves a 9\u00d79 Sudoku puzzle using pure backtracking. Scans left-to-right, top-to-bottom for empty cells, tries digits 1\u20139, backtracks when no valid number is found.',
  icon: 'sudoku'
};

export const pseudoCode = [
  { line: 0, code: 'procedure solveSudoku(board)' },
  { line: 1, code: '  for row = 0 to 8' },
  { line: 2, code: '    for col = 0 to 8' },
  { line: 3, code: '      if board[row][col] == 0' },
  { line: 4, code: '        for num = 1 to 9' },
  { line: 5, code: '          if isValid(board, row, col, num)' },
  { line: 6, code: '            board[row][col] = num' },
  { line: 7, code: '            if solveSudoku(board) → return true' },
  { line: 8, code: '            board[row][col] = 0  ← backtrack' },
  { line: 9, code: '        return false  ← no valid number' },
  { line: 10, code: '  return true  ← solved' }
];

const DEFAULT_PUZZLE = [
  [0,0,3,0,2,0,6,0,0],
  [9,0,0,3,0,5,0,0,1],
  [0,0,1,8,0,6,4,0,0],
  [0,0,8,1,0,2,9,0,0],
  [7,0,0,0,0,0,0,0,8],
  [0,0,6,7,0,8,2,0,0],
  [0,0,2,6,0,9,5,0,0],
  [8,0,0,2,0,3,0,0,9],
  [0,0,5,0,1,0,3,0,0]
];

function cloneGrid(g) { return g.map(r => r.map(c => ({ ...c }))); }

function buildGrid(p) {
  return p.map(r => r.map(v => ({ value: v, state: v ? 'fixed' : 'empty' })));
}

/**
 * isValid — exact translation of the Java isValid method.
 * Checks row, column, and 3×3 sub-grid.
 */
export function isValidPlacement(grid, row, col, num) {
  // Check row
  for (let x = 0; x < 9; x++) {
    if (grid[row][x].value === num) {
      return { valid: false, conflictCell: { row, col: x } };
    }
  }
  // Check column
  for (let x = 0; x < 9; x++) {
    if (grid[x][col].value === num) {
      return { valid: false, conflictCell: { row: x, col } };
    }
  }
  // Check 3×3 sub-grid
  const startRow = row - row % 3;
  const startCol = col - col % 3;
  for (let i = startRow; i < startRow + 3; i++) {
    for (let j = startCol; j < startCol + 3; j++) {
      if (grid[i][j].value === num) {
        return { valid: false, conflictCell: { row: i, col: j } };
      }
    }
  }
  return { valid: true, conflictCell: null };
}

/**
 * Generate steps — direct translation of the Java solveSudoku method.
 *
 * Java logic:
 *   for row 0..8:
 *     for col 0..8:
 *       if board[row][col] == 0:       // empty cell found
 *         for num 1..9:
 *           if isValid(board, row, col, num):
 *             board[row][col] = num     // place
 *             if solveSudoku(board): return true
 *             board[row][col] = 0       // backtrack
 *         return false                  // no valid number
 *   return true                         // solved
 */
export function generateSteps(input) {
  const puzzle = input?.puzzle || DEFAULT_PUZZLE;
  const grid = buildGrid(puzzle);
  const steps = [];
  let comparisons = 0;
  let swaps = 0;

  function overBudget() {
    if (steps.length >= MAX_STEPS) {
      steps.push({
        type: 'truncated',
        description: `Step limit of ${MAX_STEPS} reached — visualization truncated.`,
        activeLines: [], comparisons, swaps, pass: 0,
        grid: cloneGrid(grid), row: -1, col: -1, highlightCells: []
      });
      return true;
    }
    return false;
  }

  /**
   * solveSudoku — mirrors the Java method exactly.
   * Scans for the next empty cell (row-by-row, col-by-col),
   * tries 1–9, recurses, backtracks.
   */
  function solveSudoku() {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col].value === 0) {
          // Found empty cell — try numbers 1–9 (exact Java logic)
          let placed = false;

          for (let num = 1; num <= 9; num++) {
            if (overBudget()) return false;

            comparisons++;
            const { valid } = isValidPlacement(grid, row, col, num);

            if (!valid) {
              // isValid returned false — skip (matches Java: continue past the if)
              continue;
            }

            // isValid returned true — show trying, then place

            // ── TRY step: yellow highlight ──
            grid[row][col].value = num;
            grid[row][col].state = 'trying';

            steps.push({
              type: 'try',
              description: `Trying digit ${num} at (${row}, ${col}) — valid!`,
              activeLines: [4, 5],
              comparisons, swaps, pass: swaps,
              grid: cloneGrid(grid), row, col,
              highlightCells: [{ row, col, state: 'active' }]
            });

            // ── PLACE step: green highlight ──
            grid[row][col].state = 'placed';
            swaps++;
            placed = true;

            steps.push({
              type: 'place',
              description: `Placed digit ${num} at (${row}, ${col}).`,
              activeLines: [5, 6],
              comparisons, swaps, pass: swaps,
              grid: cloneGrid(grid), row, col,
              highlightCells: [{ row, col, state: 'success' }]
            });

            // if solveSudoku(board) return true
            if (solveSudoku()) return true;

            // board[row][col] = 0 — backtrack
            if (overBudget()) return false;

            grid[row][col].value = 0;
            grid[row][col].state = 'empty';

            steps.push({
              type: 'backtrack',
              description: `Digit ${num} at (${row}, ${col}) leads to dead end. Backtracking.`,
              activeLines: [8],
              comparisons, swaps, pass: swaps,
              grid: cloneGrid(grid), row, col,
              highlightCells: [{ row, col, state: 'danger' }]
            });
          }

          // return false — no valid number found for this cell
          if (!placed) {
            // All 9 digits invalid — emit conflict step
            steps.push({
              type: 'conflict',
              description: `No valid digit for cell (${row}, ${col}). Dead end.`,
              activeLines: [9],
              comparisons, swaps, pass: swaps,
              grid: cloneGrid(grid), row, col,
              highlightCells: [{ row, col, state: 'danger' }]
            });
          }
          return false;
        }
      }
    }
    // return true — solved (no empty cells remain)
    return true;
  }

  const solved = solveSudoku();

  if (solved) {
    // Mark all placed cells as solved
    for (let r = 0; r < 9; r++)
      for (let c = 0; c < 9; c++)
        if (grid[r][c].state === 'placed') grid[r][c].state = 'solved';

    steps.push({
      type: 'done',
      description: 'Puzzle solved!',
      activeLines: [10],
      comparisons, swaps, pass: swaps,
      grid: cloneGrid(grid), row: -1, col: -1, highlightCells: []
    });
  } else if (steps.length > 0 && steps[steps.length - 1].type !== 'truncated') {
    steps.push({
      type: 'done',
      description: 'No solution exists.',
      activeLines: [9],
      comparisons, swaps, pass: -1,
      grid: cloneGrid(grid), row: -1, col: -1, highlightCells: []
    });
  }

  return steps;
}
