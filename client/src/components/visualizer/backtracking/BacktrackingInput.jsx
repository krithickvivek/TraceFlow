/**
 * @file BacktrackingInput.jsx
 * @description Compact inline input configuration for all 4 backtracking algorithms.
 *              Renders controls in a single horizontal row alongside playback controls.
 * @module components/visualizer/backtracking/BacktrackingInput
 */

import { useState, useCallback, useEffect } from 'react';
import { Zap, Shuffle, Plus, Trash2 } from 'lucide-react';
import { useTrace, ActionTypes } from '../../../context/TraceContext';
import { algorithms } from '../../../algorithms';
import { PRESETS } from '../../../algorithms/graphBFS';

/* ── Speed recommendations per algorithm ── */
const SPEED_TIPS = {
  'maze-solver': '200ms recommended',
  'n-queens': '300ms recommended',
  'knights-tour': '150ms recommended',
  'sudoku-solver': '50ms recommended',
  'graph-bfs': '400ms recommended',
};

/* ── Default auto-speed per algorithm ── */
const ALGO_DEFAULT_SPEEDS = {
  'maze-solver': 300,
  'n-queens': 400,
  'knights-tour': 200,
  'sudoku-solver': 80,
  'graph-bfs': 500,
};

/* ── Sudoku puzzles ── */
const DEFAULT_PUZZLE = [
  [0, 0, 3, 0, 2, 0, 6, 0, 0],
  [9, 0, 0, 3, 0, 5, 0, 0, 1],
  [0, 0, 1, 8, 0, 6, 4, 0, 0],
  [0, 0, 8, 1, 0, 2, 9, 0, 0],
  [7, 0, 0, 0, 0, 0, 0, 0, 8],
  [0, 0, 6, 7, 0, 8, 2, 0, 0],
  [0, 0, 2, 6, 0, 9, 5, 0, 0],
  [8, 0, 0, 2, 0, 3, 0, 0, 9],
  [0, 0, 5, 0, 1, 0, 3, 0, 0],
];

const EASY_PUZZLE = [
  [0, 0, 0, 2, 6, 0, 7, 0, 1],
  [6, 8, 0, 0, 7, 0, 0, 9, 0],
  [1, 9, 0, 0, 0, 4, 5, 0, 0],
  [8, 2, 0, 1, 0, 0, 0, 4, 0],
  [0, 0, 4, 6, 0, 2, 9, 0, 0],
  [0, 5, 0, 0, 0, 3, 0, 2, 8],
  [0, 0, 9, 3, 0, 0, 0, 7, 4],
  [0, 4, 0, 0, 5, 0, 0, 3, 6],
  [7, 0, 3, 0, 1, 8, 0, 0, 0],
];

const HARD_PUZZLE = [
  [0, 2, 0, 6, 0, 8, 0, 0, 0],
  [5, 8, 0, 0, 0, 9, 7, 0, 0],
  [0, 0, 0, 0, 4, 0, 0, 0, 0],
  [3, 7, 0, 0, 0, 0, 5, 0, 0],
  [6, 0, 0, 0, 0, 0, 0, 0, 4],
  [0, 0, 8, 0, 0, 0, 0, 1, 3],
  [0, 0, 0, 0, 2, 0, 0, 0, 0],
  [0, 0, 9, 8, 0, 0, 0, 3, 6],
  [0, 0, 0, 3, 0, 6, 0, 9, 0],
];

/* ── Directions for BFS solvability check ── */
const DIRS = [[-1,0],[0,1],[1,0],[0,-1]];

/**
 * Generate a random solvable maze grid.
 * @param {number} size
 * @returns {number[][]}
 */
