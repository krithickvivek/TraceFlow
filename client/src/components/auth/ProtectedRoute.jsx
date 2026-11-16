/**
 * @file ProtectedRoute.jsx
 * @description Route guard component for TraceFlow V2. Checks authentication
 *              state from AuthContext and either renders children, shows a
 *              loading spinner, or redirects unauthenticated visitors to the
 *              login page (preserving the intended destination as a query param).
 * @module components/auth/ProtectedRoute
 */

import { Navigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../../context/AuthContext';

/**
 * A loading spinner shown while the auth session is being rehydrated.
 *
 * @returns {JSX.Element}
 */
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-tf-bg">
      <div className="w-10 h-10 border-4 border-tf-primary/30 border-t-tf-primary rounded-full animate-spin" />
    </div>
  );
}

/**
 * Route guard that protects child routes behind authentication.
 *
 * Behavior:
 * - If `isLoading` is true (session check in progress), renders a spinner.
 * - If the user is neither authenticated nor a guest, redirects to `/login`
 *   with a `?redirect=` query parameter preserving the current path.
 * - Otherwise, renders the children.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - The protected page/component to render.
 * @returns {JSX.Element}
 */
export default function ProtectedRoute({ children }) {
  const { isLoading, isAuthenticated, isGuest } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated && !isGuest) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return children;
}

ProtectedRoute.propTypes = {
  /** The protected content to render when access is granted. */
  children: PropTypes.node.isRequired
};
