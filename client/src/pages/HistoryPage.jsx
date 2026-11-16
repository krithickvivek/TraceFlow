/**
 * @file HistoryPage.jsx
 * @description Saved Visualizations page — shows all visualizations the user
 *              has bookmarked, with their notes, algorithm details, and timestamps.
 *              Users can revisit or delete saved items.
 * @module pages/HistoryPage
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, Trash2, ArrowRight, Play, StickyNote, BookOpen, Pencil, Check, X, Gauge, Zap } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import { savedAPI } from '../services/api';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: 'easeOut' },
  }),
};

const CATEGORY_COLORS = {
  Sorting: { bg: 'rgba(108,99,255,0.1)', text: '#6C63FF', border: 'rgba(108,99,255,0.25)' },
  Searching: { bg: 'rgba(0,229,204,0.1)', text: '#00E5CC', border: 'rgba(0,229,204,0.25)' },
  Backtracking: { bg: 'rgba(255,77,109,0.1)', text: '#FF4D6D', border: 'rgba(255,77,109,0.25)' },
  Graph: { bg: 'rgba(167,139,250,0.1)', text: '#A78BFA', border: 'rgba(167,139,250,0.25)' },
};

function formatDate(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Saved Visualizations page.
 * @returns {JSX.Element}
 */