function makeRandomMaze(size) {
  const g = Array.from({ length: size }, () => Array(size).fill(0));
  const isSolvable = () => {
    const vis = Array.from({ length: size }, () => Array(size).fill(false));
    const q = [[0,0]]; vis[0][0] = true;
    while (q.length) {
      const [r,c] = q.shift();
      if (r === size-1 && c === size-1) return true;
      for (const [dr,dc] of DIRS) {
        const nr = r+dr, nc = c+dc;
        if (nr>=0 && nr<size && nc>=0 && nc<size && !vis[nr][nc] && g[nr][nc]===0) {
          vis[nr][nc]=true; q.push([nr,nc]);
        }
      }
    }
    return false;
  };
  const target = Math.floor(size*size*0.33);
  let walls=0, att=0;
  while (walls < target && att < size*size*4) {
    att++;
    const r = Math.floor(Math.random()*size), c = Math.floor(Math.random()*size);
    if ((r===0&&c===0)||(r===size-1&&c===size-1)) continue;
    if (g[r][c]===1) continue;
    g[r][c]=1;
    if (!isSolvable()) g[r][c]=0; else walls++;
  }
  return g;
}

/** Pill button style helper — refined compact. */
const pillCls = (active) =>
  `px-3 py-1 rounded-full text-[11px] font-semibold border transition-all duration-150 cursor-pointer ${
    active
      ? 'bg-tf-blue text-white border-tf-blue shadow-sm shadow-tf-blue/20'
      : 'bg-[var(--bg-primary)] text-tf-text2 border-[var(--border-subtle)] hover:text-tf-text hover:border-tf-blue/40 hover:bg-tf-blue/5'
  }`;

/** Generate button shared style. */
const genBtnCls = 'flex items-center gap-1.5 px-5 py-1.5 rounded-lg bg-tf-blue text-white text-xs font-bold tracking-wide hover:bg-tf-blue/90 active:scale-[0.97] transition-all duration-150 shrink-0 shadow-sm shadow-tf-blue/20';

/**
 * Inline input for Maze Solver.
 *
 * @param {{ onGenerate: Function }} props
 * @returns {JSX.Element}
 */
