/**
 * @file QuizPage.jsx
 * @description Quiz page for the TraceFlow DSA learning platform.
 *              Taken after visualizing an algorithm. Shows a start screen,
 *              one-at-a-time questions with instant feedback, and a results
 *              screen with score + review.
 * @module pages/QuizPage
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import { quizAPI } from '../services/api';
import { QUIZ_DATA } from '../data/quizData';
import { useAuth } from '../context/AuthContext';

/* ── Option labels ── */
const LABELS = ['A', 'B', 'C', 'D'];

/* ── Shared card base ── */
const cardBase = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 16,
};

/* ── Animation variants ── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
  exit: { opacity: 0, y: -16, transition: { duration: 0.25 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.07 } },
};

const optionVariant = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

/**
 * Format a slug into a readable algorithm name.
 * e.g. "bubble-sort" -> "Bubble Sort"
 */
function formatSlug(slug) {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/**
 * Get performance message based on score percentage.
 */
function getPerformanceMessage(score, total) {
  const pct = (score / total) * 100;
  if (pct === 100) return { text: 'Perfect Score! You truly mastered this algorithm.', color: '#4ADE80' };
  if (pct >= 80) return { text: 'Excellent! You have a strong understanding.', color: '#4ADE80' };
  if (pct >= 60) return { text: 'Good job! A few concepts to review.', color: '#FBBF24' };
  if (pct >= 40) return { text: 'Not bad, but there\'s room for improvement.', color: '#FB923C' };
  return { text: 'Keep studying! Review the algorithm visualization and try again.', color: '#FF4D6D' };
}

/**
 * Quiz page — route: /quiz/:algorithmSlug
 */
export default function QuizPage() {
  const { algorithmSlug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();

  /* Quiz state */
  const [phase, setPhase] = useState('start'); // 'start' | 'quiz' | 'results'
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answers, setAnswers] = useState([]); // { questionId, selected, correct, isCorrect }
  const [scoreSaved, setScoreSaved] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);

  /* Derive data */
  const algorithmName = location.state?.algorithmName || formatSlug(algorithmSlug);
  const questions = QUIZ_DATA[algorithmSlug] || [];
  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex] || null;
  const score = answers.filter((a) => a.isCorrect).length;

  /* ── Auth guard ── */
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isLoading, isAuthenticated, navigate]);

  /* ── Timer ── */
  useEffect(() => {
    if (phase !== 'quiz' || !startTime) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, startTime]);

  /* ── Save score on results ── */
  useEffect(() => {
    if (phase === 'results' && !scoreSaved && isAuthenticated) {
      setScoreSaved(true);
      quizAPI
        .saveScore({
          algorithm_slug: algorithmSlug,
          algorithm_name: algorithmName,
          score,
          total: totalQuestions,
          answers: answers.map((a) => ({
            questionId: a.questionId,
            selected: a.selected,
            correct: a.correct,
            isCorrect: a.isCorrect,
          })),
        })
        .catch(() => {
          /* Silent fail — quiz still shows results */
        });
    }
  }, [phase, scoreSaved, isAuthenticated, algorithmSlug, score, totalQuestions, elapsed, answers]);

  /* ── Handlers ── */
  const handleBeginQuiz = useCallback(() => {
    setPhase('quiz');
    setCurrentIndex(0);
    setSelectedOption(null);
    setAnswers([]);
    setScoreSaved(false);
    setStartTime(Date.now());
    setElapsed(0);
  }, []);

  const handleSelectOption = useCallback(
    (optionIndex) => {
      if (selectedOption !== null) return; // already answered
      setSelectedOption(optionIndex);
      setAnswers((prev) => [
        ...prev,
        {
          questionId: currentQuestion.id,
          selected: optionIndex,
          correct: currentQuestion.correct,
          isCorrect: optionIndex === currentQuestion.correct,
        },
      ]);
    },
    [selectedOption, currentQuestion]
  );

  const handleNext = useCallback(() => {
    if (currentIndex + 1 >= totalQuestions) {
      setPhase('results');
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
    }
  }, [currentIndex, totalQuestions]);

  const handleRetake = useCallback(() => {
    handleBeginQuiz();
  }, [handleBeginQuiz]);

  const handleBackToVisualizer = useCallback(() => {
    navigate(`/visualizer/${algorithmSlug}`);
  }, [navigate, algorithmSlug]);

  /* Format elapsed time */
  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  /* ── Loading / auth check ── */
  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: 'var(--text-muted)' }}>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  /* ── No quiz available ── */
  if (totalQuestions === 0) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'var(--bg-primary)',
          backgroundImage: 'radial-gradient(rgba(108,99,255,0.03) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      >
        <Navbar />
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <Brain size={56} style={{ color: 'var(--text-muted)', marginBottom: 20 }} />
            <h2
              style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: 24,
                fontWeight: 700,
                color: 'var(--text-primary)',
                margin: '0 0 12px',
              }}
            >
              No Quiz Available
            </h2>
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 15,
                color: 'var(--text-muted)',
                margin: '0 0 28px',
                lineHeight: 1.6,
              }}
            >
              There is no quiz data available for <strong style={{ color: 'var(--text-secondary)' }}>{algorithmName}</strong> yet.
              Check back soon!
            </p>
            <button
              onClick={() => navigate(`/visualizer/${algorithmSlug}`)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 24px',
                borderRadius: 12,
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'border-color 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
            >
              <ArrowLeft size={16} />
              Back to Visualizer
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  /* ── Progress bar width ── */
  const progressPct = phase === 'quiz' ? ((currentIndex + (selectedOption !== null ? 1 : 0)) / totalQuestions) * 100 : 0;

  /* ── Score ring for results ── */
  const scorePct = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;
  const circumference = 2 * Math.PI * 58;
  const strokeDash = (scorePct / 100) * circumference;
  const perfMsg = getPerformanceMessage(score, totalQuestions);

  return (
    <div
      style={{
        height: '100vh',
        overflow: (phase === 'quiz' || phase === 'results') ? 'hidden' : 'auto',
        background: 'var(--bg-primary)',
        backgroundImage: 'radial-gradient(rgba(108,99,255,0.03) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ flexShrink: 0 }}>
        <Navbar />
      </div>

      {/* ── Progress Bar (quiz phase only) ── */}
      {phase === 'quiz' && (
        <div style={{ flexShrink: 0, width: '100%', height: 4, background: 'var(--border-subtle)' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={{ height: '100%', background: 'linear-gradient(90deg, var(--accent-primary), #A78BFA)', borderRadius: '0 2px 2px 0' }}
          />
        </div>
      )}

      <div style={{
        flex: (phase === 'quiz' || phase === 'results') ? 1 : undefined,
        minHeight: (phase === 'quiz' || phase === 'results') ? 0 : undefined,
        overflow: (phase === 'quiz' || phase === 'results') ? 'hidden' : 'auto',
        maxWidth: (phase === 'quiz' || phase === 'results') ? 1200 : 720,
        width: '100%',
        margin: '0 auto',
        padding: (phase === 'quiz' || phase === 'results') ? '8px 24px 8px' : '40px 24px 64px',
        display: (phase === 'quiz' || phase === 'results') ? 'flex' : 'block',
        flexDirection: 'column',
      }}>
        <AnimatePresence mode="wait">
          {/* ══════════════════════════════════════════
              START SCREEN
             ══════════════════════════════════════════ */}
          {phase === 'start' && (
            <motion.div
              key="start"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={fadeUp}
              style={{ textAlign: 'center', paddingTop: 40 }}
            >
              {/* Back link */}
              <button
                onClick={handleBackToVisualizer}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 16px',
                  borderRadius: 10,
                  border: '1px solid var(--border-subtle)',
                  background: 'transparent',
                  color: 'var(--text-muted)',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 13,
                  cursor: 'pointer',
                  marginBottom: 40,
                  transition: 'border-color 0.2s, color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-primary)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.color = 'var(--text-muted)';
                }}
              >
                <ArrowLeft size={14} />
                Back to Visualizer
              </button>

              {/* Brain icon */}
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 20,
                  background: 'linear-gradient(135deg, rgba(108,99,255,0.15), rgba(167,139,250,0.15))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                }}
              >
                <Brain size={36} style={{ color: 'var(--accent-primary)' }} />
              </div>

              <h1
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: 32,
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  margin: '0 0 8px',
                }}
              >
                Test Your Knowledge
              </h1>

              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 16,
                  color: 'var(--text-secondary)',
                  margin: '0 0 24px',
                }}
              >
                {algorithmName}
              </p>

              {/* Question count badge */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 16px',
                  borderRadius: 20,
                  background: 'rgba(108,99,255,0.1)',
                  marginBottom: 36,
                }}
              >
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--accent-primary)',
                  }}
                >
                  {totalQuestions} question{totalQuestions !== 1 ? 's' : ''}
                </span>
              </div>

              <br />

              {/* Begin Quiz button */}
              <button
                onClick={handleBeginQuiz}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '14px 36px',
                  borderRadius: 14,
                  border: 'none',
                  background: 'linear-gradient(135deg, #6C63FF, #4C46D9)',
                  color: '#fff',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(108,99,255,0.3)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
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
                Begin Quiz
                <ChevronRight size={18} />
              </button>
            </motion.div>
          )}

          {/* ══════════════════════════════════════════
              QUIZ SCREEN
             ══════════════════════════════════════════ */}
          {phase === 'quiz' && currentQuestion && (
            <motion.div
              key={`q-${currentIndex}`}
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={fadeUp}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0, minHeight: 0, overflow: 'hidden' }}
            >
              {/* Header: question counter + timer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexShrink: 0 }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: 'var(--text-muted)' }}>
                  Question {currentIndex + 1} of {totalQuestions}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: 'var(--text-muted)' }}>
                  <Clock size={14} />
                  {formatTime(elapsed)}
                </span>
              </div>

              {/* Two-column layout: Left = question+options, Right = explanation+next */}
              <div style={{ display: 'flex', gap: 20, flex: 1, minHeight: 0 }}>
                {/* LEFT COLUMN: Question + Options */}
                <div style={{ flex: '1 1 55%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                  {/* Question card */}
                  <div style={{ ...cardBase, padding: '20px 24px', marginBottom: 12, flexShrink: 0 }}>
                    <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0, lineHeight: 1.5 }}>
                      {currentQuestion.question}
                    </h2>
                  </div>

                  {/* Options */}
                  <motion.div variants={stagger} initial="hidden" animate="visible" style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                    {currentQuestion.options.map((option, idx) => {
                      const isSelected = selectedOption === idx;
                      const isCorrectOption = idx === currentQuestion.correct;
                      const hasAnswered = selectedOption !== null;

                      let optBg = 'var(--bg-card)';
                      let optBorder = '1px solid var(--border-subtle)';
                      let optColor = 'var(--text-primary)';
                      let labelBg = 'rgba(108,99,255,0.08)';
                      let labelColor = 'var(--text-muted)';
                      let iconEl = null;

                      if (hasAnswered) {
                        if (isSelected && isCorrectOption) {
                          optBg = 'rgba(74, 222, 128, 0.08)';
                          optBorder = '1px solid rgba(74, 222, 128, 0.5)';
                          labelBg = 'rgba(74, 222, 128, 0.15)';
                          labelColor = '#4ADE80';
                          iconEl = <CheckCircle size={18} style={{ color: '#4ADE80', flexShrink: 0 }} />;
                        } else if (isSelected && !isCorrectOption) {
                          optBg = 'rgba(255, 77, 109, 0.08)';
                          optBorder = '1px solid rgba(255, 77, 109, 0.5)';
                          labelBg = 'rgba(255, 77, 109, 0.15)';
                          labelColor = '#FF4D6D';
                          iconEl = <XCircle size={18} style={{ color: '#FF4D6D', flexShrink: 0 }} />;
                        } else if (!isSelected && isCorrectOption) {
                          optBg = 'rgba(74, 222, 128, 0.06)';
                          optBorder = '1px dashed rgba(74, 222, 128, 0.5)';
                          labelBg = 'rgba(74, 222, 128, 0.12)';
                          labelColor = '#4ADE80';
                          iconEl = <CheckCircle size={18} style={{ color: '#4ADE80', flexShrink: 0, opacity: 0.7 }} />;
                        } else {
                          optColor = 'var(--text-muted)';
                        }
                      }

                      return (
                        <motion.button
                          key={idx}
                          variants={optionVariant}
                          onClick={() => handleSelectOption(idx)}
                          disabled={hasAnswered}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            padding: '12px 16px', borderRadius: 12,
                            background: optBg, border: optBorder, color: optColor,
                            fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500,
                            textAlign: 'left', cursor: hasAnswered ? 'default' : 'pointer',
                            transition: 'border-color 0.2s, background 0.2s, transform 0.15s',
                            width: '100%', outline: 'none',
                          }}
                          onMouseEnter={(e) => { if (!hasAnswered) { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.transform = 'translateX(4px)'; } }}
                          onMouseLeave={(e) => { if (!hasAnswered) { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.transform = 'translateX(0)'; } }}
                        >
                          <span style={{ width: 28, height: 28, borderRadius: 7, background: labelBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 700, color: labelColor, flexShrink: 0 }}>
                            {LABELS[idx]}
                          </span>
                          <span style={{ flex: 1, lineHeight: 1.4 }}>{option}</span>
                          {iconEl}
                        </motion.button>
                      );
                    })}
                  </motion.div>
                </div>

                {/* RIGHT COLUMN: Explanation + Next button */}
                <div style={{ flex: '1 1 45%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                  {selectedOption !== null ? (
                    <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                      {/* Result badge */}
                      <div style={{
                        ...cardBase, padding: '16px 20px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
                        borderLeft: `3px solid ${selectedOption === currentQuestion.correct ? '#4ADE80' : '#FF4D6D'}`,
                        borderRadius: '0 16px 16px 0',
                      }}>
                        {selectedOption === currentQuestion.correct
                          ? <CheckCircle size={24} style={{ color: '#4ADE80', flexShrink: 0 }} />
                          : <XCircle size={24} style={{ color: '#FF4D6D', flexShrink: 0 }} />
                        }
                        <div>
                          <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700, color: selectedOption === currentQuestion.correct ? '#4ADE80' : '#FF4D6D', margin: 0 }}>
                            {selectedOption === currentQuestion.correct ? 'Correct!' : 'Incorrect'}
                          </p>
                          {selectedOption !== currentQuestion.correct && (
                            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>
                              Answer: <strong style={{ color: '#4ADE80' }}>{LABELS[currentQuestion.correct]}. {currentQuestion.options[currentQuestion.correct]}</strong>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Explanation */}
                      {currentQuestion.explanation && (
                        <div style={{ ...cardBase, padding: '16px 20px', flex: 1, overflow: 'auto', borderLeft: '3px solid var(--accent-primary)', borderRadius: '0 16px 16px 0' }}>
                          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent-primary)', margin: '0 0 8px' }}>
                            Explanation
                          </p>
                          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.7 }}>
                            {currentQuestion.explanation}
                          </p>
                        </div>
                      )}

                      {/* Score so far + Next button */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, flexShrink: 0 }}>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'var(--text-muted)' }}>
                          Score: {answers.filter(a => a.isCorrect).length}/{currentIndex + 1}
                        </span>
                        <button
                          onClick={handleNext}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8,
                            padding: '10px 24px', borderRadius: 10, border: 'none',
                            background: 'linear-gradient(135deg, #6C63FF, #4C46D9)', color: '#fff',
                            fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600,
                            cursor: 'pointer', boxShadow: '0 4px 16px rgba(108,99,255,0.25)',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(108,99,255,0.35)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(108,99,255,0.25)'; }}
                        >
                          {currentIndex + 1 >= totalQuestions ? 'See Results' : 'Next Question'}
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    /* Placeholder when no answer selected yet */
                    <div style={{ ...cardBase, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, opacity: 0.5 }}>
                      <Brain size={32} style={{ color: 'var(--text-muted)' }} />
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: 'var(--text-muted)', margin: 0, textAlign: 'center' }}>
                        Select an answer to see the explanation
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ══════════════════════════════════════════
              RESULTS SCREEN
             ══════════════════════════════════════════ */}
          {phase === 'results' && (
            <motion.div
              key="results"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={fadeUp}
              style={{ flex: 1, display: 'flex', gap: 24, minHeight: 0, overflow: 'hidden' }}
            >
              {/* ═══ LEFT: Score + Actions (static, no scroll, centered) ═══ */}
              <div style={{ flex: '1 1 40%', display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'center', maxWidth: 420 }}>
                <div style={{ ...cardBase, padding: '32px 28px', textAlign: 'center' }}>
                  <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>
                    Quiz Complete!
                  </h2>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: 'var(--text-muted)', margin: '0 0 24px' }}>
                    {algorithmName}
                  </p>

                  {/* Circular progress */}
                  <div style={{ position: 'relative', width: 140, height: 140, margin: '0 auto 20px' }}>
                    <svg width="140" height="140" viewBox="0 0 140 140" style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx="70" cy="70" r="58" fill="none" stroke="var(--border-subtle)" strokeWidth="8" />
                      <circle cx="70" cy="70" r="58" fill="none" stroke={perfMsg.color} strokeWidth="8"
                        strokeDasharray={circumference} strokeDashoffset={circumference - strokeDash}
                        strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 38, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
                        {score}/{totalQuestions}
                      </span>
                    </div>
                  </div>

                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 500, color: perfMsg.color, margin: '0 0 6px' }}>
                    {perfMsg.text}
                  </p>
                  <p style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                    <Clock size={13} /> Completed in {formatTime(elapsed)}
                  </p>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={handleRetake} style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '12px 16px', borderRadius: 12, border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-card)', color: 'var(--text-primary)',
                    fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600,
                    cursor: 'pointer', transition: 'border-color 0.2s, transform 0.2s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    <Brain size={15} /> Retake
                  </button>
                  <button onClick={handleBackToVisualizer} style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '12px 16px', borderRadius: 12, border: 'none',
                    background: 'linear-gradient(135deg, #6C63FF, #4C46D9)', color: '#fff',
                    fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600,
                    cursor: 'pointer', boxShadow: '0 4px 16px rgba(108,99,255,0.25)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(108,99,255,0.35)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(108,99,255,0.25)'; }}
                  >
                    <ArrowLeft size={15} /> Visualizer
                  </button>
                </div>
              </div>

              {/* ═══ RIGHT: Answer Review (scrollable only if needed) ═══ */}
              <div style={{ flex: '1 1 60%', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                <div style={{ ...cardBase, flex: 1, padding: '24px 28px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 16px', flexShrink: 0 }}>
                    Review Answers
                  </h3>

                  <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, paddingRight: 6 }}>
                    {questions.map((q, qIdx) => {
                      const answer = answers[qIdx];
                      if (!answer) return null;
                      const isCorrect = answer.isCorrect;

                      return (
                        <div key={q.id} style={{
                          padding: '14px 16px', borderRadius: 10, flexShrink: 0,
                          background: isCorrect ? 'rgba(74, 222, 128, 0.04)' : 'rgba(255, 77, 109, 0.04)',
                          border: `1px solid ${isCorrect ? 'rgba(74, 222, 128, 0.2)' : 'rgba(255, 77, 109, 0.2)'}`,
                        }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 6 }}>
                            <span style={{
                              width: 24, height: 24, borderRadius: 6, flexShrink: 0, marginTop: 1,
                              background: isCorrect ? 'rgba(74,222,128,0.15)' : 'rgba(255,77,109,0.15)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              {isCorrect
                                ? <CheckCircle size={14} style={{ color: '#4ADE80' }} />
                                : <XCircle size={14} style={{ color: '#FF4D6D' }} />}
                            </span>
                            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0, lineHeight: 1.4 }}>
                              {q.question}
                            </p>
                          </div>
                          <div style={{ marginLeft: 34 }}>
                            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 2px' }}>
                              <span style={{ color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}>Your answer: </span>
                              <span style={{ color: isCorrect ? '#4ADE80' : '#FF4D6D', fontWeight: 600 }}>
                                {LABELS[answer.selected]}. {q.options[answer.selected]}
                              </span>
                            </p>
                            {!isCorrect && (
                              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
                                <span style={{ color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}>Correct: </span>
                                <span style={{ color: '#4ADE80', fontWeight: 600 }}>
                                  {LABELS[answer.correct]}. {q.options[answer.correct]}
                                </span>
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
