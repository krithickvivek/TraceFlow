/**
 * @file ToastContext.jsx
 * @description Toast notification system. Provides a ToastProvider and useToast hook.
 *              Supports success, error, info, warning types with auto-dismiss.
 * @module context/ToastContext
 */

import { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

/** Maximum number of visible toasts at once. */
const MAX_TOASTS = 3;

/** Auto-dismiss delay in milliseconds. */
const DISMISS_DELAY = 3000;

/** Counter for unique toast IDs. */
let toastIdCounter = 0;

const ToastContext = createContext(null);

/** Icon map for each toast type. */
const ICONS = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle
};

/** Color map for each toast type. */
const COLORS = {
  success: 'text-tf-green border-tf-green/30',
  error: 'text-tf-rose border-tf-rose/30',
  info: 'text-tf-teal border-tf-teal/30',
  warning: 'text-tf-gold border-tf-gold/30'
};

/**
 * Provider component that renders the toast stack.
 *
 * @param {{ children: React.ReactNode }} props
 * @returns {JSX.Element}
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  /**
   * Remove a toast by ID.
   * @param {number} id
   */
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  /**
   * Add a toast notification.
   * @param {'success'|'error'|'info'|'warning'} type
   * @param {string} message
   */
  const addToast = useCallback((type, message) => {
    const id = ++toastIdCounter;

    setToasts((prev) => {
      const next = [...prev, { id, type, message }];
      /* Keep only the last MAX_TOASTS. */
      return next.slice(-MAX_TOASTS);
    });

    /* Auto-dismiss. */
    setTimeout(() => removeToast(id), DISMISS_DELAY);
  }, [removeToast]);

  /** Convenience methods. */
  const toast = {
    success: (msg) => addToast('success', msg),
    error: (msg) => addToast('error', msg),
    info: (msg) => addToast('info', msg),
    warning: (msg) => addToast('warning', msg)
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Toast stack — fixed bottom-right */}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon = ICONS[t.type] || Info;
            const colorClass = COLORS[t.type] || COLORS.info;
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 80, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 80, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl
                           bg-tf-card border ${colorClass} shadow-lg min-w-[280px] max-w-[380px]`}
              >
                <Icon size={18} className="shrink-0" />
                <span className="text-sm text-tf-text flex-1">{t.message}</span>
                <button
                  onClick={() => removeToast(t.id)}
                  className="shrink-0 text-tf-muted hover:text-tf-text transition-colors"
                >
                  <X size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

ToastProvider.propTypes = {
  children: PropTypes.node.isRequired
};

/**
 * Hook to access toast notification functions.
 *
 * @returns {{ toast: { success: Function, error: Function, info: Function, warning: Function } }}
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
}
