/**
 * @file CTASection.jsx
 * @description Final call-to-action section with horizon borders, corner brackets,
 *              atmospheric background, gradient heading, and auth-aware buttons.
 * @module components/home/CTASection
 */

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const trustItems = ['11 algorithms', 'Step-by-step', 'No signup required'];

export default function CTASection() {
  const navigate = useNavigate();
  const { isAuthenticated, continueAsGuest } = useAuth();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const handleGetStarted = () => navigate('/register');
  const handleGuest = () => {
    continueAsGuest();
    navigate('/visualizer');
  };

  return (
    <section
      ref={ref}
      className="relative w-full overflow-hidden"
      style={{
        padding: '80px 24px',
        textAlign: 'center',
        background:
          'linear-gradient(180deg, transparent 0%, rgba(108,99,255,0.04) 30%, rgba(0,229,204,0.03) 70%, transparent 100%)',
      }}
    >
      {/* Top horizon line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          background:
            'linear-gradient(90deg, transparent 0%, rgba(108,99,255,0.5) 25%, rgba(0,229,204,0.5) 50%, rgba(108,99,255,0.5) 75%, transparent 100%)',
        }}
      />

      {/* Bottom horizon line */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 1,
          background:
            'linear-gradient(90deg, transparent 0%, rgba(108,99,255,0.5) 25%, rgba(0,229,204,0.5) 50%, rgba(108,99,255,0.5) 75%, transparent 100%)',
        }}
      />

      {/* Atmospheric blurred circles */}
      <div
        className="absolute pointer-events-none"
        aria-hidden="true"
        style={{
          top: '20%',
          left: '10%',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'rgba(108,99,255,0.04)',
          filter: 'blur(80px)',
        }}
      />
      <div
        className="absolute pointer-events-none"
        aria-hidden="true"
        style={{
          bottom: '15%',
          right: '8%',
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'rgba(0,229,204,0.04)',
          filter: 'blur(60px)',
        }}
      />
      <div
        className="absolute pointer-events-none"
        aria-hidden="true"
        style={{
          top: '10%',
          right: '20%',
          width: 150,
          height: 150,
          borderRadius: '50%',
          background: 'rgba(255,77,109,0.03)',
          filter: 'blur(50px)',
        }}
      />

      {/* Content */}
      <motion.div
        className="relative max-w-xl mx-auto"
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        {/* Corner brackets */}
        <div
          className="absolute pointer-events-none"
          style={{
            inset: -24,
          }}
          aria-hidden="true"
        >
          {/* Top-left */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 20,
              height: 20,
              borderTop: '2px solid rgba(108,99,255,0.5)',
              borderLeft: '2px solid rgba(108,99,255,0.5)',
            }}
          />
          {/* Top-right */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: 20,
              height: 20,
              borderTop: '2px solid rgba(108,99,255,0.5)',
              borderRight: '2px solid rgba(108,99,255,0.5)',
            }}
          />
          {/* Bottom-left */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: 20,
              height: 20,
              borderBottom: '2px solid rgba(108,99,255,0.5)',
              borderLeft: '2px solid rgba(108,99,255,0.5)',
            }}
          />
          {/* Bottom-right */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: 20,
              height: 20,
              borderBottom: '2px solid rgba(108,99,255,0.5)',
              borderRight: '2px solid rgba(108,99,255,0.5)',
            }}
          />
        </div>

        {/* Label */}
        <p
          className="font-mono mb-6"
          style={{
            fontSize: 11,
            color: '#00E5CC',
            letterSpacing: '0.15em',
          }}
        >
          [ READY TO START? ]
        </p>

        {/* Heading */}
        <h2 style={{ marginBottom: 16 }}>
          <span
            style={{
              display: 'block',
              fontFamily: 'Syne, sans-serif',
              fontSize: 'clamp(28px, 4vw, 40px)',
              fontWeight: 400,
              color: 'var(--text-secondary)',
              lineHeight: 1.3,
            }}
          >
            Stop reading about algorithms.
          </span>
          <span
            style={{
              display: 'block',
              fontFamily: 'Syne, sans-serif',
              fontSize: 'clamp(36px, 5vw, 54px)',
              fontWeight: 700,
              color: 'var(--text-primary)',
              lineHeight: 1.3,
            }}
          >
            Start{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #6C63FF, #00E5CC)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              running
            </span>{' '}
            them.
          </span>
        </h2>

        {/* Subtext */}
        <p
          className="font-body mb-10"
          style={{
            fontSize: 17,
            color: 'var(--text-secondary)',
            lineHeight: 1.7,
          }}
        >
          Free forever for students. Sign in with Google and start in 30 seconds.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          {isAuthenticated ? (
            <motion.button
              type="button"
              onClick={() => navigate('/visualizer')}
              className="font-body font-semibold text-white cursor-pointer"
              style={{
                height: 52,
                padding: '0 28px',
                borderRadius: 10,
                background: 'linear-gradient(135deg, #6C63FF 0%, #4C46D9 100%)',
                boxShadow:
                  '0 0 20px rgba(108,99,255,0.4), 0 4px 15px rgba(108,99,255,0.3)',
                fontSize: 15,
                border: 'none',
              }}
              whileHover={{
                y: -3,
                scale: 1.02,
                boxShadow:
                  '0 0 30px rgba(108,99,255,0.6), 0 8px 25px rgba(108,99,255,0.4)',
              }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.2 }}
            >
              Go to Visualizer →
            </motion.button>
          ) : (
            <>
              <motion.button
                type="button"
                onClick={handleGetStarted}
                className="font-body font-semibold text-white cursor-pointer"
                style={{
                  height: 52,
                  padding: '0 28px',
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #6C63FF 0%, #4C46D9 100%)',
                  boxShadow:
                    '0 0 20px rgba(108,99,255,0.4), 0 4px 15px rgba(108,99,255,0.3)',
                  fontSize: 15,
                  border: 'none',
                }}
                whileHover={{
                  y: -3,
                  scale: 1.02,
                  boxShadow:
                    '0 0 30px rgba(108,99,255,0.6), 0 8px 25px rgba(108,99,255,0.4)',
                }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.2 }}
              >
                Get Started Free
              </motion.button>

              <motion.button
                type="button"
                onClick={handleGuest}
                className="font-body font-medium cursor-pointer"
                style={{
                  height: 52,
                  padding: '0 24px',
                  borderRadius: 10,
                  background: 'transparent',
                  border: '1px solid rgba(108,99,255,0.4)',
                  color: 'var(--text-secondary)',
                  fontSize: 15,
                }}
                whileHover={{
                  borderColor: 'rgba(108,99,255,0.7)',
                  color: 'var(--text-primary)',
                  backgroundColor: 'rgba(108,99,255,0.06)',
                }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.2 }}
              >
                Try as Guest →
              </motion.button>
            </>
          )}
        </div>

        {/* Trust pills */}
        <div
          style={{
            display: 'flex',
            gap: 16,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          {trustItems.map((t) => (
            <span
              key={t}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontFamily: 'DM Sans, sans-serif',
                fontSize: 13,
                color: 'var(--text-secondary)',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                <circle
                  cx="7"
                  cy="7"
                  r="6"
                  fill="rgba(0,200,150,0.15)"
                  stroke="rgba(0,200,150,0.4)"
                  strokeWidth="1"
                />
                <path
                  d="M4 7l2 2 4-4"
                  stroke="#00C896"
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {t}
            </span>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
