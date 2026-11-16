/**
 * @file HeroSection.jsx
 * @description Full-viewport hero with split layout — animated text left,
 *              abstract algorithm-in-motion terminal visualizer right.
 *              Floating particles, gradient blooms, and GSAP stat counters
 *              complete the experience.
 * @module components/home/HeroSection
 */

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import PropTypes from 'prop-types';

/* ─────────────────────────  CONSTANTS  ───────────────────────── */

const CODE_LINES = [
  'function solve(input) {',
  '  for (let i = 0; i < n; i++) {',
  '    if (isValid(state, i)) {',
  '      state = apply(state, i);',
  '      if (solve(state)) return true;',
  '      state = undo(state, i);',
  '    }',
  '  }',
  '  return result;',
  '}',
];

const CELL_COUNT = 8;
const HIGHLIGHT_INTERVAL = 800;

const CELL_COLORS = {
  default: '#1D2E47',
  active: '#FFB347',
  processing: '#6C63FF',
  done: '#00C896',
};

/* ─────────────────────────  PARTICLE CONFIGS  ───────────────────────── */

function buildParticleConfigs() {
  const configs = [];
  for (let i = 0; i < 20; i++) {
    const size = Math.random() * 3 + 2;
    configs.push({
      id: i,
      width: size,
      height: size,
      left: `${Math.random() * 100}%`,
      bottom: `${-Math.random() * 20}%`,
      opacity: Math.random() * 0.25 + 0.1,
      animationDelay: `${Math.random() * 8}s`,
      animationDuration: `${Math.random() * 12 + 8}s`,
      color: Math.random() > 0.5 ? 'rgba(108,99,255,0.35)' : 'rgba(0,229,204,0.3)',
    });
  }
  return configs;
}

/* ─────────────────────────  HERO MINI VISUALIZER  ───────────────────────── */

