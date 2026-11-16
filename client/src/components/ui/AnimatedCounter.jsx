import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Cubic ease-out function.
 * @param {number} t - Progress (0–1).
 * @returns {number} Eased value.
 */
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

/**
 * AnimatedCounter — An animated number display that smoothly counts up or down
 * whenever its `value` prop changes.
 *
 * Uses `requestAnimationFrame` with cubic ease-out for buttery-smooth
 * transitions and a monospace font for stable digit width.
 *
 * @param {object} props
 * @param {number} props.value              - Target numeric value.
 * @param {number} [props.duration=500]     - Animation duration in milliseconds.
 * @param {string} [props.className]        - Additional CSS classes.
 *
 * @example
 * <AnimatedCounter value={userCount} duration={800} className="text-3xl font-bold" />
 */
const AnimatedCounter = ({ value, duration = 500, className = '' }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const previousValue = useRef(value);
  const rafId = useRef(null);

  useEffect(() => {
    const from = previousValue.current;
    const to = value;

    // Nothing to animate
    if (from === to) return;

    const startTime = performance.now();

    /**
     * Animation loop driven by requestAnimationFrame.
     * @param {number} now - Current high-resolution timestamp.
     */
    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      const current = Math.round(from + (to - from) * eased);

      setDisplayValue(current);

      if (progress < 1) {
        rafId.current = requestAnimationFrame(step);
      } else {
        previousValue.current = to;
      }
    };

    rafId.current = requestAnimationFrame(step);

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [value, duration]);

  // Sync ref if value changes while idle (e.g., initial mount)
  useEffect(() => {
    previousValue.current = value;
  }, [value]);

  return (
    <span className={`font-mono ${className}`}>
      {displayValue}
    </span>
  );
};

AnimatedCounter.propTypes = {
  /** Target numeric value to animate toward. */
  value: PropTypes.number.isRequired,
  /** Animation duration in milliseconds. */
  duration: PropTypes.number,
  /** Additional CSS class names. */
  className: PropTypes.string,
};

export default AnimatedCounter;
