/**
 * @file RegisterPage.jsx
 * @description Full-viewport register page that centers the two-column RegisterForm.
 * @module pages/RegisterPage
 */

import RegisterForm from '../components/auth/RegisterForm';
import PageTransition from '../components/layout/PageTransition';

export default function RegisterPage() {
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

        <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>
          <RegisterForm />
        </div>
      </div>
    </PageTransition>
  );
}
