import { useRef, useState, useCallback } from 'react';
import PropTypes from 'prop-types';

/**
 * TiltCard — A card wrapper that tilts in 3D based on cursor position and
 * optionally renders a spotlight glare that follows the mouse.
 *
 * @param {object}  props
 * @param {React.ReactNode} props.children       - Card content.
 * @param {string}  [props.className]            - Additional CSS classes.
 * @param {number}  [props.maxTilt=8]            - Maximum tilt angle in degrees.
 * @param {boolean} [props.glare=true]           - Whether to render the glare overlay.
 *
 * @example
 * <TiltCard maxTilt={10} glare>
 *   <h2>Premium Feature</h2>
 *   <p>Hover me for a 3-D tilt effect.</p>
 * </TiltCard>
 */
const TiltCard = ({ children, className = '', maxTilt = 8, glare = true }) => {
  const ref = useRef(null);

  const [transform, setTransform] = useState(
    'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)',
  );
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  /** Recalculate tilt + glare position on every mousemove. */
  const handleMouseMove = useCallback(
    (/** @type {React.MouseEvent<HTMLDivElement>} */ e) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const halfWidth = rect.width / 2;
      const halfHeight = rect.height / 2;

      const mouseX = e.clientX - centerX;
      const mouseY = e.clientY - centerY;

      const rotateX = (mouseY / halfHeight) * -maxTilt;
      const rotateY = (mouseX / halfWidth) * maxTilt;

      setTransform(
        `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`,
      );

      // Glare position as % of card dimensions
      const percentX = ((e.clientX - rect.left) / rect.width) * 100;
      const percentY = ((e.clientY - rect.top) / rect.height) * 100;
      setGlarePos({ x: percentX, y: percentY });
    },
    [maxTilt],
  );

  /** Reset tilt on mouse leave. */
  const handleMouseLeave = useCallback(() => {
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)');
    setIsHovered(false);
  }, []);

  /** Mark hovered on enter so glare fades in. */
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      style={{
        transform,
        transition: 'transform 0.2s ease-out',
        transformStyle: 'preserve-3d',
        backfaceVisibility: 'hidden',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Glare overlay */}
      {glare && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 1,
            borderRadius: 'inherit',
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.3s ease-out',
            background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.1) 0%, transparent 60%)`,
          }}
        />
      )}

      {/* Card content */}
      <div style={{ position: 'relative', zIndex: 2 }}>{children}</div>
    </div>
  );
};

TiltCard.propTypes = {
  /** Card content. */
  children: PropTypes.node.isRequired,
  /** Additional CSS classes for the outer container. */
  className: PropTypes.string,
  /** Maximum tilt angle in degrees. */
  maxTilt: PropTypes.number,
  /** Whether to show the cursor-following glare overlay. */
  glare: PropTypes.bool,
};

export default TiltCard;