function HeroMiniVisualizer({ reducedMotion }) {
  const [activeLine, setActiveLine] = useState(0);
  const [typedLines, setTypedLines] = useState(reducedMotion ? CODE_LINES.length : 0);
  const [cellStates, setCellStates] = useState(() =>
    Array.from({ length: CELL_COUNT }, () => 'default')
  );

  // Typing effect: reveal lines one by one
  useEffect(() => {
    if (reducedMotion) {
      setTypedLines(CODE_LINES.length);
      return;
    }

    if (typedLines >= CODE_LINES.length) return;

    const timer = setTimeout(() => {
      setTypedLines((prev) => prev + 1);
    }, 120);

    return () => clearTimeout(timer);
  }, [typedLines, reducedMotion]);

  // Highlight line cycling
  useEffect(() => {
    if (reducedMotion) return;
    if (typedLines < CODE_LINES.length) return;

    const interval = setInterval(() => {
      setActiveLine((prev) => (prev + 1) % CODE_LINES.length);
    }, HIGHLIGHT_INTERVAL);

    return () => clearInterval(interval);
  }, [typedLines, reducedMotion]);

  // Cell animation cycling
  useEffect(() => {
    if (reducedMotion) return;
    if (typedLines < CODE_LINES.length) return;

    const colorOrder = ['default', 'active', 'processing', 'done'];
    let tick = 0;

    const interval = setInterval(() => {
      tick++;
      setCellStates(
        Array.from({ length: CELL_COUNT }, (_, i) => {
          const phase = (tick + i) % (CELL_COUNT * 2);
          if (phase < CELL_COUNT) {
            return colorOrder[phase % colorOrder.length];
          }
          return 'default';
        })
      );
    }, HIGHLIGHT_INTERVAL);

    return () => clearInterval(interval);
  }, [typedLines, reducedMotion]);

  // Cell heights cycle
  const getCellHeight = useCallback(
    (index) => {
      if (reducedMotion) return 24;
      const state = cellStates[index];
      switch (state) {
        case 'active':
          return 40;
        case 'processing':
          return 32;
        case 'done':
          return 20;
        default:
          return 24;
      }
    },
    [cellStates, reducedMotion]
  );

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(15,26,46,0.6)',
        border: '1px solid rgba(108,99,255,0.15)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        padding: 20,
        width: '100%',
        maxWidth: 400,
        borderRadius: 14,
      }}
    >
      {/* Window dots */}
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FF5F57' }} />
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FFBD2E' }} />
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#28CA41' }} />
        <span className="ml-2 font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>
          algorithm.visual
        </span>
      </div>

      {/* Animated pseudocode */}
      <div
        style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 11,
          lineHeight: '20px',
          position: 'relative',
          minHeight: CODE_LINES.length * 20,
          marginBottom: 16,
        }}
      >
        {CODE_LINES.map((line, i) => {
          const isVisible = i < typedLines;
          const isActive = typedLines >= CODE_LINES.length && i === activeLine;

          return (
            <div
              key={i}
              style={{
                position: 'relative',
                height: 20,
                display: 'flex',
                alignItems: 'center',
                opacity: isVisible ? 1 : 0,
                transition: 'opacity 0.15s ease',
              }}
            >
              {/* Highlight bar */}
              <div
                style={{
                  position: 'absolute',
                  left: -8,
                  right: -8,
                  top: 0,
                  bottom: 0,
                  borderRadius: 4,
                  background: isActive ? 'rgba(0,200,150,0.12)' : 'transparent',
                  borderLeft: isActive ? '2px solid #00C896' : '2px solid transparent',
                  transition: 'all 0.3s ease',
                }}
              />

              {/* Line number */}
              <span
                style={{
                  width: 24,
                  textAlign: 'right',
                  marginRight: 12,
                  color: isActive ? '#00C896' : 'rgba(136,146,176,0.4)',
                  fontSize: 10,
                  userSelect: 'none',
                  position: 'relative',
                  zIndex: 1,
                  transition: 'color 0.3s ease',
                }}
              >
                {i + 1}
              </span>

              {/* Code text */}
              <span
                style={{
                  color: isActive ? '#E2E8F0' : '#8892B0',
                  whiteSpace: 'pre',
                  position: 'relative',
                  zIndex: 1,
                  transition: 'color 0.3s ease',
                }}
              >
                {line}
              </span>
            </div>
          );
        })}
      </div>

      {/* Separator */}
      <div
        style={{
          height: 1,
          background: 'rgba(108,99,255,0.12)',
          marginBottom: 14,
        }}
      />

      {/* Abstract cells visualization */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          gap: 6,
          height: 48,
        }}
      >
        {Array.from({ length: CELL_COUNT }, (_, i) => (
          <div
            key={i}
            style={{
              width: 28,
              height: getCellHeight(i),
              borderRadius: 4,
              background: CELL_COLORS[cellStates[i]] || CELL_COLORS.default,
              transition: reducedMotion ? 'none' : 'all 0.5s cubic-bezier(0.34,1.56,0.64,1)',
              boxShadow:
                cellStates[i] !== 'default'
                  ? `0 0 8px ${CELL_COLORS[cellStates[i]]}40`
                  : 'none',
            }}
          />
        ))}
      </div>
    </div>
  );
}

HeroMiniVisualizer.propTypes = {
  reducedMotion: PropTypes.bool.isRequired,
};

/* ─────────────────────────  HEADLINE VARIANTS  ───────────────────────── */

const headlineWords = [
  { text: 'Understand', gradient: false },
  { text: 'Algorithms', gradient: false },
  { text: 'By Watching', gradient: false },
  { text: 'Them Run.', gradient: true },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } },
};

const lineVariants = {
  hidden: { opacity: 0, y: 48 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay, ease: 'easeOut' },
  }),
};

/* ─────────────────────────  MAIN HERO SECTION  ───────────────────────── */

