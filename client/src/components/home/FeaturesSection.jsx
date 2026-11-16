/**
 * @file FeaturesSection.jsx
 * @description Feature section for TraceFlow home page.
 *              Equal 3x2 grid layout with glassmorphic cards, small SVG icons,
 *              staggered scroll-reveal via Framer Motion useInView.
 * @module components/home/FeaturesSection
 */

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

/* ─────────────────────────────────────────────
   Small SVG Icons (32x32)
   ───────────────────────────────────────────── */

const IconStepExecution = ({ color }) => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="14" stroke={color} strokeWidth="1.5" strokeOpacity="0.4" fill="none" />
    <polygon points="13,10 13,22 23,16" fill={color} />
  </svg>
);

const IconAlgorithms = ({ color }) => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <rect x="3" y="3" width="11" height="11" rx="2.5" fill={color} fillOpacity="0.8" />
    <rect x="18" y="3" width="11" height="11" rx="2.5" fill={color} fillOpacity="0.5" />
    <rect x="3" y="18" width="11" height="11" rx="2.5" fill={color} fillOpacity="0.5" />
    <rect x="18" y="18" width="11" height="11" rx="2.5" fill={color} fillOpacity="0.3" />
  </svg>
);

const IconCustomInput = ({ color }) => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <path
      d="M20 4L25.5 9.5L12 23H6.5V17.5L20 4Z"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={color}
      fillOpacity="0.15"
    />
    <line x1="17" y1="7" x2="22.5" y2="12.5" stroke={color} strokeWidth="1.5" />
    <line x1="6" y1="28" x2="26" y2="28" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.4" />
  </svg>
);

const IconSpeedControl = ({ color }) => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <path
      d="M8 24L14 4L18 18L22 10L26 24"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <circle cx="14" cy="4" r="2" fill={color} />
  </svg>
);

const IconPseudocode = ({ color }) => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <path d="M10 6L3 16L10 26" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M22 6L29 16L22 26" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="18" y1="4" x2="14" y2="28" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeOpacity="0.6" />
  </svg>
);

const IconProgress = ({ color }) => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="14" stroke={color} strokeWidth="1.5" strokeOpacity="0.4" fill="none" />
    <path d="M10 16L14.5 20.5L22 11" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ─────────────────────────────────────────────
   Feature Data
   ───────────────────────────────────────────── */

const features = [
  {
    number: "01",
    title: "Step-by-Step Execution",
    description: "Play, pause, rewind. Control every operation one step at a time.",
    Icon: IconStepExecution,
    accent: "#6C63FF",
  },
  {
    number: "02",
    title: "11 Algorithms",
    description: "Sorting, searching, backtracking, and graphs. All with full visualization.",
    Icon: IconAlgorithms,
    accent: "#00E5CC",
  },
  {
    number: "03",
    title: "Custom Input",
    description: "Test with your own arrays, grids, and puzzles. See edge cases instantly.",
    Icon: IconCustomInput,
    accent: "#FFB347",
  },
  {
    number: "04",
    title: "Speed Control",
    description: "Blazing fast or frame-by-frame. Scrub through like a video timeline.",
    Icon: IconSpeedControl,
    accent: "#00C896",
  },
  {
    number: "05",
    title: "Live Pseudocode",
    description: "Watch the exact line highlight as each step executes in real-time.",
    Icon: IconPseudocode,
    accent: "#6C63FF",
  },
  {
    number: "06",
    title: "Track Progress",
    description: "Every completed algorithm saved. Pick up where you left off.",
    Icon: IconProgress,
    accent: "#00E5CC",
  },
];

/* ─────────────────────────────────────────────
   Framer Motion Variants
   ───────────────────────────────────────────── */

const headerVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

/* ─────────────────────────────────────────────
   Feature Card (Glassmorphism)
   ───────────────────────────────────────────── */

