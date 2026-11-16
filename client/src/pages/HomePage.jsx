/**
 * @file HomePage.jsx
 * @description TraceFlow marketing homepage. Composes Hero, Features,
 *              AlgorithmShowcase, and CTA sections. Handles smooth scroll
 *              via ref forwarding to FeaturesSection.
 * @module pages/HomePage
 */

import { useRef } from 'react';
import Navbar from '../components/layout/Navbar';
import HeroSection from '../components/home/HeroSection';
import FeaturesSection from '../components/home/FeaturesSection';
import AlgorithmShowcase from '../components/home/AlgorithmShowcase';
import CTASection from '../components/home/CTASection';

export default function HomePage() {
  const featuresRef = useRef(null);

  return (
    <main style={{ overflowX: 'hidden' }} className="min-h-screen bg-[var(--bg-primary)]">
      <Navbar />
      <HeroSection featuresRef={featuresRef} />
      <div ref={featuresRef}>
        <FeaturesSection />
      </div>
      <AlgorithmShowcase />
      <CTASection />
      <footer className="border-t border-[var(--border-subtle)] py-8 text-center text-sm text-[var(--text-muted)]">
        TraceFlow — Learn algorithms by watching them run
      </footer>
    </main>
  );
}
