import { useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

/**
 * MagneticButton — A wrapper that makes its children subtly pull toward the
 * cursor when hovered, creating a satisfying magnetic interaction.
 *
 * Uses Framer Motion spring physics for natural-feeling movement.
 *
 * @param {object}  props
 * @param {React.ReactNode} props.children  - Content to render inside.
 * @param {number}  [props.strength=0.3]    - Pull strength multiplier (0–1).
 * @param {string}  [props.className]       - Additional CSS classes.
 *
 * @example
 * <MagneticButton strength={0.4}>
 *   <button className="btn-primary">Click me</button>
 * </MagneticButton>
 */
const MagneticButton = ({ children, strength = 0.3, className = '' }) => {
  const ref = useRef(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  /** Calculate offset toward cursor on hover. */
  const handleMouseMove = useCallback(
    (/** @type {React.MouseEvent<HTMLDivElement>} */ e) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = (e.clientX - centerX) * strength;
      const dy = (e.clientY - centerY) * strength;
      setOffset({ x: dx, y: dy });
    },
    [strength],
  );

  /** Reset position when cursor leaves. */
  const handleMouseLeave = useCallback(() => {
    setOffset({ x: 0, y: 0 });
  }, []);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ display: 'inline-block' }}
      animate={{ x: offset.x, y: offset.y }}
      transition={{ type: 'spring', stiffness: 150, damping: 15, mass: 0.1 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </motion.div>
  );
};

MagneticButton.propTypes = {
  /** Content rendered inside the magnetic wrapper. */
  children: PropTypes.node.isRequired,
  /** Pull strength multiplier (0 = no pull, 1 = strong pull). */
  strength: PropTypes.number,
  /** Additional CSS class names. */
  className: PropTypes.string,
};

export default MagneticButton;
