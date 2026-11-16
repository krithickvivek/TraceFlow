/**
 * @file Modal.jsx
 * @description Accessible modal dialog for TraceFlow V2. Uses Framer Motion
 *              AnimatePresence for enter/exit animations, a blurred backdrop
 *              overlay, and keyboard (Escape) + backdrop-click dismissal.
 *              Content is rendered in a glass-card styled container with a
 *              close button.
 * @exports Modal (default)
 */

import { useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import PropTypes from 'prop-types';

/**
 * Framer Motion variants for the backdrop overlay.
 * @type {import('framer-motion').Variants}
 */
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
};

/**
 * Framer Motion variants for the modal content panel.
 * @type {import('framer-motion').Variants}
 */
const panelVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 16 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', damping: 25, stiffness: 300 }
  },
  exit: { opacity: 0, scale: 0.95, y: 16, transition: { duration: 0.15 } }
};

/**
 * Modal dialog with animated backdrop, keyboard dismiss, and glass-card
 * content area.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen
 *   Controls modal visibility.
 * @param {Function} props.onClose
 *   Callback invoked when the user requests to close the modal (Escape key,
 *   backdrop click, or close button).
 * @param {string} [props.title]
 *   Optional title rendered in the modal header.
 * @param {React.ReactNode} props.children
 *   Modal body content.
 * @returns {JSX.Element}
 */
export default function Modal({ isOpen, onClose, title, children }) {
  /**
   * Handles Escape key press to close the modal.
   * @param {KeyboardEvent} e
   */
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  /* Bind / unbind Escape listener when modal opens / closes. */
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  /**
   * Handles clicks on the backdrop. Only closes if the click target is the
   * backdrop itself, not a child element.
   * @param {React.MouseEvent} e
   */
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={handleBackdropClick}
          aria-modal="true"
          role="dialog"
        >
          {/* Backdrop overlay */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          />

          {/* Content panel */}
          <motion.div
            className={[
              'glass-card relative z-10 w-full max-w-lg',
              'p-6 shadow-[var(--glow-primary)]'
            ].join(' ')}
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              {title && (
                <h2 className="text-lg font-display font-semibold text-tf-text">
                  {title}
                </h2>
              )}
              <button
                type="button"
                onClick={onClose}
                className={[
                  'ml-auto p-1.5 rounded-lg text-tf-text2',
                  'hover:text-tf-text hover:bg-white/10',
                  'transition-colors duration-150 focus-ring'
                ].join(' ')}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="text-tf-text2">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

Modal.propTypes = {
  /** Controls visibility */
  isOpen: PropTypes.bool.isRequired,
  /** Close callback (Escape, backdrop click, or X button) */
  onClose: PropTypes.func.isRequired,
  /** Optional header title */
  title: PropTypes.string,
  /** Modal body content */
  children: PropTypes.node.isRequired
};
