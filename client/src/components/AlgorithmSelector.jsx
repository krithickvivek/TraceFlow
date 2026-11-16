/**
 * @file AlgorithmSelector.jsx
 * @description Renders pill-style buttons for each registered algorithm.
 *              Switching algorithms dispatches SET_ALGORITHM, resets playback,
 *              and regenerates steps with the current input array.
 * @exports AlgorithmSelector (default)
 */

import { algorithms } from '../algorithms';
import { useTrace, ActionTypes } from '../context/TraceContext';

/**
 * Algorithm selector pill buttons.
 *
 * @returns {JSX.Element}
 */
export default function AlgorithmSelector() {
  const { state, dispatch } = useTrace();
  const { selectedAlgorithm } = state;

  /** List of algorithm entries from the registry. */
  const entries = Object.entries(algorithms);

  /**
   * Handle algorithm change.
   * @param {string} slug - Algorithm slug key.
   */
  const handleSelect = (slug) => {
    if (slug === selectedAlgorithm) return;
    dispatch({ type: ActionTypes.SET_ALGORITHM, payload: slug });
    dispatch({ type: ActionTypes.GENERATE_STEPS });
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-[var(--color-text)]">Algorithm</label>

      <div className="flex flex-wrap gap-2">
        {entries.map(([slug, { metadata }]) => {
          const isActive = slug === selectedAlgorithm;
          return (
            <button
              key={slug}
              onClick={() => handleSelect(slug)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors focus-accent
                ${
                  isActive
                    ? 'bg-[var(--color-accent)] text-white'
                    : 'bg-[var(--color-bg)] text-[var(--color-text-muted)] border border-[var(--color-border)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]'
                }`}
            >
              {metadata.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
