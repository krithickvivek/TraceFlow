/**
 * @file LoginForm.jsx
 * @description Redesigned login form with TraceFlow indigo/cyan color scheme,
 *              icon-prefixed inputs, password show/hide toggle, remember me
 *              checkbox, and gradient submit button.
 * @module components/auth/LoginForm
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Mail, Lock, Eye, EyeOff, Sparkles } from 'lucide-react';

/**
 * Validates the login form fields and returns an error map.
 * @param {{ email: string, password: string }} fields
 * @returns {Record<string, string>}
 */
function validate(fields) {
  const errors = {};
  if (!fields.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
    errors.email = 'Enter a valid email address.';
  }
  if (!fields.password) {
    errors.password = 'Password is required.';
  }
  return errors;
}

/* ── Shared inline style objects ── */

const inputWrapperStyle = {
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
};

const labelStyle = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '10px',
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  color: 'var(--text-muted)',
};

const inputContainerStyle = {
  position: 'relative',
};

const iconStyle = {
  position: 'absolute',
  left: '14px',
  top: '50%',
  transform: 'translateY(-50%)',
  color: 'var(--text-muted)',
  pointerEvents: 'none',
};

const baseInputStyle = {
  width: '100%',
  height: '52px',
  background: 'var(--bg-surface)',
  border: '1px solid var(--border-subtle)',
  borderRadius: '10px',
  paddingLeft: '42px',
  paddingRight: '14px',
  color: 'var(--text-primary)',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '14px',
  outline: 'none',
  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  boxSizing: 'border-box',
};

const errorInputBorder = '1px solid rgba(239,68,68,0.6)';
const focusBorderColor = '#6C63FF';

const errorTextStyle = {
  fontSize: '12px',
  color: '#EF4444',
  marginTop: '2px',
  fontFamily: "'DM Sans', sans-serif",
};

const buttonStyle = {
  width: '100%',
  height: '52px',
  background: 'linear-gradient(135deg, #6C63FF, #4C46D9)',
  border: 'none',
  borderRadius: '12px',
  color: '#fff',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '15px',
  fontWeight: 600,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  boxShadow: '0 4px 20px rgba(108,99,255,0.3)',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
};

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [focusField, setFocusField] = useState(null);

  const { login, continueAsGuest } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    const fieldErrors = validate({ email, password });
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || 'Login failed. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  function handleGuest() {
    continueAsGuest();
    navigate('/visualizer');
  }

  function getInputStyle(fieldName) {
    return {
      ...baseInputStyle,
      border: errors[fieldName]
        ? errorInputBorder
        : focusField === fieldName
        ? `1px solid ${focusBorderColor}`
        : '1px solid var(--border-subtle)',
      boxShadow:
        focusField === fieldName ? '0 0 0 3px rgba(108,99,255,0.15)' : 'none',
    };
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
    >
      {/* Email field */}
      <div style={inputWrapperStyle}>
        <label htmlFor="login-email" style={labelStyle}>
          Email Address
        </label>
        <div style={inputContainerStyle}>
          <Mail size={18} style={iconStyle} />
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => setFocusField('email')}
            onBlur={() => setFocusField(null)}
            placeholder="you@example.com"
            autoComplete="email"
            style={getInputStyle('email')}
          />
        </div>
        {errors.email && <p style={errorTextStyle}>{errors.email}</p>}
      </div>

      {/* Password field */}
      <div style={inputWrapperStyle}>
        <label htmlFor="login-password" style={labelStyle}>
          Password
        </label>
        <div style={inputContainerStyle}>
          <Lock size={18} style={iconStyle} />
          <input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setFocusField('password')}
            onBlur={() => setFocusField(null)}
            placeholder="Enter your password"
            autoComplete="current-password"
            style={{
              ...getInputStyle('password'),
              paddingRight: '48px',
            }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
            }}
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && <p style={errorTextStyle}>{errors.password}</p>}
      </div>

      {/* Remember me */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input
          id="remember-me"
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          style={{
            width: '16px',
            height: '16px',
            accentColor: '#6C63FF',
            cursor: 'pointer',
          }}
        />
        <label
          htmlFor="remember-me"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '13px',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
          }}
        >
          Remember me
        </label>
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={loading}
        style={{
          ...buttonStyle,
          opacity: loading ? 0.7 : 1,
          pointerEvents: loading ? 'none' : 'auto',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 28px rgba(108,99,255,0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(108,99,255,0.3)';
        }}
      >
        <Sparkles size={18} />
        {loading ? 'Signing In...' : 'Sign In to TraceFlow →'}
      </button>

      {/* Register link */}
      <p
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '14px',
          color: 'var(--text-secondary)',
          textAlign: 'center',
          margin: 0,
        }}
      >
        Don&apos;t have an account?{' '}
        <Link
          to="/register"
          style={{
            color: '#6C63FF',
            textDecoration: 'none',
            fontWeight: 600,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
          onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
        >
          Sign up
        </Link>
      </p>

      {/* Continue as Guest */}
      <button
        type="button"
        onClick={handleGuest}
        style={{
          background: 'none',
          border: 'none',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '13px',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          textAlign: 'center',
          padding: 0,
          transition: 'color 0.2s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#6C63FF')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
      >
        Continue as Guest
      </button>
    </form>
  );
}

LoginForm.propTypes = {};
