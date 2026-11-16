/**
 * @file DashboardPage.jsx
 * @description Personalized home page for authenticated users. Clean, compact
 *              layout with welcome hero and two action cards.
 * @module pages/DashboardPage
 */

import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogoMark } from '../components/ui/Logo';
import { Play, Clock, ArrowRight } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: 'easeOut' },
  }),
};

/**
 * Personalized home page for authenticated users.
 * @returns {JSX.Element}
 */
export default function DashboardPage() {
  const { user } = useAuth();

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

      {/* Centered content */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px 48px' }}>
        {/* Hero: Logo + Welcome */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            marginBottom: 32,
          }}
        >
          {/* Logo in gradient circle */}
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6C63FF, #4C46D9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
              boxShadow: '0 4px 24px rgba(108,99,255,0.3)',
            }}
          >
            <LogoMark className="w-6 h-6" />
          </div>

          <h1
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 26,
              fontWeight: 700,
              color: 'var(--text-primary)',
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            Welcome back,{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #6C63FF, #00E5CC)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {user?.name || 'Explorer'}
            </span>
            !
          </h1>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              color: 'var(--text-secondary)',
              marginTop: 6,
            }}
          >
            Your personalized learning hub
          </p>
        </motion.section>

        {/* Action Cards (50/50 grid) */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={1}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 16,
          }}
        >
          {/* Card 1 -- Start Visualizing */}
          <Link to="/visualizer" style={{ textDecoration: 'none' }}>
            <motion.div
              whileHover={{ y: -3, borderColor: 'rgba(108,99,255,0.35)' }}
              style={{
                background: 'var(--bg-card)',
                backdropFilter: 'blur(12px)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 14,
                padding: 20,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'transform 0.2s ease, border-color 0.2s ease',
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: 'rgba(108,99,255,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6C63FF',
                  marginBottom: 12,
                }}
              >
                <Play size={18} />
              </div>

              <h3
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: 16,
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  margin: 0,
                }}
              >
                Start Visualizing
              </h3>
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 13,
                  color: 'var(--text-muted)',
                  marginTop: 6,
                  lineHeight: 1.5,
                  flex: 1,
                }}
              >
                Choose an algorithm and watch it execute step by step
              </p>

              <div
                style={{
                  marginTop: 12,
                  color: '#6C63FF',
                  fontSize: 18,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <ArrowRight size={16} />
              </div>
            </motion.div>
          </Link>

          {/* Card 2 -- Learning History */}
          <Link to="/history" style={{ textDecoration: 'none' }}>
            <motion.div
              whileHover={{ y: -3, borderColor: 'rgba(0,229,204,0.35)' }}
              style={{
                background: 'var(--bg-card)',
                backdropFilter: 'blur(12px)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 14,
                padding: 20,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'transform 0.2s ease, border-color 0.2s ease',
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: 'rgba(0,229,204,0.10)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#00E5CC',
                  marginBottom: 12,
                }}
              >
                <Clock size={18} />
              </div>

              <h3
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: 16,
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  margin: 0,
                }}
              >
                Learning History
              </h3>
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 13,
                  color: 'var(--text-muted)',
                  marginTop: 6,
                  lineHeight: 1.5,
                  flex: 1,
                }}
              >
                View your completed algorithms and track your journey
              </p>

              <div
                style={{
                  marginTop: 12,
                  color: '#00E5CC',
                  fontSize: 18,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <ArrowRight size={16} />
              </div>
            </motion.div>
          </Link>
        </motion.section>
      </div>
    </div>
  );
}
