import { useState, useEffect, useCallback } from 'react';

/**
 * CursorGlow — A global cursor-following spotlight/glow effect.
 *
 * Renders a fixed-position, blurred radial gradient that tracks the mouse
 * across the entire viewport, giving the page a soft ambient lighting feel.
 *
 * - Desktop only (hidden below 768 px).
 * - Uses `pointer-events: none` so it never blocks interaction.
 * - Sits at `z-index: 0` behind all content.
 *
 * @example
 * // Place once at the root of your app (e.g. inside App.jsx)
 * <CursorGlow />
 */
const CursorGlow = () => {
  const [position, setPosition] = useState({ x: -250, y: -250 });
  const [isDesktop, setIsDesktop] = useState(false);

  /** Detect viewport width on mount and on resize. */
  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 768);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  /** Track mouse position with requestAnimationFrame for smooth rendering. */
  const handleMouseMove = useCallback((/** @type {MouseEvent} */ e) => {
    requestAnimationFrame(() => {
      setPosition({ x: e.clientX, y: e.clientY });
    });
  }, []);

  useEffect(() => {
    if (!isDesktop) return;
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isDesktop, handleMouseMove]);

  if (!isDesktop) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '500px',
        height: '500px',
        pointerEvents: 'none',
        zIndex: 0,
        transform: `translate(${position.x - 250}px, ${position.y - 250}px)`,
        transition: 'transform 0.15s ease-out',
        background:
          'radial-gradient(circle at center, rgba(var(--accent-primary-rgb, 99,102,241), 0.10) 0%, transparent 70%)',
        filter: 'blur(80px)',
        borderRadius: '50%',
        willChange: 'transform',
      }}
    />
  );
};

export default CursorGlow;
