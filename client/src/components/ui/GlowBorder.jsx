import { useRef, useState, useCallback } from 'react';
import PropTypes from 'prop-types';

/**
 * GlowBorder — A wrapper that adds a cursor-aware glowing border effect.
 *
 * The glow follows the cursor around the card edges, creating a premium
 * highlight that traces the perimeter as you move.
 *
 * @param {object}  props
 * @param {React.ReactNode} props.children            - Card content.
 * @param {string}  [props.className]                 - Additional CSS classes on the outer container.
 * @param {string}  [props.color='var(--accent-primary)'] - Glow colour (any CSS colour value).
 * @param {number}  [props.size=200]                  - Diameter (px) of the glow spotlight.
 *
 * @example
 * <GlowBorder color="#6366f1" size={250}>
 *   <div className="p-6">
 *     <h3>Feature card</h3>
 *   </div>
 * </GlowBorder>
 */
const GlowBorder = ({
  children,
  className = '',
  color = 'var(--accent-primary, #6366f1)',
  size = 200,
}) => {
  const containerRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  /** Track cursor position relative to the container. */
  const handleMouseMove = useCallback(
    (/** @type {React.MouseEvent<HTMLDivElement>} */ e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    },
    [],
  );

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  const halfSize = size / 2;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-xl ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ position: 'relative' }}
    >
      {/* Glow spotlight that follows the cursor */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: mousePos.x - halfSize,
          top: mousePos.y - halfSize,
          width: size,
          height: size,
          background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
          opacity: isHovered ? 1 : 0,
          filter: 'blur(40px)',
          pointerEvents: 'none',
          transition: 'opacity 0.3s ease-out',
          zIndex: 0,
        }}
      />

      {/* Inner background that creates the 1px border gap */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: '1px',
          borderRadius: 'inherit',
          zIndex: 1,
          backgroundColor: 'var(--bg-primary, #0f0f12)',
        }}
      />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 10 }}>{children}</div>
    </div>
  );
};

GlowBorder.propTypes = {
  /** Card content. */
  children: PropTypes.node.isRequired,
  /** Additional CSS classes for the outer wrapper. */
  className: PropTypes.string,
  /** Glow colour — accepts any valid CSS colour value. */
  color: PropTypes.string,
  /** Diameter (in px) of the glow spotlight. */
  size: PropTypes.number,
};

export default GlowBorder;
