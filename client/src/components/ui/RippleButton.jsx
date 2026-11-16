import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';

/**
 * RippleButton — A button that shows a Material-style expanding ripple circle
 * at the click position.
 *
 * All unknown props are forwarded to the underlying `<button>` element so you
 * can use `type`, `disabled`, `aria-*`, etc. as usual.
 *
 * @param {object}  props
 * @param {React.ReactNode} props.children   - Button label / content.
 * @param {string}  [props.className]        - Additional CSS classes.
 * @param {Function} [props.onClick]         - Click handler (called after ripple is created).
 * @param {object}  props.rest               - Any other props forwarded to `<button>`.
 *
 * @example
 * <RippleButton className="px-6 py-3 bg-indigo-600 text-white rounded-lg" onClick={save}>
 *   Save Changes
 * </RippleButton>
 */
const RippleButton = ({ children, className = '', onClick, ...rest }) => {
  const [ripples, setRipples] = useState([]);

  /** Spawn a ripple at the click coordinates. */
  const handleClick = useCallback(
    (/** @type {React.MouseEvent<HTMLButtonElement>} */ e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = Date.now() + Math.random();

      setRipples((prev) => [...prev, { id, x, y }]);

      if (onClick) onClick(e);
    },
    [onClick],
  );

  /** Remove a ripple from state after its animation finishes. */
  const removeRipple = useCallback((/** @type {number} */ id) => {
    setRipples((prev) => prev.filter((r) => r.id !== id));
  }, []);

  return (
    <button
      className={`relative overflow-hidden ${className}`}
      onClick={handleClick}
      {...rest}
    >
      {children}

      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            aria-hidden="true"
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            onAnimationComplete={() => removeRipple(ripple.id)}
            style={{
              position: 'absolute',
              left: ripple.x,
              top: ripple.y,
              width: 100,
              height: 100,
              marginLeft: -50,
              marginTop: -50,
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              pointerEvents: 'none',
            }}
          />
        ))}
      </AnimatePresence>
    </button>
  );
};

RippleButton.propTypes = {
  /** Button label or content. */
  children: PropTypes.node.isRequired,
  /** Additional CSS class names. */
  className: PropTypes.string,
  /** Click handler — receives the original MouseEvent. */
  onClick: PropTypes.func,
};

export default RippleButton;
