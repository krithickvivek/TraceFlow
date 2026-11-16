/**
 * @file QuizResultsPage.jsx
 * @description Quizzes dashboard — shows stats, per-algorithm best scores,
 *              and a history list with expandable review panels.
 * @module pages/QuizResultsPage
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Trophy, Target, Clock, ArrowRight, RotateCcw,
  CheckCircle, XCircle, ChevronDown, ChevronUp, Eye, Trash2,
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import { quizAPI } from '../services/api';
import { QUIZ_DATA } from '../data/quizData';
import { useAuth } from '../context/AuthContext';

const LABELS = ['A', 'B', 'C', 'D'];

const cardBase = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 14,
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: 'easeOut' },
  }),
};

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now - d;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatSlug(slug) {
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function scoreBadge(score, total) {
  if (total === 0) return { bg: 'rgba(156,163,175,0.15)', text: '#9CA3AF' };
  const pct = (score / total) * 100;
  if (pct === 100) return { bg: 'rgba(74,222,128,0.15)', text: '#4ADE80' };
  if (pct > 60) return { bg: 'rgba(251,191,36,0.15)', text: '#FBBF24' };
  return { bg: 'rgba(255,77,109,0.15)', text: '#FF4D6D' };
}

function parseAnswers(answers) {
  if (!answers) return [];
  if (Array.isArray(answers)) return answers;
  try { const p = JSON.parse(answers); return Array.isArray(p) ? p : []; } catch { return []; }
}

export default function QuizResultsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [scores, setScores] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewSlug, setReviewSlug] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null); // null | { type: 'single', slug, name } | { type: 'all' }
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate('/login', { replace: true });
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      try {
        const [scoresRes, statsRes] = await Promise.all([quizAPI.getAll(), quizAPI.getStats()]);
        setScores(scoresRes.scores || scoresRes || []);
        setStats(statsRes);
      } catch { setScores([]); setStats(null); }
      finally { setLoading(false); }
    })();
  }, [user]);

  const refreshStats = async () => {
    try { const s = await quizAPI.getStats(); setStats(s); } catch { /* ignore */ }
  };

  const handleDeleteSingle = async (slug) => {
    setDeleting(true);
    try {
      await quizAPI.deleteBySlug(slug);
      setScores(prev => (Array.isArray(prev) ? prev : []).filter(s => s.algorithm_slug !== slug));
      if (reviewSlug === slug) setReviewSlug(null);
      await refreshStats();
    } catch (e) { console.error('Delete failed:', e); }
    finally { setDeleting(false); setConfirmDelete(null); }
  };

  const handleDeleteAll = async () => {
    setDeleting(true);
    try {
      await quizAPI.deleteAll();
      setScores([]);
      setStats(null);
      setReviewSlug(null);
    } catch (e) { console.error('Delete all failed:', e); }
    finally { setDeleting(false); setConfirmDelete(null); }
  };

  /* Group by algorithm */
  const grouped = {};
  (Array.isArray(scores) ? scores : []).forEach(s => {
    const slug = s.algorithm_slug || 'unknown';
    if (!grouped[slug]) grouped[slug] = { slug, name: s.algorithm_name || formatSlug(slug), attempts: [], best: 0, total: 0 };
    const sc = s.score ?? 0;
    const tot = s.total ?? 0;
    grouped[slug].attempts.push(s);
    if (tot > 0 && (grouped[slug].total === 0 || sc / tot > grouped[slug].best / grouped[slug].total)) {
      grouped[slug].best = sc;
      grouped[slug].total = tot;
    }
  });

  const algoList = Object.values(grouped).sort((a, b) => {
    const aD = a.attempts[0]?.taken_at || '';
    const bD = b.attempts[0]?.taken_at || '';
    return new Date(bD) - new Date(aD);
  });

  const totalQuizzes = stats?.totalAttempts ?? algoList.reduce((s, a) => s + a.attempts.length, 0);
  const perfectScores = stats?.perfectScores ?? algoList.filter(a => a.total > 0 && a.best === a.total).length;
  const avgScore = algoList.length > 0
    ? Math.round(algoList.filter(a => a.total > 0).reduce((s, a) => s + (a.best / a.total) * 100, 0) / (algoList.filter(a => a.total > 0).length || 1))
    : 0;

  /* Review data for the expanded slug */
  const reviewAlgo = reviewSlug ? grouped[reviewSlug] : null;
  const reviewAttempt = reviewAlgo?.attempts?.[0]; // most recent
  const reviewAnswers = reviewAttempt ? parseAnswers(reviewAttempt.answers) : [];
  const reviewQuestions = reviewSlug ? (QUIZ_DATA[reviewSlug] || []) : [];

  if (authLoading || (!user && !authLoading)) return null;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
      <div style={{ flexShrink: 0 }}><Navbar /></div>

      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '20px 32px 20px' }}>
        <div style={{ maxWidth: 1400, width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>

          {/* Header + inline stats */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}
            style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 16, flexShrink: 0 }}>
            <div style={{ flex: '0 0 auto' }}>
              <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Quizzes
              </h1>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                Track your algorithm knowledge
              </p>
            </div>
            <div style={{ flex: 1 }} />
            <div style={{ display: 'flex', gap: 10 }}>
              {[
                { icon: Brain, value: loading ? '--' : totalQuizzes, label: 'Taken', color: '#6C63FF' },
                { icon: Trophy, value: loading ? '--' : perfectScores, label: 'Perfect', color: '#4ADE80' },
                { icon: Target, value: loading ? '--' : `${avgScore}%`, label: 'Avg Score', color: '#FBBF24' },
              ].map((s, i) => (
                <div key={i} style={{ ...cardBase, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: `${s.color}1A`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <s.icon size={15} style={{ color: s.color }} />
                  </div>
                  <div>
                    <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0, lineHeight: 1 }}>{s.value}</p>
                    <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: 'var(--text-muted)', marginTop: 1 }}>{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Two-column: History list (left) + Review panel (right) */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}
            style={{ display: 'flex', gap: 20, flex: 1, minHeight: 0 }}>

            {/* LEFT: Quiz History */}
            <div style={{ flex: '0 0 380px', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <div style={{ ...cardBase, padding: '16px', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, paddingLeft: 4, paddingRight: 4, flexShrink: 0 }}>
                  <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    Quiz History
                  </h3>
                  {algoList.length > 0 && (
                    <button
                      onClick={() => setConfirmDelete({ type: 'all' })}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px',
                        borderRadius: 6, border: '1px solid transparent', background: 'transparent',
                        color: 'var(--text-muted)', fontFamily: "'DM Sans', sans-serif",
                        fontSize: 10, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'transparent'; }}
                    >
                      <Trash2 size={10} /> Clear All
                    </button>
                  )}
                </div>

                {loading ? (
                  <div style={{ padding: '32px 0', textAlign: 'center' }}>
                    <div style={{ width: 24, height: 24, border: '2px solid var(--border-subtle)', borderTopColor: '#6C63FF', borderRadius: '50%', margin: '0 auto', animation: 'spin 0.8s linear infinite' }} />
                  </div>
                ) : algoList.length === 0 ? (
                  <div style={{ padding: '32px 16px', textAlign: 'center' }}>
                    <Brain size={28} style={{ color: 'var(--text-muted)', marginBottom: 8 }} />
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'var(--text-muted)', margin: '0 0 16px' }}>
                      No quizzes taken yet
                    </p>
                    <button onClick={() => navigate('/visualizer')} style={{
                      padding: '8px 16px', borderRadius: 8, border: 'none',
                      background: 'linear-gradient(135deg, #6C63FF, #4C46D9)', color: '#fff',
                      fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    }}>
                      Start Visualizing <ArrowRight size={12} style={{ verticalAlign: 'middle', marginLeft: 4 }} />
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, overflowY: 'auto' }}>
                    {algoList.map(algo => {
                      const badge = scoreBadge(algo.best, algo.total);
                      const isActive = reviewSlug === algo.slug;
                      return (
                        <div key={algo.slug}
                          onClick={() => setReviewSlug(isActive ? null : algo.slug)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                            borderRadius: 10, cursor: 'pointer',
                            background: isActive ? 'rgba(108,99,255,0.08)' : 'transparent',
                            border: isActive ? '1px solid rgba(108,99,255,0.2)' : '1px solid transparent',
                            transition: 'background 0.15s, border-color 0.15s',
                          }}
                          onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--bg-surface)'; }}
                          onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                        >
                          {/* Name + meta */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {algo.name}
                            </p>
                            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'var(--text-muted)', margin: '2px 0 0' }}>
                              {algo.attempts.length} attempt{algo.attempts.length !== 1 ? 's' : ''} · {formatDate(algo.attempts[0]?.taken_at)}
                            </p>
                          </div>

                          {/* Score badge */}
                          <span style={{
                            padding: '3px 10px', borderRadius: 8, flexShrink: 0,
                            background: badge.bg, fontFamily: "'JetBrains Mono', monospace",
                            fontSize: 12, fontWeight: 700, color: badge.text,
                          }}>
                            {algo.best}/{algo.total}
                          </span>

                          {/* Review indicator */}
                          <Eye size={14} style={{ color: isActive ? '#6C63FF' : 'var(--text-muted)', flexShrink: 0, opacity: isActive ? 1 : 0.4 }} />

                          {/* Delete single */}
                          <button
                            onClick={(e) => { e.stopPropagation(); setConfirmDelete({ type: 'single', slug: algo.slug, name: algo.name }); }}
                            style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              width: 24, height: 24, borderRadius: 6, border: 'none',
                              background: 'transparent', color: 'var(--text-muted)',
                              cursor: 'pointer', transition: 'color 0.15s, background 0.15s', flexShrink: 0, padding: 0,
                            }}
                            onMouseEnter={e => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
                            title={`Delete ${algo.name} quiz history`}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Retake button for selected quiz */}
              {reviewSlug && (
                <button onClick={() => navigate(`/quiz/${reviewSlug}`)} style={{
                  width: '100%', marginTop: 10, padding: '10px 16px', borderRadius: 10,
                  border: 'none', background: 'linear-gradient(135deg, #6C63FF, #4C46D9)',
                  color: '#fff', fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  boxShadow: '0 4px 12px rgba(108,99,255,0.25)', transition: 'transform 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <RotateCcw size={14} /> Retake {reviewAlgo?.name}
                </button>
              )}
            </div>

            {/* RIGHT: Review Panel */}
            <div style={{ flex: 1, minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
              <AnimatePresence mode="wait">
                {reviewSlug && reviewAnswers.length > 0 ? (
                  <motion.div
                    key={reviewSlug}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.25 }}
                    style={{ ...cardBase, padding: '24px', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}
                  >
                    {/* Review header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexShrink: 0 }}>
                      <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                        Review: {reviewAlgo?.name}
                      </h3>
                      <span style={{
                        padding: '4px 12px', borderRadius: 8,
                        background: scoreBadge(reviewAttempt?.score ?? 0, reviewAttempt?.total ?? 0).bg,
                        fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 700,
                        color: scoreBadge(reviewAttempt?.score ?? 0, reviewAttempt?.total ?? 0).text,
                      }}>
                        {reviewAttempt?.score ?? 0}/{reviewAttempt?.total ?? 0}
                      </span>
                    </div>

                    {/* Scrollable answer list */}
                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, paddingRight: 4 }}>
                      {reviewAnswers.map((ans, idx) => {
                        const isCorrect = ans.isCorrect;
                        const q = reviewQuestions[idx];
                        const questionText = q?.question || `Question ${idx + 1}`;
                        const selectedText = q ? `${LABELS[ans.selected]}. ${q.options[ans.selected]}` : `Option ${ans.selected}`;
                        const correctText = q ? `${LABELS[ans.correct]}. ${q.options[ans.correct]}` : `Option ${ans.correct}`;

                        return (
                          <div key={idx} style={{
                            padding: '12px 14px', borderRadius: 10, flexShrink: 0,
                            background: isCorrect ? 'rgba(74,222,128,0.04)' : 'rgba(255,77,109,0.04)',
                            border: `1px solid ${isCorrect ? 'rgba(74,222,128,0.2)' : 'rgba(255,77,109,0.2)'}`,
                          }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
                              <span style={{
                                width: 20, height: 20, borderRadius: 5, flexShrink: 0, marginTop: 1,
                                background: isCorrect ? 'rgba(74,222,128,0.15)' : 'rgba(255,77,109,0.15)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}>
                                {isCorrect
                                  ? <CheckCircle size={12} style={{ color: '#4ADE80' }} />
                                  : <XCircle size={12} style={{ color: '#FF4D6D' }} />}
                              </span>
                              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: 0, lineHeight: 1.4 }}>
                                {questionText}
                              </p>
                            </div>
                            <div style={{ marginLeft: 28 }}>
                              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 2px' }}>
                                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'var(--text-muted)' }}>You: </span>
                                <span style={{ color: isCorrect ? '#4ADE80' : '#FF4D6D', fontWeight: 600 }}>{selectedText}</span>
                              </p>
                              {!isCorrect && (
                                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>
                                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'var(--text-muted)' }}>Ans: </span>
                                  <span style={{ color: '#4ADE80', fontWeight: 600 }}>{correctText}</span>
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                      ...cardBase, padding: '64px 32px', textAlign: 'center',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      flex: 1,
                    }}
                  >
                    <Eye size={32} style={{ color: 'var(--text-muted)', marginBottom: 12, opacity: 0.4 }} />
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>
                      {algoList.length > 0
                        ? 'Select a quiz from the history to review your answers'
                        : 'Complete a visualization and take a quiz to see results here'}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {/* ── Delete Confirmation Modal ── */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => !deleting && setConfirmDelete(null)}
            style={{
              position: 'fixed', inset: 0, zIndex: 100,
              background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              onClick={e => e.stopPropagation()}
              style={{
                maxWidth: 400, width: '90%',
                background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
                borderRadius: 16, padding: 28, textAlign: 'center',
              }}
            >
              {/* Icon */}
              <div style={{
                width: 52, height: 52, borderRadius: 14, margin: '0 auto 16px',
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Trash2 size={24} style={{ color: '#EF4444' }} />
              </div>

              <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>
                {confirmDelete.type === 'all' ? 'Clear All Quiz History?' : `Delete ${confirmDelete.name} Quiz?`}
              </h3>

              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: 'var(--text-secondary)', margin: '0 0 24px', lineHeight: 1.5 }}>
                {confirmDelete.type === 'all'
                  ? 'This will permanently delete all your quiz scores and history. This cannot be undone.'
                  : `This will permanently delete all quiz attempts for ${confirmDelete.name}. This cannot be undone.`}
              </p>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button
                  onClick={() => setConfirmDelete(null)}
                  disabled={deleting}
                  style={{
                    padding: '10px 24px', borderRadius: 10,
                    background: 'transparent', border: '1px solid var(--border-subtle)',
                    color: 'var(--text-secondary)', fontFamily: "'DM Sans', sans-serif",
                    fontSize: 14, fontWeight: 500, cursor: 'pointer',
                    transition: 'border-color 0.2s', opacity: deleting ? 0.5 : 1,
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--text-muted)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                >
                  Cancel
                </button>
                <button
                  onClick={() => confirmDelete.type === 'all' ? handleDeleteAll() : handleDeleteSingle(confirmDelete.slug)}
                  disabled={deleting}
                  style={{
                    padding: '10px 24px', borderRadius: 10,
                    background: '#EF4444', border: 'none',
                    color: 'white', fontFamily: "'DM Sans', sans-serif",
                    fontSize: 14, fontWeight: 600, cursor: deleting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 12px rgba(239,68,68,0.3)',
                    transition: 'background 0.2s, transform 0.1s',
                    opacity: deleting ? 0.7 : 1,
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                  onMouseEnter={e => { if (!deleting) e.currentTarget.style.background = '#DC2626'; }}
                  onMouseLeave={e => { if (!deleting) e.currentTarget.style.background = '#EF4444'; }}
                >
                  {deleting && (
                    <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  )}
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
