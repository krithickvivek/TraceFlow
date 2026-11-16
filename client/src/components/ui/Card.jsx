/**
 * @file Card.jsx
 * @description Glassmorphism card container for TraceFlow V2. Leverages the
 *              global `.glass-card` utility class and extends it with optional
 *              glow shadow and hover lift animation. Fits the dark
 *              techno-academic theme.
 * @exports Card (default)
 */

import PropTypes from 'prop-types';

/**
 * Glassmorphism card container with optional glow and hover-lift effects.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 *   Card body content.
 * @param {string} [props.className]
 *   Additional CSS classes to merge.
 * @param {boolean} [props.glow=false]
 *   When true, adds the primary indigo glow shadow defined by
 *   `--glow-primary` CSS variable.
 * @param {boolean} [props.hover=false]
 *   When true, the card lifts slightly on hover with a smooth transition.
 * @returns {JSX.Element}
 */
export default function Card({
  children,
  className = '',
  glow = false,
  hover = false
}) {
  return (
    <div
      className={[
        'glass-card p-5',
        glow ? 'shadow-[var(--glow-primary)]' : '',
        hover ? 'hover:-translate-y-0.5 transition-transform duration-200 ease-out' : '',
        className
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
}

Card.propTypes = {
  /** Card body content */
  children: PropTypes.node.isRequired,
  /** Additional CSS classes */
  className: PropTypes.string,
  /** Adds primary glow box-shadow */
  glow: PropTypes.bool,
  /** Enables hover lift animation */
  hover: PropTypes.bool
};
