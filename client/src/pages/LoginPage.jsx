/**
 * @file LoginPage.jsx
 * @description Redesigned login page with centered glassmorphic card,
 *              TraceFlow indigo/cyan color scheme, grid background with
 *              radial bloom effect.
 * @module pages/LoginPage
 */

import { motion } from 'framer-motion';
import LoginForm from '../components/auth/LoginForm';
import PageTransition from '../components/layout/PageTransition';
import { LogoMark } from '../components/ui/Logo';

export default function LoginPage() {
  return (
    <PageTransition>
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-primary)',
          position: 'relative',
          overflow: 'hidden',
          padding: '24px',
        }}
      >
        {/* Grid pattern background */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            zIndex: 0,
          }}
        />

        {/* Radial bloom */}
        <div
          style={{
            position: 'absolute',
            top: '30%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '800px',
            height: '800px',
            background:
              'radial-gradient(circle, rgba(108,99,255,0.12) 0%, rgba(0,229,204,0.04) 40%, transparent 70%)',
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />

        {/* Glassmorphic card */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            maxWidth: '440px',
            background: 'color-mix(in srgb, var(--bg-card) 80%, transparent)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(108,99,255,0.15)',
            borderRadius: '20px',
            padding: '40px',
          }}
        >
          {/* Logo */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'rgba(108,99,255,0.1)',
                border: '1px solid rgba(108,99,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <LogoMark className="w-8 h-8" />
            </div>
          </div>

          {/* Heading */}
          <h1
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: '28px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              textAlign: 'center',
              margin: '0 0 8px 0',
            }}
          >
            Welcome Back
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '14px',
              color: 'var(--text-secondary)',
              textAlign: 'center',
              margin: '0 0 32px 0',
            }}
          >
            Sign in to continue learning
          </p>

          {/* Login form */}
          <LoginForm />
        </motion.div>
      </div>
    </PageTransition>
  );
}
