/**
 * @file PageTransition.jsx
 * @description Framer Motion wrapper that applies a subtle fade + vertical
 *              slide transition when pages mount, animate, and exit. Intended
 *              to wrap each route's content inside an `<AnimatePresence>`
 *              provided by the router layer.
 * @module components/layout/PageTransition
 */

import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

/**
 * Framer Motion animation variants for the page transition.
 *
 * @type {{ initial: object, animate: object, exit: object }}
 */
const variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 }
};

/**
 * Default transition configuration applied to the page wrapper.
 *
 * @type {{ duration: number }}
 */
const transition = { duration: 0.25 };

/**
 * Page transition wrapper component.
 *
 * Wraps its children in a `motion.div` that fades in from below on mount,
 * sits in place while active, and fades out upward on exit.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - The page content to wrap.
 * @returns {JSX.Element}
 *
 * @example
 * <AnimatePresence mode="wait">
 *   <PageTransition key={location.pathname}>
 *     <MyPage />
 *   </PageTransition>
 * </AnimatePresence>
 */
export default function PageTransition({ children }) {
  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={transition}
    >
      {children}
    </motion.div>
  );
}

PageTransition.propTypes = {
  /** The page content to wrap with the transition animation. */
  children: PropTypes.node.isRequired
};
