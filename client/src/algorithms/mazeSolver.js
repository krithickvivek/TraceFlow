/**
 * @file mazeSolver.js
 * @description Maze Solver step generator for TraceFlow V2. Uses iterative
 *              depth-first search with an explicit stack and backtracking to
 *              find a path through a grid maze. Produces step objects that
 *              capture every exploration, backtrack, and solution-path cell so
 *              the visualizer can replay the algorithm frame-by-frame.
 * @exports generateSteps, metadata, pseudoCode
 */

/** Algorithm metadata displayed in the UI and served by the API. */
export const metadata = {
  name: 'Maze Solver',
  slug: 'maze-solver',
  category: 'Backtracking',
  difficulty: 'Beginner',
  timeComplexity: { best: 'O(V)', average: 'O(V)', worst: 'O(V)' },
  spaceComplexity: 'O(V)',
  complexityNote: 'V = number of cells in the grid (rows × cols)',
  stable: null,
  description:
    'Finds a path through a grid maze using recursive backtracking. Explores each direction, marks dead ends, and backtracks when stuck until the exit is found.',
  icon: 'maze'
};

/**
 * Pseudocode representation of the Maze Solver.
 * Each object maps a line number to the code string displayed in the UI.
 * The `activeLines` field on each step references these line numbers.
 *
 * @type {Array<{ line: number, code: string }>}
 */
export const pseudoCode = [
  { line: 0, code: 'procedure mazeSolver(grid, start, end)' },
  { line: 1, code: '  stack = [start]' },
  { line: 2, code: '  visited = empty set' },
  { line: 3, code: '  while stack is not empty' },
  { line: 4, code: '    cell = stack.pop()' },
  { line: 5, code: '    if cell == end → return path' },
  { line: 6, code: '    if cell in visited → skip' },
  { line: 7, code: '    mark cell as visited' },
  { line: 8, code: '    for each neighbour of cell' },
  { line: 9, code: '      if neighbour is open and unvisited' },
  { line: 10, code: '        stack.push(neighbour)' },
  { line: 11, code: '  return no solution' }
];

/** Default 6×6 maze. 0 = open, 1 = wall. */
const DEFAULT_MAZE = [
  [0, 1, 0, 0, 0, 0],
  [0, 1, 0, 1, 1, 0],
  [0, 0, 0, 1, 0, 0],
  [1, 1, 0, 0, 0, 1],
  [0, 0, 0, 1, 0, 0],
  [0, 1, 0, 0, 1, 0],
];

/**
 * Generate a random maze of the given size. Starts with an open grid, then
 * adds random walls while verifying the maze remains solvable via BFS.
 * Guarantees a path from (0,0) to (size-1, size-1).
 *
 * @param {number} size - Grid dimension (size × size).
 * @returns {number[][]} 2D grid (0 = open, 1 = wall).
 */
function generateRandomMaze(size) {
  const grid = Array.from({ length: size }, () => Array(size).fill(0));

  /** BFS check: is (0,0) → (size-1, size-1) reachable? */
  function isSolvable() {
    const visited = Array.from({ length: size }, () => Array(size).fill(false));
    const queue = [[0, 0]];
    visited[0][0] = true;
    while (queue.length > 0) {
      const [r, c] = queue.shift();
      if (r === size - 1 && c === size - 1) return true;
      for (const [dr, dc] of DIRECTIONS) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < size && nc >= 0 && nc < size && !visited[nr][nc] && grid[nr][nc] === 0) {
          visited[nr][nc] = true;
          queue.push([nr, nc]);
        }
      }
    }
    return false;
  }

  /* Target ~30-35% walls for a good maze feel. */
  const wallTarget = Math.floor(size * size * 0.33);
  let wallCount = 0;
  let attempts = 0;
  const maxAttempts = size * size * 4;

  while (wallCount < wallTarget && attempts < maxAttempts) {
    attempts++;
    const r = Math.floor(Math.random() * size);
    const c = Math.floor(Math.random() * size);

    /* Never wall start or end. */
    if ((r === 0 && c === 0) || (r === size - 1 && c === size - 1)) continue;
    if (grid[r][c] === 1) continue;

    grid[r][c] = 1;
    if (!isSolvable()) {
      grid[r][c] = 0; /* Revert — would break solvability. */
    } else {
      wallCount++;
    }
  }

  return grid;
}

/** Hard cap to prevent runaway step generation. */
const MAX_STEPS = 2000;

/** Movement directions: up, right, down, left. */
const DIRECTIONS = [
  [-1, 0],
  [0, 1],
  [1, 0],
  [0, -1]
];

