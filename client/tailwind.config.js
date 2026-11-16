/**
 * @file tailwind.config.js
 * @description Tailwind CSS configuration for TraceFlow V2. Extends with custom
 *              warm energetic theme colors based on educational psychology —
 *              orange for energy, teal for growth, green for success, gold for motivation.
 */

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        logo: ['Space Grotesk', 'sans-serif']
      },
      colors: {
        'tf-bg': 'var(--bg-primary)',
        'tf-bg2': 'var(--bg-secondary)',
        'tf-surface': 'var(--bg-surface)',
        'tf-card': 'var(--bg-card)',
        'tf-primary': 'var(--accent-primary)',
        'tf-blue': 'var(--accent-primary)',
        'tf-teal': 'var(--accent-secondary)',
        'tf-rose': 'var(--accent-danger)',
        'tf-gold': 'var(--accent-warn)',
        'tf-green': 'var(--accent-success)',
        'tf-hover': 'var(--bg-hover)',
        'tf-text': 'var(--text-primary)',
        'tf-text2': 'var(--text-secondary)',
        'tf-muted': 'var(--text-muted)'
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        glow: {
          from: { boxShadow: '0 0 10px rgba(255, 107, 53, 0.3)' },
          to: { boxShadow: '0 0 25px rgba(255, 107, 53, 0.6)' }
        }
      }
    }
  },
  plugins: []
};