export default function HeroSection({ featuresRef }) {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const reducedMotion = !!prefersReducedMotion;

  const particles = useMemo(() => buildParticleConfigs(), []);

  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const [scrolledPast, setScrolledPast] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowScrollIndicator(true), 1500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolledPast(window.scrollY > 100);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── GSAP stat counters ── */
  const counterRefs = useRef([]);

  useEffect(() => {
    if (reducedMotion) {
      if (counterRefs.current[0]) counterRefs.current[0].textContent = '11';
      if (counterRefs.current[1]) counterRefs.current[1].textContent = '3';
      return;
    }

    const ctx = gsap.context(() => {
      const c1 = { val: 0 };
      const c2 = { val: 0 };
      gsap.to(c1, {
        val: 11, duration: 1.5, delay: 1.1, ease: 'power2.out',
        onUpdate() { if (counterRefs.current[0]) counterRefs.current[0].textContent = Math.round(c1.val); },
      });
      gsap.to(c2, {
        val: 3, duration: 1.2, delay: 1.2, ease: 'power2.out',
        onUpdate() { if (counterRefs.current[1]) counterRefs.current[1].textContent = Math.round(c2.val); },
      });
    });

    return () => ctx.revert();
  }, [reducedMotion]);

  /* ── CTA button hover states ── */
  const [primaryHovered, setPrimaryHovered] = useState(false);
  const [ghostHovered, setGhostHovered] = useState(false);

  return (
    <section
      className="relative min-h-[88vh] flex items-center overflow-hidden"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* ── BG Layer 1: Grid ── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true" style={{
        backgroundImage: `linear-gradient(rgba(108,99,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(108,99,255,0.05) 1px, transparent 1px)`,
        backgroundSize: '48px 48px',
      }} />

      {/* ── BG Layer 2: Indigo bloom ── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true" style={{
        background: 'radial-gradient(ellipse 700px 500px at 30% 50%, rgba(108,99,255,0.12) 0%, transparent 70%)',
      }} />

      {/* ── BG Layer 3: Cyan bloom ── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true" style={{
        background: 'radial-gradient(ellipse 500px 400px at 85% 80%, rgba(0,229,204,0.07) 0%, transparent 65%)',
      }} />

      {/* ── BG Layer 4: Floating particles ── */}
      {!reducedMotion && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          {particles.map((p) => (
            <span
              key={p.id}
              className="absolute rounded-full"
              style={{
                width: p.width,
                height: p.height,
                left: p.left,
                bottom: p.bottom,
                background: p.color,
                animation: `heroParticleFloat ${p.animationDuration} linear infinite`,
                animationDelay: p.animationDelay,
              }}
            />
          ))}
        </div>
      )}

      <style>{`
        @keyframes heroParticleFloat {
          0%   { transform: translateY(0); opacity: 0; }
          5%   { opacity: 0.5; }
          95%  { opacity: 0.3; }
          100% { transform: translateY(-110vh); opacity: 0; }
        }
        @keyframes heroCursorBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes heroChevronBob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(8px); }
        }
      `}</style>

      {/* ── MAIN CONTENT ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 py-12 lg:py-0">
        <div className="flex flex-col lg:flex-row items-center lg:items-center gap-12 lg:gap-8">
          {/* ════════ LEFT COLUMN (55%) ════════ */}
          <div className="w-full lg:w-[55%] flex flex-col items-center lg:items-start text-center lg:text-left">
            {/* System label */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="mb-6"
            >
              <span className="font-mono text-[11px] tracking-[0.15em] uppercase" style={{ color: 'var(--accent-secondary)' }}>
                TRACEFLOW v3.0 — DSA LEARNING PLATFORM
                <span style={{ display: 'inline-block', marginLeft: 4, animation: 'heroCursorBlink 1s step-end infinite' }}>▊</span>
              </span>
            </motion.div>

            {/* Headline — 4 staggered lines */}
            <motion.div className="mb-6" variants={containerVariants} initial="hidden" animate="visible">
              {headlineWords.map((line, i) => (
                <motion.div key={i} variants={lineVariants}>
                  <h1
                    className="font-display font-bold leading-[1.08]"
                    style={{
                      fontSize: 'clamp(40px, 6vw, 72px)',
                      ...(line.gradient
                        ? {
                            background: 'linear-gradient(135deg, #6C63FF 0%, #00E5CC 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                          }
                        : { color: 'var(--text-primary)' }),
                    }}
                  >
                    {line.text}
                  </h1>
                </motion.div>
              ))}
            </motion.div>

            {/* Subheadline */}
            <motion.p
              custom={0.7}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="font-body text-lg leading-relaxed max-w-lg mb-8"
              style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}
            >
              Not just theory. Watch every comparison, every swap, every decision — step by step, at your pace.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              custom={0.9}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-8"
            >
              <button
                type="button"
                onClick={() => navigate('/visualizer')}
                onMouseEnter={() => setPrimaryHovered(true)}
                onMouseLeave={() => setPrimaryHovered(false)}
                className="relative inline-flex items-center gap-2 text-white font-semibold cursor-pointer"
                style={{
                  height: 52,
                  padding: '0 28px',
                  background: 'linear-gradient(135deg, #6C63FF 0%, #4C46D9 100%)',
                  borderRadius: 10,
                  border: 'none',
                  fontSize: 15,
                  boxShadow: primaryHovered
                    ? '0 0 30px rgba(108,99,255,0.6), 0 8px 25px rgba(108,99,255,0.4)'
                    : '0 0 20px rgba(108,99,255,0.4), 0 4px 15px rgba(108,99,255,0.3)',
                  transform: primaryHovered ? 'translateY(-3px) scale(1.02)' : 'translateY(0) scale(1)',
                  transition: 'all 0.2s cubic-bezier(0.34,1.56,0.64,1)',
                }}
              >
                Start Visualizing
                <span aria-hidden="true">→</span>
              </button>

              <button
                type="button"
                onClick={() => featuresRef?.current?.scrollIntoView({ behavior: 'smooth' })}
                onMouseEnter={() => setGhostHovered(true)}
                onMouseLeave={() => setGhostHovered(false)}
                className="inline-flex items-center gap-2 font-medium cursor-pointer"
                style={{
                  height: 52,
                  padding: '0 24px',
                  background: ghostHovered ? 'rgba(108,99,255,0.06)' : 'transparent',
                  border: `1px solid ${ghostHovered ? 'rgba(108,99,255,0.7)' : 'rgba(108,99,255,0.35)'}`,
                  borderRadius: 10,
                  color: ghostHovered ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontSize: 15,
                  transition: 'all 0.2s ease',
                }}
              >
                See How It Works
              </button>
            </motion.div>

            {/* Stat strip */}
            <motion.div
              custom={1.1}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="flex items-center gap-6"
            >
              <div>
                <div ref={el => counterRefs.current[0] = el}
                  className="font-display font-bold" style={{ fontSize: 32, color: '#00E5CC', lineHeight: 1 }}>0</div>
                <div className="font-mono text-[10px] mt-1" style={{ color: 'var(--text-muted)', letterSpacing: '0.1em' }}>ALGORITHMS</div>
              </div>

              <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.1)' }} />

              <div>
                <div ref={el => counterRefs.current[1] = el}
                  className="font-display font-bold" style={{ fontSize: 32, color: '#00E5CC', lineHeight: 1 }}>0</div>
                <div className="font-mono text-[10px] mt-1" style={{ color: 'var(--text-muted)', letterSpacing: '0.1em' }}>CATEGORIES</div>
              </div>

              <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.1)' }} />

              <div className="font-mono text-[13px]" style={{ color: '#00E5CC', letterSpacing: '0.05em' }}>
                STEP BY STEP
              </div>
            </motion.div>
          </div>

          {/* ════════ RIGHT COLUMN (45%) ════════ */}
          <motion.div
            className="w-full lg:w-[45%] flex justify-center"
            initial={{ opacity: 0, x: 60, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <HeroMiniVisualizer reducedMotion={reducedMotion} />
          </motion.div>
        </div>
      </div>

      {/* ── SCROLL INDICATOR ── */}
      {showScrollIndicator && !scrolledPast && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          onClick={() => featuresRef?.current?.scrollIntoView({ behavior: 'smooth' })}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 cursor-pointer"
          aria-hidden="true"
          style={{ animation: 'heroChevronBob 2s ease-in-out infinite' }}
        >
          <span className="text-[11px] font-mono uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>scroll</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)' }}>
            <path d="M6 9l6 6 6-6" />
          </svg>
        </motion.div>
      )}
    </section>
  );
}

HeroSection.propTypes = {
  featuresRef: PropTypes.shape({
    current: PropTypes.instanceOf(typeof Element !== 'undefined' ? Element : Object),
  }),
};

HeroSection.defaultProps = {
  featuresRef: null,
};