/**
 * Grid cell state constants used in snapshots.
 * 0 = open, 1 = wall, 2 = visited, 3 = exploring, 4 = backtracked, 5 = solution path
 */
const CELL_OPEN = 0;
const CELL_WALL = 1;
const CELL_VISITED = 2;
const CELL_EXPLORING = 3;
const CELL_BACKTRACKED = 4;
const CELL_PATH = 5;

/**
 * Deep-clone a 2D grid so mutations never leak to snapshots or caller data.
 *
 * @param {number[][]} grid
 * @returns {number[][]}
 */
function cloneGrid(grid) {
  return grid.map((row) => [...row]);
}

/**
 * Generate an array of step objects representing a full Maze Solver execution
 * using iterative DFS with backtracking.
 *
 * @param {{ grid?: number[][], startRow?: number, startCol?: number, endRow?: number, endCol?: number }} [params]
 * @param {number[][]} [params.grid]     - 2D grid (0 = open, 1 = wall). Defaults to DEFAULT_MAZE.
 * @param {number}     [params.startRow] - Row of the start cell. Defaults to 0.
 * @param {number}     [params.startCol] - Column of the start cell. Defaults to 0.
 * @param {number}     [params.endRow]   - Row of the end cell. Defaults to last row.
 * @param {number}     [params.endCol]   - Column of the end cell. Defaults to last column.
 * @returns {Array<{
 *   type: 'explore'|'backtrack'|'path'|'visited'|'done'|'no-solution'|'truncated',
 *   description: string,
 *   activeLines: number[],
 *   comparisons: number,
 *   swaps: number,
 *   pass: number,
 *   grid: number[][],
 *   row: number,
 *   col: number,
 *   highlightCells: number[][]
 * }>} Ordered list of steps from first exploration to final outcome.
 */
