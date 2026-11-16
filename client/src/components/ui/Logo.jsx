/**
 * @file Logo.jsx
 * @description TraceFlow brand logo — modern circuit-trace icon with split-font
 *              wordmark. "Trace" in bold weight, "Flow" in medium weight with
 *              gradient color. Uses Space Grotesk for a clean, techy feel.
 * @module components/ui/Logo
 */

import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

/**
 * TraceFlow SVG logo mark — abstract node-trace icon representing
 * algorithm flow: connected nodes with a flowing path.
 *
 * @param {object} props
 * @param {string} [props.className] - Additional CSS classes for the SVG.
 * @returns {JSX.Element}
 */
export function LogoMark({ className = 'w-8 h-8' }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="tfMark1" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
        <linearGradient id="tfMark2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#4ECDC4" />
        </linearGradient>
      </defs>

      {/* Background rounded square */}
      <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#tfMark1)" opacity="0.1" />

      {/* Flowing trace path */}
      <path
        d="M12 46 L22 32 L32 40 L42 20 L52 12"
        stroke="url(#tfMark1)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Data nodes along the path */}
      <circle cx="12" cy="46" r="4" fill="#3B82F6" />
      <circle cx="22" cy="32" r="4" fill="#3B82F6" opacity="0.85" />
      <circle cx="32" cy="40" r="4" fill="#0EA5E9" opacity="0.85" />
      <circle cx="42" cy="20" r="4" fill="#06B6D4" opacity="0.9" />
      <circle cx="52" cy="12" r="5" fill="#4ECDC4" />

      {/* Pulse ring on the lead node */}
      <circle cx="52" cy="12" r="8" stroke="#4ECDC4" strokeWidth="1.5" fill="none" opacity="0.3" />
    </svg>
  );
}

LogoMark.propTypes = {
  className: PropTypes.string,
};

/**
 * Full TraceFlow logo — icon + split-font wordmark.
 * "Trace" is bold, "Flow" is medium weight with gradient.
 *
 * @param {object} props
 * @param {string} [props.size='md'] - 'sm' | 'md' | 'lg' | 'xl' | '2xl'
 * @param {boolean} [props.linkToHome=true] - Wrap in a Link to /.
 * @param {string} [props.className] - Additional wrapper classes.
 * @returns {JSX.Element}
 */
export default function Logo({ size = 'md', linkToHome = true, className = '' }) {
  const sizes = {
    sm: { icon: 'w-6 h-6', text: 'text-lg', gap: 'gap-1.5' },
    md: { icon: 'w-8 h-8', text: 'text-xl', gap: 'gap-2' },
    lg: { icon: 'w-10 h-10', text: 'text-2xl', gap: 'gap-2.5' },
    xl: { icon: 'w-12 h-12', text: 'text-3xl', gap: 'gap-3' },
    '2xl': { icon: 'w-14 h-14', text: 'text-4xl', gap: 'gap-3' },
  };

  const s = sizes[size] || sizes.md;

  const content = (
    <div className={`flex items-center ${s.gap} ${className}`}>
      <LogoMark className={s.icon} />
      <span className={`font-logo ${s.text} tracking-tight leading-none`}>
        <span className="font-bold text-tf-text">Trace</span>
        <span className="font-medium gradient-text">Flow</span>
      </span>
    </div>
  );

  if (linkToHome) {
    return (
      <Link to="/" className="no-underline inline-flex hover:opacity-90 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}

Logo.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', '2xl']),
  linkToHome: PropTypes.bool,
  className: PropTypes.string,
};
