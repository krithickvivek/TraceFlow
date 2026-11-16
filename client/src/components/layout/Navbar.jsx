/**
 * @file Navbar.jsx
 * @description Top navigation bar rendered on every page (homepage, visualizer,
 *              auth pages). Displays the TraceFlow logo, primary navigation
 *              links, and authentication-aware controls (login/signup or
 *              user avatar + logout). Includes a responsive hamburger menu
 *              for mobile viewports.
 * @module components/layout/Navbar
 */

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../ui/ThemeToggle';
import Logo from '../ui/Logo';

/**
 * Extracts the first letter of the user's name (or email) to display as an
 * avatar initial.
 *
 * @param {object|null} user - The authenticated user object.
 * @returns {string} A single uppercase character.
 */
function getUserInitial(user) {
  if (!user) return '?';
  const source = user.name || user.email || '?';
  return source.charAt(0).toUpperCase();
}

/**
 * Top navigation bar component.
 *
 * Renders the TraceFlow brand, page links, and authentication controls.
 * On viewports narrower than 768 px, the navigation collapses behind a
 * hamburger toggle that reveals a full-width dropdown.
 *
 * @returns {JSX.Element}
 */
export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  /**
   * Handles the logout action: calls the auth context logout, then redirects
   * to the home page.
   */
  async function handleLogout() {
    await logout();
    setMobileOpen(false);
    navigate('/');
  }

  /**
   * Closes the mobile menu. Passed to links so that tapping a link on mobile
   * also dismisses the dropdown.
   */
  function closeMobile() {
    setMobileOpen(false);
  }

  const location = useLocation();

  /** Check if a nav link is active */
  const isActive = (path) => location.pathname === path || (path === '/visualizer' && location.pathname.startsWith('/visualizer'));

  const navLinkCls = (path) =>
    `relative px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
      isActive(path)
        ? 'text-[#6C63FF] bg-[rgba(108,99,255,0.12)]'
        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[rgba(108,99,255,0.08)]'
    }`;

  return (
    <>
      <nav
        className="h-16 px-6 flex items-center justify-between z-50"
        role="navigation"
        aria-label="Primary navigation"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          background: 'rgba(var(--bg-primary-rgb), 0.92)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}
      >
        {/* Gradient bottom border */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 1,
            background: 'linear-gradient(90deg, transparent 0%, rgba(108,99,255,0.4) 25%, rgba(0,229,204,0.3) 50%, rgba(108,99,255,0.4) 75%, transparent 100%)',
          }}
          aria-hidden="true"
        />

        {/* ── Left: Logo ── */}
        <div onClick={closeMobile} className="shrink-0">
          <Logo size="md" linkToHome />
        </div>

        {/* ── Center: Nav links (hidden < 768px) ── */}
        <div className="hidden md:flex items-center gap-1 font-body">
          <Link to={isAuthenticated ? '/dashboard' : '/'} className={navLinkCls(isAuthenticated ? '/dashboard' : '/')}>Home</Link>
          <Link to="/visualizer" className={navLinkCls('/visualizer')}>Visualizer</Link>
          {isAuthenticated && <Link to="/history" className={navLinkCls('/history')}>Saved</Link>}
          {isAuthenticated && <Link to="/quiz-results" className={navLinkCls('/quiz-results')}>Quizzes</Link>}
        </div>

        {/* ── Right: Actions (hidden < 768px) ── */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              {/* Profile button — links directly to /profile */}
              <Link
                to="/profile"
                className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-xl transition-all duration-200 border border-[var(--border-subtle)] hover:border-[rgba(108,99,255,0.3)] hover:bg-[rgba(108,99,255,0.06)]"
              >
                {user?.profile_pic ? (
                  <img
                    src={user.profile_pic}
                    alt={user.name || 'Profile'}
                    className="w-8 h-8 rounded-lg object-cover shrink-0"
                    style={{ boxShadow: '0 2px 8px rgba(108,99,255,0.3)' }}
                  />
                ) : (
                  <span
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, #6C63FF 0%, #4C46D9 100%)',
                      boxShadow: '0 2px 8px rgba(108,99,255,0.3)',
                    }}
                  >
                    {getUserInitial(user)}
                  </span>
                )}
                <span className="text-sm font-medium text-[var(--text-primary)] max-w-[100px] truncate">
                  {user?.name || 'User'}
                </span>
              </Link>

              {/* Logout button — always visible */}
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 bg-transparent border border-[var(--border-subtle)] hover:border-[rgba(255,77,109,0.3)] hover:bg-[rgba(255,77,109,0.06)] hover:text-[#FF4D6D] cursor-pointer text-[var(--text-muted)]"
              >
                <LogOut size={15} />
                <span className="hidden lg:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 ml-1">
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[rgba(108,99,255,0.06)] transition-all duration-200"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background: 'linear-gradient(135deg, #6C63FF 0%, #4C46D9 100%)',
                  boxShadow: '0 2px 12px rgba(108,99,255,0.3)',
                }}
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* ── Hamburger toggle (visible < 768px) ── */}
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[rgba(108,99,255,0.06)] transition-colors bg-transparent border-none cursor-pointer"
          aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* ── Mobile dropdown ── */}
        {mobileOpen && (
          <div
            className="absolute top-16 left-0 w-full md:hidden flex flex-col font-body text-sm z-50"
            style={{
              background: 'rgba(var(--bg-primary-rgb), 0.98)',
              backdropFilter: 'blur(20px)',
              borderBottom: '1px solid rgba(108,99,255,0.15)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}
          >
            <Link to="/" onClick={closeMobile} className="px-6 py-3.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[rgba(108,99,255,0.06)] transition-colors">Home</Link>
            <Link to="/visualizer" onClick={closeMobile} className="px-6 py-3.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[rgba(108,99,255,0.06)] transition-colors">Visualizer</Link>

            {isAuthenticated ? (
              <>
                <div className="px-6 py-3 border-t border-[var(--border-subtle)] flex items-center gap-3">
                  {user?.profile_pic ? (
                    <img src={user.profile_pic} alt={user.name || 'Profile'} className="w-8 h-8 rounded-lg object-cover" />
                  ) : (
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white" style={{ background: 'linear-gradient(135deg, #6C63FF, #4C46D9)' }}>
                      {getUserInitial(user)}
                    </span>
                  )}
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{user?.name}</p>
                    <p className="text-[11px] text-[var(--text-muted)]">{user?.email}</p>
                  </div>
                </div>
                <Link to="/profile" onClick={closeMobile} className="px-6 py-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[rgba(108,99,255,0.06)] transition-colors">Profile</Link>
                <button type="button" onClick={handleLogout} className="px-6 py-3 text-left text-[#FF4D6D] hover:bg-[rgba(255,77,109,0.06)] transition-colors bg-transparent border-none cursor-pointer font-body text-sm w-full">Sign Out</button>
              </>
            ) : (
              <div className="px-6 py-4 flex items-center gap-3 border-t border-[var(--border-subtle)]">
                <Link to="/login" onClick={closeMobile} className="flex-1 text-center py-2.5 rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Login</Link>
                <Link to="/register" onClick={closeMobile} className="flex-1 text-center py-2.5 rounded-lg text-white font-semibold" style={{ background: 'linear-gradient(135deg, #6C63FF, #4C46D9)' }}>Sign Up</Link>
              </div>
            )}
          </div>
        )}
      </nav>
      {/* Spacer to offset fixed navbar */}
      <div className="h-16" />
    </>
  );
}
