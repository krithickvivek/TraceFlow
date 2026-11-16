/**
 * @file App.jsx
 * @description Root application component. Sets up routing, providers, and
 *              page-level error boundary.
 * @module App
 */

import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TraceProvider } from './context/TraceContext';
import { ToastProvider } from './context/ToastContext';
import HomePage from './pages/HomePage';
import VisualizerPage from './pages/VisualizerPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import DashboardPage from './pages/DashboardPage';
import HistoryPage from './pages/HistoryPage';
import QuizPage from './pages/QuizPage';
import QuizResultsPage from './pages/QuizResultsPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { Component, useEffect } from 'react';

/**
 * Scroll to top on every route change so pages always start at the top.
 */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

/**
 * Apply persisted theme on mount so it works across all routes.
 */
function ThemeInitializer() {
  useEffect(() => {
    const stored = localStorage.getItem('traceflow-theme');
    const preferLight = window.matchMedia?.('(prefers-color-scheme: light)').matches;
    if (stored === 'light' || (!stored && preferLight)) {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, []);
  return null;
}

/**
 * Error boundary that catches render errors in the visualizer.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-tf-bg flex items-center justify-center p-8">
          <div className="solid-card p-8 text-center max-w-md">
            <h2 className="font-display text-xl font-bold text-tf-rose mb-2">Something went wrong</h2>
            <p className="text-tf-text2 text-sm mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => { this.setState({ hasError: false }); window.location.href = '/'; }}
              className="px-4 py-2 rounded-lg bg-tf-blue text-white text-sm hover:opacity-90"
            >
              Go Home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * Root application component with routing and providers.
 *
 * @returns {JSX.Element}
 */
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TraceProvider>
          <ToastProvider>
            <ErrorBoundary>
              <ScrollToTop />
              <ThemeInitializer />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } />
                <Route path="/history" element={
                  <ProtectedRoute>
                    <HistoryPage />
                  </ProtectedRoute>
                } />
                <Route path="/visualizer" element={<VisualizerPage />} />
                <Route path="/visualizer/:algorithmSlug" element={<VisualizerPage />} />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } />
                <Route path="/quiz/:algorithmSlug" element={
                  <ProtectedRoute>
                    <QuizPage />
                  </ProtectedRoute>
                } />
                <Route path="/quiz-results" element={
                  <ProtectedRoute>
                    <QuizResultsPage />
                  </ProtectedRoute>
                } />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </ErrorBoundary>
          </ToastProvider>
        </TraceProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
