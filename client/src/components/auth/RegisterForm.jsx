/**
 * @file RegisterForm.jsx
 * @description Two-column registration form with profile picture upload,
 *              theme-aware inputs using CSS variables for light/dark mode.
 * @module components/auth/RegisterForm
 */

import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Briefcase,
  Building2,
  BarChart3,
  FileText,
  Camera,
} from 'lucide-react';
import { LogoMark } from '../ui/Logo';

/**
 * Validates the registration form fields and returns an error map.
 */
function validate(fields) {
  const errors = {};
  if (!fields.name.trim()) {
    errors.name = 'Name is required.';
  } else if (fields.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters.';
  }
  if (!fields.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
    errors.email = 'Enter a valid email address.';
  }
  if (!fields.password) {
    errors.password = 'Password is required.';
  } else if (fields.password.length < 6) {
    errors.password = 'Password must be at least 6 characters.';
  }
  if (!fields.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password.';
  } else if (fields.password !== fields.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
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
  height: '48px',
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

const baseSelectStyle = {
  ...baseInputStyle,
  appearance: 'none',
  WebkitAppearance: 'none',
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")",
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 14px center',
  paddingRight: '36px',
  cursor: 'pointer',
};

const baseTextareaStyle = {
  ...baseInputStyle,
  height: '64px',
  resize: 'none',
  paddingTop: '12px',
  paddingBottom: '12px',
  lineHeight: '1.5',
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
  height: '48px',
  background: 'linear-gradient(135deg, #6C63FF, #4C46D9)',
  border: 'none',
  borderRadius: '10px',
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

const toggleBtnStyle = {
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
};

export default function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [role, setRole] = useState('');
  const [organization, setOrganization] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [bio, setBio] = useState('');
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [focusField, setFocusField] = useState(null);
  const fileInputRef = useRef(null);

  const { register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    const fieldErrors = validate({ name, email, password, confirmPassword });
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    setLoading(true);
    try {
      await register(name, email, password, {
        role,
        organization,
        experience_level: experienceLevel,
        bio,
      });
      toast.success('Account created!');
      navigate('/visualizer');
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Registration failed. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  function handleProfilePicChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePicPreview(reader.result);
    };
    reader.readAsDataURL(file);
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

  function getSelectStyle(fieldName) {
    return {
      ...baseSelectStyle,
      border: errors[fieldName]
        ? errorInputBorder
        : focusField === fieldName
        ? `1px solid ${focusBorderColor}`
        : '1px solid var(--border-subtle)',
      boxShadow:
        focusField === fieldName ? '0 0 0 3px rgba(108,99,255,0.15)' : 'none',
    };
  }

  function getTextareaStyle(fieldName) {
    return {
      ...baseTextareaStyle,
      border:
        focusField === fieldName
          ? `1px solid ${focusBorderColor}`
          : '1px solid var(--border-subtle)',
      boxShadow:
        focusField === fieldName ? '0 0 0 3px rgba(108,99,255,0.15)' : 'none',
    };
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{
        maxWidth: '880px',
        width: '100%',
        margin: '0 auto',
        padding: '36px 40px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '20px',
        boxShadow: '0 8px 40px rgba(0,0,0,0.2)',
      }}
    >
      <form
        onSubmit={handleSubmit}
        noValidate
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0 36px',
        }}
      >
        {/* ═══ LEFT COLUMN ═══ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Logo + heading */}
          <div style={{ marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'rgba(108,99,255,0.1)',
                  border: '1px solid rgba(108,99,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <LogoMark className="w-6 h-6" />
              </div>
              <div>
                <h1
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontSize: '26px',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    margin: 0,
                    lineHeight: 1.2,
                  }}
                >
                  Join TraceFlow
                </h1>
                <p
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                    margin: 0,
                  }}
                >
                  Create your account
                </p>
              </div>
            </div>
          </div>

          {/* Full Name */}
          <div style={inputWrapperStyle}>
            <label htmlFor="register-name" style={labelStyle}>Full Name</label>
            <div style={inputContainerStyle}>
              <User size={16} style={iconStyle} />
              <input
                id="register-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={() => setFocusField('name')}
                onBlur={() => setFocusField(null)}
                placeholder="John Doe"
                autoComplete="name"
                style={getInputStyle('name')}
              />
            </div>
            {errors.name && <p style={errorTextStyle}>{errors.name}</p>}
          </div>

          {/* Email */}
          <div style={inputWrapperStyle}>
            <label htmlFor="register-email" style={labelStyle}>Email Address</label>
            <div style={inputContainerStyle}>
              <Mail size={16} style={iconStyle} />
              <input
                id="register-email"
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

          {/* Password */}
          <div style={inputWrapperStyle}>
            <label htmlFor="register-password" style={labelStyle}>Password</label>
            <div style={inputContainerStyle}>
              <Lock size={16} style={iconStyle} />
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusField('password')}
                onBlur={() => setFocusField(null)}
                placeholder="Min. 6 characters"
                autoComplete="new-password"
                style={{ ...getInputStyle('password'), paddingRight: '48px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={toggleBtnStyle}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p style={errorTextStyle}>{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div style={inputWrapperStyle}>
            <label htmlFor="register-confirm-password" style={labelStyle}>Confirm Password</label>
            <div style={inputContainerStyle}>
              <Lock size={16} style={iconStyle} />
              <input
                id="register-confirm-password"
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onFocus={() => setFocusField('confirmPassword')}
                onBlur={() => setFocusField(null)}
                placeholder="Re-enter your password"
                autoComplete="new-password"
                style={{ ...getInputStyle('confirmPassword'), paddingRight: '48px' }}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                style={toggleBtnStyle}
                tabIndex={-1}
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirmPassword && <p style={errorTextStyle}>{errors.confirmPassword}</p>}
          </div>
        </div>

        {/* ═══ RIGHT COLUMN ═══ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Profile Picture Upload */}
          <div style={{ ...inputWrapperStyle, alignItems: 'flex-start' }}>
            <label style={labelStyle}>Profile Picture <span style={{ fontWeight: 400, opacity: 0.6, textTransform: 'none', letterSpacing: 'normal' }}>(optional)</span></label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleProfilePicChange}
              style={{ display: 'none' }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                border: '2px dashed var(--border-subtle)',
                background: profilePicPreview ? `url(${profilePicPreview}) center/cover no-repeat` : 'var(--bg-surface)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                overflow: 'hidden',
                transition: 'border-color 0.2s ease',
              }}
              aria-label="Upload profile picture"
            >
              {!profilePicPreview && <Camera size={22} style={{ color: 'var(--text-muted)' }} />}
            </button>
          </div>

          {/* Role */}
          <div style={inputWrapperStyle}>
            <label htmlFor="register-role" style={labelStyle}>Role</label>
            <div style={inputContainerStyle}>
              <Briefcase size={16} style={iconStyle} />
              <select
                id="register-role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                onFocus={() => setFocusField('role')}
                onBlur={() => setFocusField(null)}
                style={getSelectStyle('role')}
              >
                <option value="">Select role...</option>
                <option value="Student">Student</option>
                <option value="Teacher">Teacher</option>
                <option value="Professional">Professional</option>
                <option value="Self-learner">Self-learner</option>
              </select>
            </div>
          </div>

          {/* Experience Level */}
          <div style={inputWrapperStyle}>
            <label htmlFor="register-experience" style={labelStyle}>Experience Level</label>
            <div style={inputContainerStyle}>
              <BarChart3 size={16} style={iconStyle} />
              <select
                id="register-experience"
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                onFocus={() => setFocusField('experienceLevel')}
                onBlur={() => setFocusField(null)}
                style={getSelectStyle('experienceLevel')}
              >
                <option value="">Select level...</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          {/* Organization */}
          <div style={inputWrapperStyle}>
            <label htmlFor="register-org" style={labelStyle}>
              Organization <span style={{ fontWeight: 400, opacity: 0.6, textTransform: 'none', letterSpacing: 'normal' }}>(optional)</span>
            </label>
            <div style={inputContainerStyle}>
              <Building2 size={16} style={iconStyle} />
              <input
                id="register-org"
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                onFocus={() => setFocusField('organization')}
                onBlur={() => setFocusField(null)}
                placeholder="University or company"
                style={getInputStyle('organization')}
              />
            </div>
          </div>

          {/* Bio */}
          <div style={inputWrapperStyle}>
            <label htmlFor="register-bio" style={labelStyle}>
              Bio <span style={{ fontWeight: 400, opacity: 0.6, textTransform: 'none', letterSpacing: 'normal' }}>(optional)</span>
            </label>
            <div style={inputContainerStyle}>
              <FileText
                size={16}
                style={{ ...iconStyle, top: '18px', transform: 'none' }}
              />
              <textarea
                id="register-bio"
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, 200))}
                onFocus={() => setFocusField('bio')}
                onBlur={() => setFocusField(null)}
                placeholder="Tell us about yourself..."
                maxLength={200}
                rows={2}
                style={getTextareaStyle('bio')}
              />
            </div>
            <p
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '10px',
                color: 'var(--text-muted)',
                textAlign: 'right',
                margin: 0,
              }}
            >
              {bio.length}/200
            </p>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              ...buttonStyle,
              marginTop: '4px',
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
            {loading ? 'Creating Account...' : 'Create Account'}
            <ArrowRight size={18} />
          </button>

          {/* Login link */}
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '14px',
              color: 'var(--text-secondary)',
              textAlign: 'center',
              margin: 0,
            }}
          >
            Already have an account?{' '}
            <Link
              to="/login"
              style={{ color: '#6C63FF', textDecoration: 'none', fontWeight: 600 }}
              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
            >
              Login
            </Link>
          </p>
        </div>

        {/* ═══ MOBILE: Make it stack on small screens ═══ */}
        <style>{`
          @media (max-width: 700px) {
            form[novalidate] {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </form>
    </motion.div>
  );
}

RegisterForm.propTypes = {};
