/**
 * @file ArrayInput.jsx
 * @description Compact array input — Array and Target side by side on one row,
 *              action buttons on the next row. Clean and space-efficient.
 * @module components/visualizer/ArrayInput
 */

import { useState } from 'react';
import { Shuffle, Zap } from 'lucide-react';
import { useTrace, ActionTypes } from '../../context/TraceContext';
import { algorithms } from '../../algorithms';

const MIN_LENGTH = 2;
const MAX_LENGTH = 20;
const MIN_VALUE = -999;
const MAX_VALUE = 9999;
const RANDOM_COUNT = 8;
const RANDOM_MAX = 99;

function parseInput(raw) {
  const trimmed = raw.trim();
  if (!trimmed) return { values: null, error: 'Enter at least 2 numbers.' };
  const tokens = trimmed.split(',').map(t => t.trim());
  const values = [];
  for (const token of tokens) {
    if (token === '') continue;
    if (!/^-?\d+$/.test(token)) return { values: null, error: `"${token}" is not valid.` };
    const num = Number(token);
    if (num < MIN_VALUE || num > MAX_VALUE) return { values: null, error: `Range: ${MIN_VALUE}..${MAX_VALUE}` };
    values.push(num);
  }
  if (values.length < MIN_LENGTH) return { values: null, error: `Min ${MIN_LENGTH} numbers.` };
  if (values.length > MAX_LENGTH) return { values: null, error: `Max ${MAX_LENGTH} numbers.` };
  return { values, error: null };
}

export default function ArrayInput() {
  const { state, dispatch } = useTrace();
  const [text, setText] = useState(state.inputArray.join(', '));
  const [targetText, setTargetText] = useState('');
  const [error, setError] = useState(null);

  const algo = algorithms[state.selectedAlgorithm];
  const isSearch = algo?.metadata.category === 'Searching';

  const isBinarySearch = state.selectedAlgorithm === 'binary-search';

  const handleSubmit = () => {
    const { values, error: err } = parseInput(text);
    if (err) { setError(err); return; }
    if (isSearch) {
      const t = targetText.trim();
      if (!t || !/^-?\d+$/.test(t)) { setError('Enter a valid target.'); return; }
      dispatch({ type: ActionTypes.SET_TARGET, payload: Number(t) });
    }
    setError(null);
    /* For Binary Search, sort the array and update the text field */
    if (isBinarySearch) {
      const sorted = [...values].sort((a, b) => a - b);
      setText(sorted.join(', '));
      dispatch({ type: ActionTypes.SET_INPUT, payload: sorted });
    } else {
      dispatch({ type: ActionTypes.SET_INPUT, payload: values });
    }
    dispatch({ type: ActionTypes.GENERATE_STEPS, algorithms });
  };

  const handleRandom = () => {
    let values = Array.from({ length: RANDOM_COUNT }, () => Math.floor(Math.random() * RANDOM_MAX) + 1);
    /* For Binary Search, auto-sort the random array */
    if (isBinarySearch) {
      values = values.sort((a, b) => a - b);
    }
    setText(values.join(', '));
    setError(null);
    dispatch({ type: ActionTypes.SET_INPUT, payload: values });
    if (isSearch) {
      const target = values[Math.floor(Math.random() * values.length)];
      setTargetText(String(target));
      dispatch({ type: ActionTypes.SET_TARGET, payload: target });
    }
    dispatch({ type: ActionTypes.GENERATE_STEPS, algorithms });
  };

  const inputCls = 'bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm text-tf-text placeholder:text-tf-muted focus:outline-none focus:border-tf-blue transition-colors';

  return (
    <div className="shrink-0 px-4 py-0.5 space-y-1.5">
      {/* Row 1: Array + Target + Buttons all in one row */}
      <div className="flex items-end gap-3">
        <div className="flex-1 min-w-0 relative">
          <label className="absolute left-3 top-1.5 text-[9px] font-bold text-tf-muted uppercase tracking-wider pointer-events-none z-10">Array</label>
          <input
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="e.g. 5, 3, 8, 1, 2"
            className={inputCls + ' w-full pt-5 pb-2'}
          />
        </div>

        {isSearch && (
          <div className="w-32 shrink-0 relative">
            <label className="absolute left-3 top-1.5 text-[9px] font-bold text-tf-muted uppercase tracking-wider pointer-events-none z-10">Target</label>
            <input
              type="text"
              value={targetText}
              onChange={e => setTargetText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="e.g. 64"
              className={inputCls + ' w-full pt-5 pb-2'}
            />
          </div>
        )}
      </div>

      {/* Row 2: Buttons centered — compact */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={handleRandom}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[var(--border-subtle)]
                     text-tf-text2 hover:text-tf-text hover:border-tf-blue/30
                     text-sm font-medium transition-all duration-150"
        >
          <Shuffle size={14} />
          Random
        </button>

        <button
          onClick={handleSubmit}
          className="flex items-center gap-1.5 px-5 py-2 rounded-lg
                     bg-tf-blue text-white text-sm font-medium
                     hover:bg-tf-blue/90 hover:shadow-md
                     active:scale-[0.97] transition-all duration-150"
        >
          <Zap size={14} />
          Generate
        </button>

        {error && <span className="text-red-400 text-xs">{error}</span>}
      </div>
    </div>
  );
}