export default function HistoryPage() {
  const navigate = useNavigate();
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editNotes, setEditNotes] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const editRef = useRef(null);

  useEffect(() => {
    savedAPI.getAll()
      .then(data => setSaved(data.saved || []))
      .catch(() => setSaved([]))
      .finally(() => setLoading(false));
  }, []);

  const requestDelete = (id) => {
    setConfirmDeleteId(id);
  };

  const cancelDelete = () => {
    setConfirmDeleteId(null);
  };

  const confirmAndDelete = async () => {
    const id = confirmDeleteId;
    if (!id) return;
    setConfirmDeleteId(null);
    setDeletingId(id);
    try {
      await savedAPI.remove(id);
      setSaved(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditNotes(item.notes || '');
    setTimeout(() => editRef.current?.focus(), 50);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditNotes('');
  };

  const saveEdit = async (id) => {
    setSavingEdit(true);
    try {
      await savedAPI.update(id, { notes: editNotes });
      setSaved(prev => prev.map(s => s.id === id ? { ...s, notes: editNotes } : s));
      setEditingId(null);
    } catch (err) {
      console.error('Update failed:', err);
    } finally {
      setSavingEdit(false);
    }
  };

  function speedLabel(ms) {
    if (!ms) return null;
    if (ms <= 150) return 'Blazing';
    if (ms <= 400) return 'Fast';
    if (ms <= 800) return 'Normal';
    return 'Slow';
  }

  const difficultyColor = {
    Easy: '#00E5CC', Beginner: '#00E5CC',
    Medium: '#F59E0B', Intermediate: '#F59E0B',
    Hard: '#FF4D6D', Advanced: '#FF4D6D',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-primary)',
      }}
    >
      <Navbar />

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px 48px' }}>
        {/* Header */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <Bookmark size={22} style={{ color: '#6C63FF' }} />
            <h1
              style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: 24,
                fontWeight: 700,
                color: 'var(--text-primary)',
                margin: 0,
              }}
            >
              Saved Visualizations
            </h1>
          </div>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              color: 'var(--text-secondary)',
              marginTop: 4,
              marginBottom: 28,
            }}
          >
            Your bookmarked algorithm runs with notes
          </p>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={1}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 14,
            padding: '16px 24px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 24,
          }}
        >
          <div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 700, color: '#6C63FF', lineHeight: 1 }}>
              {saved.length}
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em', marginTop: 2 }}>
              SAVED
            </div>
          </div>
          <div style={{ width: 1, height: 32, background: 'var(--border-subtle)' }} />
          <div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 700, color: '#00E5CC', lineHeight: 1 }}>
              {new Set(saved.map(s => s.category)).size}
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em', marginTop: 2 }}>
              CATEGORIES
            </div>
          </div>
          <div style={{ width: 1, height: 32, background: 'var(--border-subtle)' }} />
          <div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 700, color: '#FFB347', lineHeight: 1 }}>
              {saved.reduce((sum, s) => sum + (s.total_steps || 0), 0).toLocaleString()}
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em', marginTop: 2 }}>
              TOTAL STEPS
            </div>
          </div>
        </motion.div>

        {/* Loading state */}
        {loading && (
          <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
            Loading saved visualizations...
          </div>
        )}

        {/* Saved items list */}
        {!loading && saved.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <AnimatePresence>
              {saved.map((item, i) => {
                const catStyle = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.Sorting;
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                    variants={fadeUp}
                    custom={2 + i * 0.15}
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 14,
                      padding: '18px 20px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 16,
                      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                    }}
                    whileHover={{ borderColor: 'rgba(108,99,255,0.3)' }}
                  >
                    {/* Left: bookmark icon */}
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: catStyle.bg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: 2,
                      }}
                    >
                      <Bookmark size={18} style={{ color: catStyle.text }} />
                    </div>

                    {/* Middle: details */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                        <span
                          style={{
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: 15,
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                          }}
                        >
                          {item.algorithm_name}
                        </span>
                        <span
                          style={{
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: 10,
                            fontWeight: 600,
                            color: catStyle.text,
                            background: catStyle.bg,
                            border: `1px solid ${catStyle.border}`,
                            padding: '2px 8px',
                            borderRadius: 20,
                          }}
                        >
                          {item.category}
                        </span>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'var(--text-muted)' }}>
                          <Zap size={9} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 2 }} />
                          {item.total_steps} steps
                        </span>
                        {item.difficulty && (
                          <span style={{
                            fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 600,
                            color: difficultyColor[item.difficulty] || 'var(--text-muted)',
                            background: `${difficultyColor[item.difficulty] || 'var(--text-muted)'}15`,
                            padding: '2px 8px', borderRadius: 20,
                          }}>
                            {item.difficulty}
                          </span>
                        )}
                        {item.speed_ms > 0 && (
                          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'var(--text-muted)' }}>
                            <Gauge size={9} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 2 }} />
                            {speedLabel(item.speed_ms)} ({item.speed_ms}ms)
                          </span>
                        )}
                        <span style={{
                          fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'var(--text-muted)', marginLeft: 'auto',
                        }}>
                          {formatDate(item.saved_at)}
                        </span>
                      </div>

                      {/* Notes — view or edit mode */}
                      {editingId === item.id ? (
                        <div style={{ marginBottom: 4 }}>
                          <textarea
                            ref={editRef}
                            value={editNotes}
                            onChange={e => setEditNotes(e.target.value.slice(0, 500))}
                            rows={3}
                            style={{
                              width: '100%', padding: '8px 10px', borderRadius: 8, resize: 'none',
                              background: 'var(--bg-primary)', border: '1px solid rgba(108,99,255,0.3)',
                              color: 'var(--text-primary)', fontFamily: "'DM Sans', sans-serif", fontSize: 13,
                              lineHeight: 1.5, outline: 'none',
                            }}
                            placeholder="Add your notes..."
                          />
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
                            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'var(--text-muted)' }}>
                              {editNotes.length}/500
                            </span>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button onClick={cancelEdit} style={{
                                display: 'flex', alignItems: 'center', gap: 3, padding: '4px 10px', borderRadius: 6,
                                background: 'transparent', border: '1px solid var(--border-subtle)',
                                color: 'var(--text-muted)', fontSize: 11, fontWeight: 500, cursor: 'pointer',
                              }}>
                                <X size={10} /> Cancel
                              </button>
                              <button onClick={() => saveEdit(item.id)} disabled={savingEdit} style={{
                                display: 'flex', alignItems: 'center', gap: 3, padding: '4px 10px', borderRadius: 6,
                                background: 'rgba(108,99,255,0.15)', border: '1px solid rgba(108,99,255,0.3)',
                                color: '#6C63FF', fontSize: 11, fontWeight: 600, cursor: savingEdit ? 'not-allowed' : 'pointer',
                                opacity: savingEdit ? 0.6 : 1,
                              }}>
                                <Check size={10} /> Save
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        item.notes ? (
                          <div style={{
                            display: 'flex', alignItems: 'flex-start', gap: 6,
                            padding: '8px 10px', borderRadius: 8,
                            background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', marginBottom: 4,
                          }}>
                            <StickyNote size={12} style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: 2 }} />
                            <p style={{
                              fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'var(--text-secondary)',
                              margin: 0, lineHeight: 1.5, whiteSpace: 'pre-wrap', flex: 1,
                            }}>
                              {item.notes}
                            </p>
                          </div>
                        ) : (
                          <div style={{
                            padding: '6px 10px', borderRadius: 8, marginBottom: 4,
                            border: '1px dashed var(--border-subtle)', cursor: 'pointer',
                          }} onClick={() => startEdit(item)}>
                            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                              + Add notes...
                            </span>
                          </div>
                        )
                      )}
                    </div>

                    {/* Right: actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                      <button
                        onClick={() => navigate(`/visualizer/${item.algorithm_slug}`, { state: { fromHistory: true, inputData: item.input_data } })}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 8,
                          background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.2)',
                          color: '#6C63FF', fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600,
                          cursor: 'pointer', transition: 'background 0.2s ease', whiteSpace: 'nowrap',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(108,99,255,0.2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(108,99,255,0.1)'}
                      >
                        <Play size={11} /> Revisit
                      </button>
                      <button
                        onClick={() => startEdit(item)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 8,
                          background: 'rgba(0,229,204,0.08)', border: '1px solid rgba(0,229,204,0.2)',
                          color: '#00E5CC', fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600,
                          cursor: 'pointer', transition: 'background 0.2s ease', whiteSpace: 'nowrap',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,229,204,0.15)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,229,204,0.08)'}
                      >
                        <Pencil size={11} /> Edit
                      </button>
                      <button
                        onClick={() => requestDelete(item.id)}
                        disabled={deletingId === item.id}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 8,
                          background: 'transparent', border: '1px solid var(--border-subtle)',
                          color: 'var(--text-muted)', fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 500,
                          cursor: deletingId === item.id ? 'not-allowed' : 'pointer',
                          transition: 'color 0.2s ease, border-color 0.2s ease', opacity: deletingId === item.id ? 0.5 : 1,
                        }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
                      >
                        <Trash2 size={11} /> Delete
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Empty state */}
        {!loading && saved.length === 0 && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={2}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 14,
              padding: '56px 24px',
              textAlign: 'center',
            }}
          >
            <BookOpen size={40} style={{ color: 'var(--text-muted)', marginBottom: 16 }} />
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 15,
                color: 'var(--text-secondary)',
                margin: 0,
                marginBottom: 8,
              }}
            >
              No saved visualizations yet
            </p>
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                color: 'var(--text-muted)',
                margin: 0,
                marginBottom: 20,
              }}
            >
              Run an algorithm to completion, then click the Save button to bookmark it with notes.
            </p>
            <button
              onClick={() => navigate('/visualizer')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '10px 20px',
                borderRadius: 10,
                background: 'linear-gradient(135deg, #6C63FF 0%, #4C46D9 100%)',
                border: 'none',
                color: 'white',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(108,99,255,0.3)',
              }}
            >
              Start Visualizing
              <ArrowRight size={14} />
            </button>
          </motion.div>
        )}
      </div>

      {/* ── Delete Confirmation Modal ── */}
      <AnimatePresence>
        {confirmDeleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={cancelDelete}
            style={{
              position: 'fixed', inset: 0, zIndex: 50,
              background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              onClick={e => e.stopPropagation()}
              style={{
                maxWidth: 380, width: '90%',
                background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
                borderRadius: 16, padding: 24, textAlign: 'center',
              }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 12, margin: '0 auto 16px',
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Trash2 size={22} style={{ color: '#EF4444' }} />
              </div>
              <h3 style={{
                fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 700,
                color: 'var(--text-primary)', margin: '0 0 8px',
              }}>Delete Visualization?</h3>
              <p style={{
                fontFamily: 'DM Sans, sans-serif', fontSize: 14,
                color: 'var(--text-secondary)', margin: '0 0 24px', lineHeight: 1.5,
              }}>
                This will permanently remove this saved visualization and its notes. This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button
                  onClick={cancelDelete}
                  style={{
                    padding: '10px 20px', borderRadius: 8,
                    background: 'transparent', border: '1px solid var(--border-subtle)',
                    color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif',
                    fontSize: 14, fontWeight: 500, cursor: 'pointer',
                    transition: 'border-color 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--text-muted)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAndDelete}
                  style={{
                    padding: '10px 20px', borderRadius: 8,
                    background: '#EF4444', border: 'none',
                    color: 'white', fontFamily: 'DM Sans, sans-serif',
                    fontSize: 14, fontWeight: 600, cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(239,68,68,0.3)',
                    transition: 'background 0.2s, transform 0.1s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#DC2626'}
                  onMouseLeave={e => e.currentTarget.style.background = '#EF4444'}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
