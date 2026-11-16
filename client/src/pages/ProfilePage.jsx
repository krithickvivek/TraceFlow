/**
 * @file ProfilePage.jsx
 * @description CineVision-style profile page with header card, stat cards,
 *              recent activity, algorithm progress, and inline edit form.
 * @module pages/ProfilePage
 */

import { useState, useMemo, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocalProgress } from '../hooks/useLocalProgress';
import { useToast } from '../context/ToastContext';
import { algorithms } from '../algorithms';
import Navbar from '../components/layout/Navbar';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import {
  BookOpen,
  Grid3X3,
  CheckCircle,
  Circle,
  Clock,
  ArrowRight,
  Pencil,
  X,
  Building2,
  Save,
  BarChart3,
  Loader2,
  Camera,
} from 'lucide-react';

/** All algorithm entries for the progress grid. */
const ALGO_ENTRIES = Object.values(algorithms).map((a) => a.metadata);

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: 'easeOut' },
  }),
};

/* ── Shared card style (uses CSS vars for light/dark mode) ── */
const cardBase = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 16,
};

/* ── Form field styles ── */
const labelStyle = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 10,
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  color: 'var(--text-muted)',
  marginBottom: 6,
  display: 'block',
};

const inputStyle = {
  width: '100%',
  height: 44,
  background: 'var(--bg-surface)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 10,
  padding: '0 14px',
  color: 'var(--text-primary)',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s ease',
};

const selectStyle = {
  ...inputStyle,
  height: 44,
  appearance: 'none',
  WebkitAppearance: 'none',
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")",
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 14px center',
  paddingRight: 36,
};

const textareaStyle = {
  ...inputStyle,
  height: 80,
  resize: 'none',
  padding: '12px 14px',
  lineHeight: 1.5,
};

/**
 * User profile and progress dashboard (CineVision-style).
 * @returns {JSX.Element}
 */