function MazeInput({ onGenerate }) {
  const [gridSize, setGridSize] = useState(5);
  const [mazeGrid, setMazeGrid] = useState(() => makeRandomMaze(5));

  /* Regenerate when grid size changes */
  useEffect(() => {
    setMazeGrid(makeRandomMaze(gridSize));
  }, [gridSize]);

  /** Toggle a cell between open (0) and wall (1). Start/end are locked. */
  const toggleCell = (r, c) => {
    if (r === 0 && c === 0) return;
    if (r === gridSize - 1 && c === gridSize - 1) return;
    setMazeGrid(prev => prev.map((row, ri) =>
      row.map((val, ci) => (ri === r && ci === c ? (val === 0 ? 1 : 0) : val))
    ));
  };

  const cellPx = gridSize <= 4 ? 22 : gridSize <= 6 ? 18 : 14;

  return (
    <div className="flex items-center gap-4">
      {/* Left: size selector + buttons */}
      <div className="flex flex-col items-center gap-1.5">
        <span className="text-[10px] font-bold text-tf-text2 uppercase tracking-widest">Grid Size</span>
        <div className="flex gap-1 flex-wrap justify-center max-w-[200px]">
          {[3, 4, 5, 6, 7, 8, 9].map((s) => (
            <button key={s} className={pillCls(gridSize === s)} onClick={() => setGridSize(s)}>
              {s}×{s}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <button onClick={() => setMazeGrid(makeRandomMaze(gridSize))}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[var(--bg-primary)] text-tf-text2 text-[10px] font-semibold border border-[var(--border-subtle)] hover:text-tf-text hover:border-tf-blue/40 active:scale-[0.97] transition-all duration-150">
            <Shuffle size={10} /> Random
          </button>
          <button onClick={() => onGenerate({ type: 'backtracking', slug: 'maze-solver', grid: mazeGrid.map(r => [...r]), startRow: 0, startCol: 0, endRow: gridSize - 1, endCol: gridSize - 1 })} className={genBtnCls}>
            <Zap size={12} /> Solve
          </button>
        </div>
      </div>

      {/* Right: clickable mini grid editor */}
      <div className="flex flex-col items-center gap-1">
        <span className="text-[9px] text-tf-muted font-mono">Click to toggle walls</span>
        <div
          className="inline-grid rounded border border-[var(--grid-border)]"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, ${cellPx}px)`,
            gridTemplateRows: `repeat(${gridSize}, ${cellPx}px)`,
          }}
        >
          {mazeGrid.map((row, r) =>
            row.map((val, c) => {
              const isStart = r === 0 && c === 0;
              const isEnd = r === gridSize - 1 && c === gridSize - 1;
              return (
                <div
                  key={`${r},${c}`}
                  onClick={() => toggleCell(r, c)}
                  className={`border border-[var(--grid-border)] cursor-pointer transition-colors duration-100 flex items-center justify-center
                    ${isStart || isEnd ? '' : 'hover:opacity-70'}`}
                  style={{
                    width: cellPx,
                    height: cellPx,
                    backgroundColor: isStart ? 'var(--accent-success)'
                      : isEnd ? 'var(--accent-danger)'
                      : val === 1 ? 'var(--maze-wall)'
                      : 'var(--maze-open)',
                    fontSize: '7px',
                    color: isStart || isEnd ? 'white' : 'var(--text-muted)',
                    fontWeight: 600,
                  }}
                  title={isStart ? 'Start' : isEnd ? 'End' : val === 1 ? 'Wall (click to open)' : 'Open (click to wall)'}
                >
                  {isStart ? 'S' : isEnd ? 'E' : ''}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Inline input for N-Queens.
 *
 * @param {{ onGenerate: Function }} props
 * @returns {JSX.Element}
 */
function NQueensInput({ onGenerate }) {
  const [n, setN] = useState(8);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="text-[10px] font-bold text-tf-text2 uppercase tracking-widest">N (Board Size)</span>
      <div className="flex gap-1.5">
        {[4, 5, 6, 7, 8].map((s) => (
          <button key={s} className={pillCls(n === s)} onClick={() => setN(s)}>
            {s}
          </button>
        ))}
      </div>
      <button onClick={() => onGenerate({ type: 'backtracking', slug: 'n-queens', n })} className={genBtnCls + ' mt-0.5'}>
        <Zap size={12} /> Generate
      </button>
    </div>
  );
}

/**
 * Inline input for Knight's Tour.
 *
 * @param {{ onGenerate: Function }} props
 * @returns {JSX.Element}
 */
function KnightsTourInput({ onGenerate }) {
  const [n, setN] = useState(6);
  const [startRow, setStartRow] = useState(0);
  const [startCol, setStartCol] = useState(0);

  const numCls = 'w-10 bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded px-1.5 py-1 text-[11px] text-tf-text text-center font-mono focus:outline-none focus:border-tf-blue focus:ring-1 focus:ring-tf-blue/20 transition-colors';

  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="text-[10px] font-bold text-tf-text2 uppercase tracking-widest">N (Board Size)</span>
      <div className="flex items-center gap-3">
        <div className="flex gap-1.5">
          {[5, 6, 7, 8].map((s) => (
            <button key={s} className={pillCls(n === s)} onClick={() => setN(s)}>
              {s}
            </button>
          ))}
        </div>
        <span className="text-[10px] font-bold text-tf-text2 uppercase tracking-widest">Start</span>
        <input type="number" min={0} max={n - 1} value={startRow} onChange={(e) => setStartRow(Number(e.target.value))} className={numCls} title="Row" />
        <input type="number" min={0} max={n - 1} value={startCol} onChange={(e) => setStartCol(Number(e.target.value))} className={numCls} title="Col" />
      </div>
      <button onClick={() => onGenerate({ type: 'backtracking', slug: 'knights-tour', n, startRow: Math.min(startRow, n - 1), startCol: Math.min(startCol, n - 1) })} className={genBtnCls + ' mt-0.5'}>
        <Zap size={12} /> Generate
      </button>
    </div>
  );
}

/**
 * Validate a Sudoku grid for duplicate digits in rows, columns, and 3×3 boxes.
 * Returns a Set of "r,c" keys for cells involved in conflicts.
 *
 * @param {number[][]} grid
 * @returns {{ conflicts: Set<string>, messages: string[] }}
 */
function validateSudoku(grid) {
  const conflicts = new Set();
  const messages = [];

  // Check rows
  for (let r = 0; r < 9; r++) {
    const seen = {};
    for (let c = 0; c < 9; c++) {
      const v = grid[r][c];
      if (v === 0) continue;
      if (seen[v] !== undefined) {
        conflicts.add(`${r},${c}`);
        conflicts.add(`${r},${seen[v]}`);
        messages.push(`Row ${r + 1}: duplicate ${v}`);
      } else {
        seen[v] = c;
      }
    }
  }

  // Check columns
  for (let c = 0; c < 9; c++) {
    const seen = {};
    for (let r = 0; r < 9; r++) {
      const v = grid[r][c];
      if (v === 0) continue;
      if (seen[v] !== undefined) {
        conflicts.add(`${r},${c}`);
        conflicts.add(`${seen[v]},${c}`);
        messages.push(`Col ${c + 1}: duplicate ${v}`);
      } else {
        seen[v] = r;
      }
    }
  }

  // Check 3×3 boxes
  for (let br = 0; br < 3; br++) {
    for (let bc = 0; bc < 3; bc++) {
      const seen = {};
      for (let r = br * 3; r < br * 3 + 3; r++) {
        for (let c = bc * 3; c < bc * 3 + 3; c++) {
          const v = grid[r][c];
          if (v === 0) continue;
          const key = `${v}`;
          if (seen[key]) {
            conflicts.add(`${r},${c}`);
            conflicts.add(seen[key]);
            messages.push(`Box (${br + 1},${bc + 1}): duplicate ${v}`);
          } else {
            seen[key] = `${r},${c}`;
          }
        }
      }
    }
  }

  // Deduplicate messages
  const uniqueMessages = [...new Set(messages)];
  return { conflicts, messages: uniqueMessages };
}

/**
 * Inline input for Sudoku Solver — preset selector + clickable 9×9 mini grid editor
 * with live conflict validation.
 *
 * @param {{ onGenerate: Function }} props
 * @returns {JSX.Element}
 */
function SudokuInput({ onGenerate }) {
  const [difficulty, setDifficulty] = useState('medium');
  const puzzleMap = { easy: EASY_PUZZLE, medium: DEFAULT_PUZZLE, hard: HARD_PUZZLE };
  const [customGrid, setCustomGrid] = useState(() => DEFAULT_PUZZLE.map(r => [...r]));
  const [selectedCell, setSelectedCell] = useState(null);
  const [validationError, setValidationError] = useState('');

  /** Validate grid and update error message. */
  const validate = useCallback((grid) => {
    const { conflicts, messages } = validateSudoku(grid);
    if (messages.length > 0) {
      setValidationError(messages.slice(0, 2).join(' · '));
    } else {
      setValidationError('');
    }
    return conflicts;
  }, []);

  /** Live conflict set for highlighting cells. */
  const conflictSet = validateSudoku(customGrid).conflicts;

  /** Load a preset into the editor grid. */
  const loadPreset = (d) => {
    setDifficulty(d);
    const preset = puzzleMap[d].map(r => [...r]);
    setCustomGrid(preset);
    setSelectedCell(null);
    setValidationError('');
  };

  /** Clear the entire board. */
  const clearBoard = () => {
    setCustomGrid(Array.from({ length: 9 }, () => Array(9).fill(0)));
    setDifficulty('custom');
    setSelectedCell(null);
    setValidationError('');
  };

  /** Handle clicking a cell — select it. */
  const handleCellClick = (r, c) => {
    setSelectedCell(prev => (prev && prev[0] === r && prev[1] === c) ? null : [r, c]);
    setDifficulty('custom');
  };

  /** Handle keyboard input when a cell is selected. */
  const handleKeyDown = useCallback((e) => {
    if (!selectedCell) return;
    const [r, c] = selectedCell;
    const key = e.key;

    if (key >= '1' && key <= '9') {
      setCustomGrid(prev => {
        const next = prev.map((row, ri) =>
          row.map((val, ci) => (ri === r && ci === c ? Number(key) : val))
        );
        validate(next);
        return next;
      });
      const nextC = c < 8 ? c + 1 : 0;
      const nextR = c < 8 ? r : (r < 8 ? r + 1 : 0);
      setSelectedCell([nextR, nextC]);
    } else if (key === '0' || key === 'Backspace' || key === 'Delete') {
      setCustomGrid(prev => {
        const next = prev.map((row, ri) =>
          row.map((val, ci) => (ri === r && ci === c ? 0 : val))
        );
        validate(next);
        return next;
      });
      e.preventDefault();
    } else if (key === 'ArrowRight') {
      setSelectedCell([r, Math.min(c + 1, 8)]);
    } else if (key === 'ArrowLeft') {
      setSelectedCell([r, Math.max(c - 1, 0)]);
    } else if (key === 'ArrowDown') {
      setSelectedCell([Math.min(r + 1, 8), c]);
    } else if (key === 'ArrowUp') {
      setSelectedCell([Math.max(r - 1, 0), c]);
    }
  }, [selectedCell, validate]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  /** Attempt to solve — block if conflicts exist. */
  const handleSolve = () => {
    const { conflicts, messages } = validateSudoku(customGrid);
    if (conflicts.size > 0) {
      setValidationError(messages.slice(0, 2).join(' · '));
      return;
    }
    setValidationError('');
    onGenerate({ type: 'backtracking', slug: 'sudoku-solver', puzzle: customGrid.map(r => [...r]) });
  };

  const CELL_PX = 22;

  return (
    <div className="flex items-center gap-4">
      {/* Left: presets + buttons */}
      <div className="flex flex-col items-center gap-1.5">
        <span className="text-[10px] font-bold text-tf-text2 uppercase tracking-widest">Preset</span>
        <div className="flex gap-1.5">
          {['easy', 'medium', 'hard'].map((d) => (
            <button key={d} className={pillCls(difficulty === d)} onClick={() => loadPreset(d)}>
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <button onClick={clearBoard}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[var(--bg-primary)] text-tf-text2 text-[10px] font-semibold border border-[var(--border-subtle)] hover:text-tf-text hover:border-tf-blue/40 active:scale-[0.97] transition-all duration-150">
            Clear
          </button>
          <button onClick={handleSolve} className={genBtnCls}>
            <Zap size={12} /> Solve
          </button>
        </div>
        {/* Validation error message */}
        {validationError && (
          <div className="mt-1 px-2 py-1 rounded bg-red-500/15 border border-red-500/30 max-w-[180px]">
            <p className="text-[9px] text-red-400 font-semibold leading-tight text-center">{validationError}</p>
          </div>
        )}
      </div>

      {/* Right: clickable mini 9×9 grid editor */}
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-[9px] text-tf-muted font-mono">Click &amp; type 1-9</span>
        <div
          className="inline-grid rounded overflow-hidden"
          style={{
            gridTemplateColumns: `repeat(9, ${CELL_PX}px)`,
            gridTemplateRows: `repeat(9, ${CELL_PX}px)`,
            border: '2px solid var(--accent-primary, #6C63FF)',
          }}
        >
          {customGrid.map((row, r) =>
            row.map((val, c) => {
              const key = `${r},${c}`;
              const isSelected = selectedCell && selectedCell[0] === r && selectedCell[1] === c;
              const isConflict = conflictSet.has(key);
              const isBoxBorderR = (c + 1) % 3 === 0 && c < 8;
              const isBoxBorderB = (r + 1) % 3 === 0 && r < 8;

              let bgColor = 'var(--bg-card)';
              let textColor = val > 0 ? 'var(--accent-primary, #6C63FF)' : 'transparent';

              if (isConflict && val > 0) {
                bgColor = 'rgba(239,68,68,0.2)';
                textColor = '#EF4444';
              }
              if (isSelected) {
                bgColor = isConflict ? 'rgba(239,68,68,0.3)' : 'rgba(108,99,255,0.15)';
              }

              return (
                <div
                  key={key}
                  onClick={() => handleCellClick(r, c)}
                  className={`flex items-center justify-center cursor-pointer select-none transition-colors duration-100 font-mono
                    ${isSelected ? 'ring-2 ring-tf-blue ring-inset z-10' : 'hover:bg-tf-blue/10'}`}
                  style={{
                    width: CELL_PX,
                    height: CELL_PX,
                    fontSize: '10px',
                    fontWeight: val > 0 ? 700 : 400,
                    color: textColor,
                    backgroundColor: bgColor,
                    borderRight: isBoxBorderR
                      ? '2px solid var(--text-secondary)'
                      : '0.5px solid var(--border-subtle)',
                    borderBottom: isBoxBorderB
                      ? '2px solid var(--text-secondary)'
                      : '0.5px solid var(--border-subtle)',
                  }}
                >
                  {val > 0 ? val : ''}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Inline input for Graph BFS.
 *
 * @param {{ onGenerate: Function }} props
 * @returns {JSX.Element}
 */
function GraphBFSInput({ onGenerate }) {
  const [mode, setMode] = useState('preset');
  const [selectedPreset, setSelectedPreset] = useState('simple');
  const [nodeCount, setNodeCount] = useState(7);
  const [edges, setEdges] = useState([[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[0,3],[2,5]]);
  const [source, setSource] = useState(0);
  const [destination, setDestination] = useState(6);
  const [newEdgeU, setNewEdgeU] = useState('');
  const [newEdgeV, setNewEdgeV] = useState('');

  const numCls = 'w-10 bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded px-1.5 py-1 text-[11px] text-tf-text text-center font-mono focus:outline-none focus:border-tf-blue focus:ring-1 focus:ring-tf-blue/20 transition-colors';

  const addEdge = () => {
    const u = parseInt(newEdgeU, 10);
    const v = parseInt(newEdgeV, 10);
    if (isNaN(u) || isNaN(v) || u === v || u < 0 || v < 0 || u >= nodeCount || v >= nodeCount) return;
    const exists = edges.some(([a, b]) => (a === u && b === v) || (a === v && b === u));
    if (exists) return;
    setEdges(prev => [...prev, [u, v]]);
    setNewEdgeU('');
    setNewEdgeV('');
  };

  const removeEdge = (idx) => {
    setEdges(prev => prev.filter((_, i) => i !== idx));
  };

  const handleGenerate = () => {
    if (mode === 'preset') {
      onGenerate({ type: 'backtracking', slug: 'graph-bfs', preset: selectedPreset });
    } else if (mode === 'random') {
      onGenerate({ type: 'backtracking', slug: 'graph-bfs', n: nodeCount });
    } else {
      onGenerate({ type: 'backtracking', slug: 'graph-bfs', n: nodeCount, edges: edges.map(e => [...e]), source, destination });
    }
  };

  return (
    <div className="flex items-center gap-4 flex-wrap">
      {/* Mode selector */}
      <div className="flex flex-col items-center gap-1.5">
        <span className="text-[10px] font-bold text-tf-text2 uppercase tracking-widest">Mode</span>
        <div className="flex gap-1">
          {[['preset', 'Preset'], ['random', 'Random'], ['custom', 'Custom']].map(([m, label]) => (
            <button key={m} className={pillCls(mode === m)} onClick={() => setMode(m)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Preset selector */}
      {mode === 'preset' && (
        <div className="flex flex-col items-center gap-1.5">
          <span className="text-[10px] font-bold text-tf-text2 uppercase tracking-widest">Graph</span>
          <div className="flex gap-1 flex-wrap max-w-[300px] justify-center">
            {Object.entries(PRESETS).map(([key, preset]) => (
              <button key={key} className={pillCls(selectedPreset === key)} onClick={() => setSelectedPreset(key)}>
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Random: node count */}
      {mode === 'random' && (
        <div className="flex flex-col items-center gap-1.5">
          <span className="text-[10px] font-bold text-tf-text2 uppercase tracking-widest">Nodes</span>
          <div className="flex gap-1">
            {[5, 6, 7, 8, 9, 10].map(s => (
              <button key={s} className={pillCls(nodeCount === s)} onClick={() => setNodeCount(s)}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Custom: edges + src/dest */}
      {mode === 'custom' && (
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-bold text-tf-text2 uppercase tracking-widest">Nodes</span>
            <div className="flex gap-1">
              {[4, 5, 6, 7, 8, 9, 10].map(s => (
                <button key={s} className={pillCls(nodeCount === s)} onClick={() => {
                  setNodeCount(s);
                  setEdges(prev => prev.filter(([u, v]) => u < s && v < s));
                  setSource(prev => Math.min(prev, s - 1));
                  setDestination(prev => Math.min(prev, s - 1));
                }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] text-tf-muted font-mono">Src / Dst</span>
            <div className="flex items-center gap-1">
              <input type="number" min={0} max={nodeCount - 1} value={source}
                onChange={e => setSource(Math.min(Number(e.target.value), nodeCount - 1))} className={numCls} />
              <span className="text-tf-muted text-[10px]">→</span>
              <input type="number" min={0} max={nodeCount - 1} value={destination}
                onChange={e => setDestination(Math.min(Number(e.target.value), nodeCount - 1))} className={numCls} />
            </div>
          </div>

          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] text-tf-muted font-mono">Add Edge</span>
            <div className="flex items-center gap-1">
              <input type="number" min={0} max={nodeCount - 1} value={newEdgeU} placeholder="u"
                onChange={e => setNewEdgeU(e.target.value)} className={numCls} />
              <span className="text-tf-muted text-[9px]">—</span>
              <input type="number" min={0} max={nodeCount - 1} value={newEdgeV} placeholder="v"
                onChange={e => setNewEdgeV(e.target.value)} className={numCls} />
              <button onClick={addEdge}
                className="flex items-center justify-center w-6 h-6 rounded bg-tf-blue/20 text-tf-blue hover:bg-tf-blue/30 transition-colors">
                <Plus size={12} />
              </button>
            </div>
          </div>

          {/* Edges list */}
          <div className="flex flex-wrap gap-1 max-w-[200px] max-h-[48px] overflow-y-auto">
            {edges.map(([u, v], i) => (
              <span key={i} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[9px] font-mono text-tf-text2">
                {u}—{v}
                <button onClick={() => removeEdge(i)} className="text-tf-muted hover:text-red-400 bg-transparent border-none cursor-pointer p-0 ml-0.5">
                  <Trash2 size={8} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Generate button */}
      <button onClick={handleGenerate} className={genBtnCls}>
        <Zap size={12} /> {mode === 'preset' ? 'Visualize' : mode === 'random' ? 'Generate' : 'Solve'}
      </button>
    </div>
  );
}

/**
 * Main backtracking input panel — compact inline layout.
 *
 * @returns {JSX.Element}
 */
export default function BacktrackingInput() {
  const { state, dispatch } = useTrace();
  const slug = state.selectedAlgorithm;

  const handleGenerate = useCallback((config) => {
    dispatch({ type: ActionTypes.SET_INPUT_CONFIG, payload: config });
    const speed = ALGO_DEFAULT_SPEEDS[slug] || 500;
    dispatch({ type: ActionTypes.SET_SPEED, payload: speed });
    dispatch({ type: ActionTypes.GENERATE_STEPS, algorithms });
  }, [slug, dispatch]);

  return (
    <div className="shrink-0">
      {slug === 'maze-solver' && <MazeInput onGenerate={handleGenerate} />}
      {slug === 'n-queens' && <NQueensInput onGenerate={handleGenerate} />}
      {slug === 'knights-tour' && <KnightsTourInput onGenerate={handleGenerate} />}
      {slug === 'sudoku-solver' && <SudokuInput onGenerate={handleGenerate} />}
      {slug === 'graph-bfs' && <GraphBFSInput onGenerate={handleGenerate} />}
    </div>
  );
}
