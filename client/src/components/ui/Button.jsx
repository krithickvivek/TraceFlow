/**
 * @file Button.jsx
 * @description Reusable button component for TraceFlow V2. Supports multiple
 *              visual variants (primary, ghost, danger, outline) and sizes
 *              (sm, md, lg). Includes loading spinner state and optional
 *              leading icon. Follows the dark techno-academic theme with
 *              CSS variables and Tailwind utility classes.
 * @exports Button (default)
 */

import PropTypes from 'prop-types';
import { Loader2 } from 'lucide-react';

/**
 * Tailwind class maps for each button variant.
 * @type {Record<string, string>}
 */
const VARIANT_CLASSES = {
  primary: [
    'bg-tf-blue text-white',
    'hover:bg-tf-blue/90 hover:shadow-lg hover:-translate-y-0.5',
    'active:translate-y-0 active:scale-[0.98]',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0'
  ].join(' '),
  ghost: [
    'border border-tf-blue/30 text-tf-blue bg-transparent',
    'hover:bg-tf-blue/10 hover:border-tf-blue',
    'active:bg-tf-blue/20',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent'
  ].join(' '),
  danger: [
    'bg-tf-rose text-white',
    'hover:shadow-[0_0_20px_rgba(255,77,109,0.4)] hover:brightness-110',
    'active:brightness-90',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none'
  ].join(' '),
  outline: [
    'border border-tf-muted text-tf-text2 bg-transparent',
    'hover:border-tf-text2 hover:text-tf-text',
    'active:bg-white/5',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-tf-muted'
  ].join(' ')
};

/**
 * Tailwind class maps for each button size.
 * @type {Record<string, string>}
 */
const SIZE_CLASSES = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2.5'
};

/**
 * Icon size (in pixels) per button size.
 * @type {Record<string, number>}
 */
const ICON_SIZES = {
  sm: 14,
  md: 16,
  lg: 18
};

/**
 * Reusable button with variant styling, size options, loading state, and
 * optional leading icon.
 *
 * @param {Object} props
 * @param {'primary'|'ghost'|'danger'|'outline'} [props.variant='primary']
 *   Visual style variant.
 * @param {'sm'|'md'|'lg'} [props.size='md']
 *   Size preset controlling padding and font size.
 * @param {boolean} [props.disabled=false]
 *   Whether the button is disabled.
 * @param {boolean} [props.loading=false]
 *   When true, shows a spinning loader and disables interaction.
 * @param {React.ElementType} [props.icon]
 *   Optional Lucide icon component rendered before children.
 * @param {Function} [props.onClick]
 *   Click handler.
 * @param {React.ReactNode} props.children
 *   Button label / content.
 * @param {string} [props.className]
 *   Additional CSS classes to merge.
 * @param {'button'|'submit'|'reset'} [props.type='button']
 *   HTML button type attribute.
 * @returns {JSX.Element}
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon: Icon,
  onClick,
  children,
  className = '',
  type = 'button'
}) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={[
        'inline-flex items-center justify-center font-medium rounded-lg',
        'transition-all duration-200 ease-out',
        'focus-ring',
        VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.primary,
        SIZE_CLASSES[size] ?? SIZE_CLASSES.md,
        className
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {loading ? (
        <Loader2
          size={ICON_SIZES[size] ?? 16}
          className="animate-spin shrink-0"
        />
      ) : Icon ? (
        <Icon size={ICON_SIZES[size] ?? 16} className="shrink-0" />
      ) : null}
      {children}
    </button>
  );
}

Button.propTypes = {
  /** Visual style variant */
  variant: PropTypes.oneOf(['primary', 'ghost', 'danger', 'outline']),
  /** Size preset */
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  /** Disabled state */
  disabled: PropTypes.bool,
  /** Loading state — shows spinner and disables button */
  loading: PropTypes.bool,
  /** Optional leading icon (Lucide component) */
  icon: PropTypes.elementType,
  /** Click handler */
  onClick: PropTypes.func,
  /** Button content */
  children: PropTypes.node.isRequired,
  /** Additional CSS classes */
  className: PropTypes.string,
  /** HTML button type */
  type: PropTypes.oneOf(['button', 'submit', 'reset'])
};