function FeatureCard({ number, title, description, Icon, accent, delay = 0 }) {
  return (
    <motion.div
      variants={cardVariants}
      custom={delay}
      className="group relative overflow-hidden h-full"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "16px",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.35s cubic-bezier(0.25,0.46,0.45,0.94), border-color 0.35s ease, box-shadow 0.35s ease",
      }}
      whileHover={{
        y: -4,
        transition: { type: "spring", stiffness: 300, damping: 20 },
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = `${accent}4D`;
        e.currentTarget.style.boxShadow = `0 8px 32px ${accent}1A, 0 0 48px ${accent}0D`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border-subtle)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Number label top-right */}
      <span
        className="absolute font-mono font-bold tracking-wider"
        style={{
          top: "20px",
          right: "24px",
          fontSize: "13px",
          color: accent,
          opacity: 0.3,
        }}
      >
        {number}
      </span>

      {/* Small icon */}
      <div className="mb-5" style={{ width: "32px", height: "32px", flexShrink: 0 }}>
        <Icon color={accent} />
      </div>

      {/* Title */}
      <h3
        className="mb-2"
        style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: "18px",
          fontWeight: 700,
          color: "var(--text-primary)",
          lineHeight: 1.3,
        }}
      >
        {title}
      </h3>

      {/* Description */}
      <p
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "14px",
          lineHeight: 1.65,
          color: "var(--text-secondary)",
        }}
      >
        {description}
      </p>

      {/* Bottom accent line - expands 0% to 60% on hover */}
      <div
        className="absolute bottom-0 left-0 h-[2px] transition-all duration-700 ease-out"
        style={{
          width: "0%",
          background: `linear-gradient(to right, ${accent}, ${accent}66, transparent)`,
        }}
        ref={(el) => {
          if (!el) return;
          const parent = el.closest(".group");
          if (!parent) return;
          const show = () => { el.style.width = "60%"; };
          const hide = () => { el.style.width = "0%"; };
          parent.addEventListener("mouseenter", show);
          parent.addEventListener("mouseleave", hide);
        }}
      />
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   Features Section
   ───────────────────────────────────────────── */

export default function FeaturesSection() {
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const gridRef = useRef(null);

  const isHeaderInView = useInView(headerRef, { once: true, margin: "-60px" });
  const isGridInView = useInView(gridRef, { once: true, margin: "-80px" });

  return (
    <section
      id="features"
      ref={sectionRef}
      className="relative w-full"
      style={{
        backgroundColor: "var(--bg-primary)",
        paddingTop: "112px",
        paddingBottom: "112px",
        paddingLeft: "24px",
        paddingRight: "24px",
      }}
    >
      <div className="mx-auto" style={{ maxWidth: "1140px" }}>

        {/* ── Section Header ── */}
        <motion.div
          ref={headerRef}
          className="mb-16 text-center"
          initial="hidden"
          animate={isHeaderInView ? "visible" : "hidden"}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.15 } },
          }}
        >
          {/* Label with flanking gradient lines */}
          <motion.div
            variants={headerVariants}
            className="mb-6 flex items-center justify-center gap-4"
          >
            <div
              className="h-px"
              style={{
                width: "56px",
                background: "linear-gradient(to right, transparent, var(--text-muted))",
                opacity: 0.4,
              }}
            />
            <span
              className="font-mono uppercase"
              style={{
                fontSize: "11px",
                color: "var(--text-muted)",
                letterSpacing: "0.18em",
              }}
            >
              Platform Capabilities
            </span>
            <div
              className="h-px"
              style={{
                width: "56px",
                background: "linear-gradient(to left, transparent, var(--text-muted))",
                opacity: 0.4,
              }}
            />
          </motion.div>

          {/* Main Heading */}
          <motion.h2
            variants={headerVariants}
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: "clamp(32px, 5vw, 48px)",
              lineHeight: 1.15,
              marginBottom: "16px",
            }}
          >
            <span style={{ color: "var(--text-secondary)", fontWeight: 400 }}>
              Everything you need to
            </span>
            <br />
            <span style={{ color: "var(--text-primary)", fontWeight: 700 }}>
              actually understand DSA
            </span>
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            variants={headerVariants}
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "18px",
              color: "var(--text-secondary)",
              letterSpacing: "0.01em",
            }}
          >
            Stop memorizing. Start executing.
          </motion.p>
        </motion.div>

        {/* ── Feature Grid ── */}
        <motion.div
          ref={gridRef}
          initial="hidden"
          animate={isGridInView ? "visible" : "hidden"}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {features.map((feat, i) => (
            <FeatureCard
              key={feat.number}
              number={feat.number}
              title={feat.title}
              description={feat.description}
              Icon={feat.Icon}
              accent={feat.accent}
              delay={i * 0.1}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