export function generateSteps({
  grid: inputGrid,
  gridSize,
  startRow = 0,
  startCol = 0,
  endRow,
  endCol
} = {}) {
  /* Never mutate the caller's grid – deep clone first. */
  const sourceGrid = inputGrid || (gridSize ? generateRandomMaze(gridSize) : DEFAULT_MAZE);
  const grid = cloneGrid(sourceGrid);
  const rows = grid.length;
  const cols = grid[0].length;

  /* Default end position: bottom-right open cell. */
  if (endRow === undefined) endRow = rows - 1;
  if (endCol === undefined) endCol = cols - 1;

  /** @type {Array<Object>} Accumulated step objects */
  const steps = [];

  /** Running counters */
  let comparisons = 0;
  let backtracks = 0;
  let pass = 0;

  /**
   * visited[r][c] = true when cell (r,c) has been explored.
   * @type {boolean[][]}
   */
  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));

  /**
   * Snapshot grid tracks visual state of every cell for the UI.
   * @type {number[][]}
   */
  const snapshot = cloneGrid(grid);

  /** Helper: push a step; returns false if step limit reached. */
  function pushStep(step) {
    steps.push(step);
    if (steps.length >= MAX_STEPS) {
      steps.push({
        type: 'truncated',
        description: `Step limit (${MAX_STEPS}) reached. Stopping early.`,
        activeLines: [],
        comparisons,
        swaps: backtracks,
        pass,
        grid: cloneGrid(snapshot),
        row: -1,
        col: -1,
        highlightCells: []
      });
      return false;
    }
    return true;
  }

  /** Build highlight cells showing current path as a trail. */
  function pathHighlights(currentPath, activeIdx) {
    const hl = currentPath.map(([r, c], i) => ({
      row: r,
      col: c,
      state: i === activeIdx ? 'active' : 'path'
    }));
    return hl;
  }

  /* Validate start and end cells. */
  if (
    grid[startRow][startCol] === CELL_WALL ||
    grid[endRow][endCol] === CELL_WALL
  ) {
    pushStep({
      type: 'no-solution',
      description: 'Start or end cell is a wall. No solution possible.',
      activeLines: [11],
      comparisons,
      swaps: backtracks,
      pass,
      grid: cloneGrid(snapshot),
      row: startRow,
      col: startCol,
      highlightCells: [{ row: startRow, col: startCol, state: 'danger' }, { row: endRow, col: endCol, state: 'danger' }]
    });
    return steps;
  }

  /*
   * ── True recursive-style DFS with visible backtracking ──
   * We maintain a path stack. When we hit a dead end, we visually walk
   * backward through the path, marking each cell as backtracked, until
   * we reach a cell with unexplored neighbours.
   *
   * nextDir[r][c] tracks the next direction index to try for each cell.
   */
  const nextDir = Array.from({ length: rows }, () => Array(cols).fill(0));

  /** Current path as array of [row, col] pairs. */
  const path = [[startRow, startCol]];
  visited[startRow][startCol] = true;
  snapshot[startRow][startCol] = CELL_EXPLORING;

  /* Emit starting step */
  if (!pushStep({
    type: 'explore',
    description: `Starting at cell (${startRow}, ${startCol}).`,
    activeLines: [0, 1],
    comparisons,
    swaps: backtracks,
    pass,
    grid: cloneGrid(snapshot),
    row: startRow,
    col: startCol,
    highlightCells: [{ row: startRow, col: startCol, state: 'active' }]
  })) {
    return steps;
  }

  while (path.length > 0) {
    if (steps.length >= MAX_STEPS) break;

    const [curRow, curCol] = path[path.length - 1];

    /* ── Check: did we reach the end? ── */
    if (curRow === endRow && curCol === endCol) {
      snapshot[curRow][curCol] = CELL_PATH;

      if (!pushStep({
        type: 'explore',
        description: `Reached the exit at (${curRow}, ${curCol})!`,
        activeLines: [4, 5],
        comparisons,
        swaps: backtracks,
        pass,
        grid: cloneGrid(snapshot),
        row: curRow,
        col: curCol,
        highlightCells: pathHighlights(path, path.length - 1)
      })) {
        return steps;
      }

      /* Animate the solution path lighting up */
      const pathSnapshot = cloneGrid(snapshot);
      for (let i = 0; i < path.length; i++) {
        const [pr, pc] = path[i];
        pathSnapshot[pr][pc] = CELL_PATH;
      }

      pushStep({
        type: 'done',
        description: `Maze solved! Path length: ${path.length} cells.`,
        activeLines: [5],
        comparisons,
        swaps: backtracks,
        pass: -1,
        grid: cloneGrid(pathSnapshot),
        row: endRow,
        col: endCol,
        highlightCells: path.map(([pr, pc]) => ({ row: pr, col: pc, state: 'path' }))
      });
      return steps;
    }

    /* ── Try next direction from current cell ── */
    let foundNeighbour = false;
    while (nextDir[curRow][curCol] < DIRECTIONS.length) {
      const dirIdx = nextDir[curRow][curCol];
      nextDir[curRow][curCol]++;
      comparisons++;

      const [dr, dc] = DIRECTIONS[dirIdx];
      const nr = curRow + dr;
      const nc = curCol + dc;

      /* Bounds, wall, visited checks */
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      if (grid[nr][nc] === CELL_WALL) continue;
      if (visited[nr][nc]) continue;

      /* ── Move to the neighbour ── */
      visited[nr][nc] = true;
      snapshot[curRow][curCol] = CELL_VISITED;
      snapshot[nr][nc] = CELL_EXPLORING;
      path.push([nr, nc]);
      pass++;

      if (!pushStep({
        type: 'explore',
        description: `Exploring cell (${nr}, ${nc}) from (${curRow}, ${curCol}).`,
        activeLines: [4, 7, 8, 9, 10],
        comparisons,
        swaps: backtracks,
        pass,
        grid: cloneGrid(snapshot),
        row: nr,
        col: nc,
        highlightCells: pathHighlights(path, path.length - 1)
      })) {
        return steps;
      }

      foundNeighbour = true;
      break;
    }

    /* ── Dead end: backtrack one step visually ── */
    if (!foundNeighbour) {
      const [deadRow, deadCol] = path.pop();
      snapshot[deadRow][deadCol] = CELL_BACKTRACKED;
      backtracks++;

      if (!pushStep({
        type: 'backtrack',
        description: path.length > 0
          ? `Dead end at (${deadRow}, ${deadCol}) – backtracking to (${path[path.length - 1][0]}, ${path[path.length - 1][1]}).`
          : `Dead end at (${deadRow}, ${deadCol}) – no more cells to try.`,
        activeLines: [3, 4],
        comparisons,
        swaps: backtracks,
        pass,
        grid: cloneGrid(snapshot),
        row: deadRow,
        col: deadCol,
        highlightCells: [
          { row: deadRow, col: deadCol, state: 'danger' },
          ...(path.length > 0
            ? pathHighlights(path, path.length - 1)
            : [])
        ]
      })) {
        return steps;
      }
    }
  }

  /* ── No solution found ── */
  if (steps.length > 0 && steps[steps.length - 1].type !== 'done' && steps[steps.length - 1].type !== 'truncated') {
    pushStep({
      type: 'no-solution',
      description: 'Explored all reachable cells. No path to the exit exists.',
      activeLines: [11],
      comparisons,
      swaps: backtracks,
      pass: -1,
      grid: cloneGrid(snapshot),
      row: -1,
      col: -1,
      highlightCells: []
    });
  }

  return steps;
}
