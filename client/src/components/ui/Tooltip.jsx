/**
 * @file Tooltip.jsx
 * @description Simple hover tooltip component for TraceFlow V2. Wraps any
 *              child element and shows a dark pill with white text on hover
 *              after a short delay. Supports top and bottom positioning via
 *              absolute placement and Tailwind utilities.
 * @exports Tooltip (default)
 */

import { useState, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';

/**
 * Positioning class map. Each key produces Tailwind classes that center the
 * tooltip horizontally and place it above or below the trigger element.
 *
 * @type {Record<string, string>}
 */
const POSITION_CLASSES = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2'
};

/**
 * Arrow (caret) classes per position.
 * @type {Record<string, string>}
 */
const ARROW_CLASSES = {
  top: [
    'absolute left-1/2 -translate-x-1/2 top-full',
    'border-4 border-transparent border-t-tf-surface'
  ].join(' '),
  bottom: [
    'absolute left-1/2 -translate-x-1/2 bottom-full',
    'border-4 border-transparent border-b-tf-surface'
  ].join(' ')
};

/** @type {number} Delay in milliseconds before the tooltip appears. */
const SHOW_DELAY = 300;

/**
 * Hover tooltip that displays a dark pill label above or below its children.
 *
 * @param {Object} props
 * @param {string} props.text
 *   Tooltip label text.
 * @param {React.ReactNode} props.children
 *   Trigger element that activates the tooltip on hover.
 * @param {'top'|'bottom'} [props.position='top']
 *   Placement of the tooltip relative to the trigger.
 * @returns {JSX.Element}
 */
export default function Tooltip({ text, children, position = 'top' }) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);

  /**
   * Starts the show delay when the pointer enters the trigger.
   */
  const handleMouseEnter = useCallback(() => {
    timerRef.current = setTimeout(() => setVisible(true), SHOW_DELAY);
  }, []);

  /**
   * Cancels any pending show delay and hides the tooltip immediately.
   */
  const handleMouseLeave = useCallback(() => {
    clearTimeout(timerRef.current);
    timerRef.current = null;
    setVisible(false);
  }, []);

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
    >
      {children}

      {visible && text && (
        <div
          role="tooltip"
          className={[
            'absolute z-50 pointer-events-none',
            'whitespace-nowrap px-2.5 py-1 rounded-full',
            'bg-tf-surface text-white text-xs font-medium',
            'shadow-lg border border-tf-primary/20',
            'animate-[fadeIn_150ms_ease-out]',
            POSITION_CLASSES[position] ?? POSITION_CLASSES.top
          ].join(' ')}
        >
          {text}
          <span className={ARROW_CLASSES[position] ?? ARROW_CLASSES.top} />
        </div>
      )}
    </div>
  );
}

Tooltip.propTypes = {
  /** Tooltip label text */
  text: PropTypes.string.isRequired,
  /** Trigger element */
  children: PropTypes.node.isRequired,
  /** Placement relative to the trigger */
  position: PropTypes.oneOf(['top', 'bottom'])
};