export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { progress, isCompleted } = useLocalProgress();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  /* Edit form state */
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editOrg, setEditOrg] = useState('');
  const [editLevel, setEditLevel] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editPic, setEditPic] = useState('');

  /** Handle profile picture file selection */
  function handlePicChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500000) {
      toast.error('Image must be under 500KB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setEditPic(reader.result);
    reader.readAsDataURL(file);
  }

  if (!user) return null;

  const initials = user.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const completedCount = ALGO_ENTRIES.filter((a) => isCompleted(a.slug)).length;
  const inProgressCount = Object.keys(progress).length - completedCount;
  const categoriesCount = 4;

  /* Recent activity: completed algorithms sorted most-recent-first */
  const recentActivity = useMemo(() => {
    return ALGO_ENTRIES.filter((a) => isCompleted(a.slug)).slice(0, 5);
  }, [progress, isCompleted]);

  /* ── Open edit form ── */
  function openEdit() {
    setEditName(user.name || '');
    setEditRole(user.role || '');
    setEditOrg(user.organization || '');
    setEditLevel(user.experience_level || '');
    setEditBio(user.bio || '');
    setEditPic(user.profile_pic || '');
    setEditing(true);
  }

  /* ── Save profile ── */
  async function handleSave() {
    setSaving(true);
    try {
      const res = await api.put('/api/auth/profile', {
        name: editName,
        role: editRole,
        organization: editOrg,
        experience_level: editLevel,
        bio: editBio,
        profile_pic: editPic,
      });
      /* Update user in AuthContext so UI refreshes immediately */
      if (res.data?.user) {
        updateUser(res.data.user);
      }
      toast.success('Profile updated!');
      setEditing(false);
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  }

  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        backgroundImage:
          'radial-gradient(rgba(108,99,255,0.03) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
      }}
    >
      <Navbar />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px 64px' }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>

          {/* ═══ LEFT SIDEBAR (25%) — Profile Card, sticky ═══ */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            style={{
              ...cardBase,
              padding: '28px 24px',
              width: '25%',
              flexShrink: 0,
              position: 'sticky',
              top: 96,
            }}
          >
            {/* Avatar — centered */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 20 }}>
              <div
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: 20,
                  background: user.profile_pic
                    ? `url(${user.profile_pic}) center/cover no-repeat`
                    : 'linear-gradient(135deg, #6C63FF, #4C46D9)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: "'Syne', sans-serif",
                  fontSize: 32,
                  fontWeight: 700,
                  color: '#fff',
                  boxShadow: '0 4px 20px rgba(108,99,255,0.25)',
                  marginBottom: 16,
                }}
              >
                {!user.profile_pic && initials}
              </div>

              <h1
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: 22,
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  margin: 0,
                  textAlign: 'center',
                }}
              >
                {user.name}
              </h1>
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 12,
                  color: 'var(--text-muted)',
                  marginTop: 4,
                  textAlign: 'center',
                  wordBreak: 'break-all',
                }}
              >
                {user.email}
              </p>
            </div>

            {/* Badges */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 16 }}>
              {user.role && (
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 10, padding: '3px 8px',
                  borderRadius: 6, background: 'rgba(108,99,255,0.12)', color: '#6C63FF', fontWeight: 500,
                }}>{user.role}</span>
              )}
              {user.experience_level && (
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 10, padding: '3px 8px',
                  borderRadius: 6, background: 'var(--bg-surface)', color: 'var(--text-secondary)', fontWeight: 500,
                }}>{user.experience_level}</span>
              )}
            </div>

            {user.organization && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center',
                fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12,
              }}>
                <Building2 size={13} style={{ color: 'var(--text-muted)' }} />
                {user.organization}
              </div>
            )}

            {memberSince && (
              <p style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: 'var(--text-muted)',
                textAlign: 'center', marginBottom: 12,
              }}>
                <Clock size={11} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                Member since {memberSince}
              </p>
            )}

            {user.bio && (
              <p style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'var(--text-secondary)',
                lineHeight: 1.6, textAlign: 'center', marginBottom: 16,
                padding: '10px 12px', borderRadius: 10, background: 'var(--bg-surface)',
                borderLeft: '3px solid rgba(108,99,255,0.3)',
              }}>
                "{user.bio}"
              </p>
            )}

            {/* Divider */}
            <div style={{ height: 1, background: 'var(--border-subtle)', margin: '4px 0 16px' }} />

            {/* Edit Profile button — full width */}
            <button
              onClick={openEdit}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                width: '100%', padding: '10px 16px', borderRadius: 10,
                border: '1px solid var(--border-subtle)', background: 'transparent',
                color: 'var(--text-secondary)', fontFamily: "'DM Sans', sans-serif",
                fontSize: 13, fontWeight: 500, cursor: 'pointer',
                transition: 'border-color 0.2s ease, color 0.2s ease, background 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(108,99,255,0.4)';
                e.currentTarget.style.color = '#6C63FF';
                e.currentTarget.style.background = 'rgba(108,99,255,0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <Pencil size={14} />
              Edit Profile
            </button>
          </motion.div>

          {/* ═══ RIGHT CONTENT (75%) ═══ */}
          <div style={{ flex: 1, minWidth: 0 }}>

        {/* ── Edit Profile Modal ── */}
        <AnimatePresence>
          {editing && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              style={{
                ...cardBase,
                overflow: 'hidden',
              }}
            >
              <div style={{ padding: '24px 28px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 20,
                  }}
                >
                  <h3
                    style={{
                      fontFamily: "'Syne', sans-serif",
                      fontSize: 18,
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      margin: 0,
                    }}
                  >
                    Edit Profile
                  </h3>
                  <button
                    onClick={() => setEditing(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: 4,
                    }}
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Profile Picture Upload */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 16,
                      background: editPic
                        ? `url(${editPic}) center/cover no-repeat`
                        : 'linear-gradient(135deg, #6C63FF, #4C46D9)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      border: '2px dashed var(--border-subtle)',
                      position: 'relative',
                      overflow: 'hidden',
                      flexShrink: 0,
                    }}
                  >
                    {!editPic && (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <Camera size={18} style={{ color: 'rgba(255,255,255,0.7)' }} />
                        <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.5)' }}>Upload</span>
                      </div>
                    )}
                    {editPic && (
                      <div style={{
                        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        opacity: 0, transition: 'opacity 0.2s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                      onMouseLeave={e => e.currentTarget.style.opacity = '0'}
                      >
                        <Camera size={18} style={{ color: '#fff' }} />
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePicChange}
                    style={{ display: 'none' }}
                  />
                  <div>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>
                      Profile Picture
                    </p>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      Click to upload (max 500KB)
                    </p>
                    {editPic && (
                      <button
                        onClick={() => setEditPic('')}
                        style={{
                          marginTop: 4, background: 'none', border: 'none',
                          color: '#FF4D6D', fontSize: 11, cursor: 'pointer',
                          fontFamily: "'DM Sans', sans-serif", padding: 0,
                        }}
                      >
                        Remove photo
                      </button>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 16,
                  }}
                >
                  {/* Name */}
                  <div>
                    <label style={labelStyle}>Name</label>
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      style={inputStyle}
                      placeholder="Your name"
                    />
                  </div>

                  {/* Role */}
                  <div>
                    <label style={labelStyle}>Role</label>
                    <select
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value)}
                      style={selectStyle}
                    >
                      <option value="">Select role...</option>
                      <option value="Student">Student</option>
                      <option value="Teacher">Teacher</option>
                      <option value="Professional">Professional</option>
                      <option value="Self-learner">Self-learner</option>
                    </select>
                  </div>

                  {/* Organization */}
                  <div>
                    <label style={labelStyle}>Organization</label>
                    <input
                      value={editOrg}
                      onChange={(e) => setEditOrg(e.target.value)}
                      style={inputStyle}
                      placeholder="School or company"
                    />
                  </div>

                  {/* Experience Level */}
                  <div>
                    <label style={labelStyle}>Experience Level</label>
                    <select
                      value={editLevel}
                      onChange={(e) => setEditLevel(e.target.value)}
                      style={selectStyle}
                    >
                      <option value="">Select level...</option>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>

                  {/* Bio */}
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Bio</label>
                    <textarea
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value.slice(0, 200))}
                      style={textareaStyle}
                      placeholder="Tell us about yourself..."
                      maxLength={200}
                    />
                    <p
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 10,
                        color: 'var(--text-muted)',
                        textAlign: 'right',
                        marginTop: 4,
                      }}
                    >
                      {editBio.length}/200
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    marginTop: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    width: '100%',
                    height: 44,
                    background: 'linear-gradient(135deg, #6C63FF, #4C46D9)',
                    border: 'none',
                    borderRadius: 10,
                    color: '#fff',
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    opacity: saving ? 0.7 : 1,
                    transition: 'opacity 0.2s ease',
                  }}
                >
                  {saving ? (
                    <>
                      <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── LeetCode-Style Learning Dashboard ── */}
        {(() => {
          const totalAlgos = ALGO_ENTRIES.length;
          const pct = totalAlgos > 0 ? Math.round((completedCount / totalAlgos) * 100) : 0;
          const circumference = 2 * Math.PI * 54;
          const strokeDash = (pct / 100) * circumference;

          const categories = [
            { name: 'Sorting', accent: '#6C63FF', slugs: ['bubble-sort','selection-sort','insertion-sort','merge-sort','quick-sort'] },
            { name: 'Searching', accent: '#00E5CC', slugs: ['linear-search','binary-search'] },
            { name: 'Backtracking', accent: '#FF4D6D', slugs: ['maze-solver','n-queens','knights-tour','sudoku-solver'] },
            { name: 'Graphs', accent: '#A78BFA', slugs: ['graph-bfs'] },
          ];

          return (
            <>
              {/* Top row: Progress Ring + Category Bars */}
              <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}
                style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 20, marginBottom: 24 }}>

                {/* Progress Ring Card */}
                <div style={{ ...cardBase, padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ position: 'relative', width: 128, height: 128, marginBottom: 12 }}>
                    <svg width="128" height="128" viewBox="0 0 128 128" style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx="64" cy="64" r="54" fill="none" stroke="var(--border-subtle)" strokeWidth="8" />
                      <circle cx="64" cy="64" r="54" fill="none" stroke="#6C63FF" strokeWidth="8"
                        strokeDasharray={circumference} strokeDashoffset={circumference - strokeDash}
                        strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 32, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{completedCount}</span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>/ {totalAlgos}</span>
                    </div>
                  </div>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Solved</p>
                  <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#6C63FF', marginTop: 2 }}>{pct}% complete</p>
                </div>

                {/* Category Progress Bars */}
                <div style={{ ...cardBase, padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Category Progress</h3>
                  {categories.map(cat => {
                    const done = cat.slugs.filter(s => isCompleted(s)).length;
                    const total = cat.slugs.length;
                    const catPct = total > 0 ? (done / total) * 100 : 0;
                    return (
                      <div key={cat.name}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{cat.name}</span>
                          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: cat.accent }}>{done}/{total}</span>
                        </div>
                        <div style={{ height: 8, borderRadius: 4, background: 'var(--bg-surface)', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${catPct}%`, borderRadius: 4, background: cat.accent, transition: 'width 0.8s ease', minWidth: catPct > 0 ? 8 : 0 }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Algorithm Checklist by Category */}
              <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}
                style={{ ...cardBase, padding: '24px', marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Algorithm Checklist</h3>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--text-muted)' }}>
                    {completedCount} of {totalAlgos} solved
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
                  {categories.map(cat => (
                    <div key={cat.name}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)' }}>
                        <div style={{ width: 10, height: 10, borderRadius: 3, background: cat.accent }} />
                        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{cat.name}</span>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'var(--text-muted)', marginLeft: 'auto' }}>
                          {cat.slugs.filter(s => isCompleted(s)).length}/{cat.slugs.length}
                        </span>
                      </div>
                      {cat.slugs.map(slug => {
                        const algo = ALGO_ENTRIES.find(a => a.slug === slug);
                        const done = isCompleted(slug);
                        return (
                          <Link key={slug} to={`/visualizer/${slug}`} style={{ textDecoration: 'none', display: 'block' }}>
                            <div style={{
                              display: 'flex', alignItems: 'center', gap: 8, padding: '7px 8px', borderRadius: 8, marginBottom: 2,
                              transition: 'background 0.15s ease', cursor: 'pointer',
                            }}
                              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                              {done ? (
                                <CheckCircle size={15} style={{ color: '#4ADE80', flexShrink: 0 }} />
                              ) : (
                                <Circle size={15} style={{ color: 'var(--border-subtle)', flexShrink: 0 }} />
                              )}
                              <span style={{
                                fontFamily: "'DM Sans', sans-serif", fontSize: 13,
                                color: done ? 'var(--text-primary)' : 'var(--text-secondary)',
                                textDecoration: done ? 'none' : 'none', flex: 1,
                              }}>
                                {algo?.name || slug}
                              </span>
                              {done && (
                                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: '#4ADE80', textTransform: 'uppercase' }}>✓</span>
                              )}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}
                style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                <Link to="/visualizer" style={{ textDecoration: 'none' }}>
                  <div style={{
                    ...cardBase, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16,
                    cursor: 'pointer', transition: 'border-color 0.2s ease, transform 0.2s ease',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(108,99,255,0.3)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(108,99,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6C63FF', flexShrink: 0 }}>
                      <BarChart3 size={20} />
                    </div>
                    <div>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Visualize</p>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>{totalAlgos - completedCount} remaining</p>
                    </div>
                    <ArrowRight size={16} style={{ color: 'var(--text-muted)', marginLeft: 'auto' }} />
                  </div>
                </Link>

                <Link to="/history" style={{ textDecoration: 'none' }}>
                  <div style={{
                    ...cardBase, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16,
                    cursor: 'pointer', transition: 'border-color 0.2s ease, transform 0.2s ease',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,229,204,0.3)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(0,229,204,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00E5CC', flexShrink: 0 }}>
                      <BookOpen size={20} />
                    </div>
                    <div>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Saved</p>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>Notes & bookmarks</p>
                    </div>
                    <ArrowRight size={16} style={{ color: 'var(--text-muted)', marginLeft: 'auto' }} />
                  </div>
                </Link>

                <Link to="/quiz-results" style={{ textDecoration: 'none' }}>
                  <div style={{
                    ...cardBase, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16,
                    cursor: 'pointer', transition: 'border-color 0.2s ease, transform 0.2s ease',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(167,139,250,0.3)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(167,139,250,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A78BFA', flexShrink: 0 }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a8 8 0 0 0-8 8c0 4 3.5 7.5 6 10h4c2.5-2.5 6-6 6-10a8 8 0 0 0-8-8z"/><circle cx="12" cy="10" r="3" fill="currentColor" fillOpacity="0.3"/></svg>
                    </div>
                    <div>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Quizzes</p>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>Test your knowledge</p>
                    </div>
                    <ArrowRight size={16} style={{ color: 'var(--text-muted)', marginLeft: 'auto' }} />
                  </div>
                </Link>
              </motion.div>
            </>
          );
        })()}

          </div>{/* end RIGHT CONTENT */}
        </div>{/* end flex container */}
      </div>

      {/* Spin animation for loader */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
