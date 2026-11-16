/**
 * @file Badge.jsx
 * @description Small pill badge component for TraceFlow V2. Displays status
 *              or category labels with color-coded variants that follow the
 *              dark techno-academic theme. Background uses the variant color
 *              at 15% opacity for a subtle, readable look.
 * @exports Badge (default)
 */

import PropTypes from 'prop-types';

/**
 * Tailwind class maps for each badge variant.
 * Background uses the theme color at ~15% opacity; text uses the full color.
 *
 * @type {Record<string, string>}
 */
const VARIANT_CLASSES = {
  success: 'bg-[var(--bg-hover)] text-tf-green border border-[var(--border-subtle)]',
  warn: 'bg-[var(--bg-hover)] text-tf-gold border border-[var(--border-subtle)]',
  danger: 'bg-[var(--bg-hover)] text-tf-rose border border-[var(--border-subtle)]',
  info: 'bg-[var(--bg-hover)] text-tf-teal border border-[var(--border-subtle)]',
  muted: 'bg-[var(--bg-hover)] text-tf-muted border border-[var(--border-subtle)]'
};

/**
 * Small pill badge for status indicators, tags, and labels.
 *
 * @param {Object} props
 * @param {'success'|'warn'|'danger'|'info'|'muted'} [props.variant='info']
 *   Color variant controlling background and text color.
 * @param {React.ReactNode} props.children
 *   Badge label content.
 * @param {string} [props.className]
 *   Additional CSS classes to merge.
 * @returns {JSX.Element}
 */
export default function Badge({ variant = 'info', children, className = '' }) {
  return (
    <span
      className={[
        'inline-flex items-center px-3 py-1 rounded-md',
        'text-[11px] font-semibold leading-tight whitespace-nowrap tracking-wide',
        VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.info,
        className
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </span>
  );
}

Badge.propTypes = {
  /** Color variant */
  variant: PropTypes.oneOf(['success', 'warn', 'danger', 'info', 'muted']),
  /** Badge label content */
  children: PropTypes.node.isRequired,
  /** Additional CSS classes */
  className: PropTypes.string
};
