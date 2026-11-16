/**
 * @file AlgorithmShowcase.jsx
 * @description 2x2 grid of premium glassmorphic category cards, each containing
 *              clickable algorithm pills. 4 categories: Sorting, Searching,
 *              Backtracking, Graphs.
 * @module components/home/AlgorithmShowcase
 */

import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';

/* ── SVG Illustrations ── */

const SortingSVG = ({ accent }) => (
  <svg width="120" height="80" viewBox="0 0 120 80" fill="none" aria-hidden="true">
    {/* 5 bars at varying heights */}
    {[
      { x: 12, h: 20 },
      { x: 30, h: 35, highlight: true },
      { x: 48, h: 50, highlight: true },
      { x: 66, h: 30 },
      { x: 84, h: 45 },
    ].map((bar, i) => (
      <rect
        key={i}
        x={bar.x}
        y={70 - bar.h}
        width="14"
        height={bar.h}
        rx="3"
        fill={bar.highlight ? '#FFB347' : 'rgba(108,99,255,0.25)'}
        style={bar.highlight ? { filter: 'drop-shadow(0 0 6px #FFB347)' } : {}}
      />
    ))}
    {/* Swap arrow between the two highlighted bars */}
    <path
      d="M37 22 C37 14, 55 14, 55 22"
      stroke={accent}
      strokeWidth="1.5"
      fill="none"
      strokeDasharray="3 2"
    />
    <polygon points="54,19 58,23 54,26" fill={accent} opacity="0.9" />
    <polygon points="38,19 34,23 38,26" fill={accent} opacity="0.9" />
  </svg>
);

const SearchingSVG = ({ accent }) => (
  <svg width="120" height="80" viewBox="0 0 120 80" fill="none" aria-hidden="true">
    {/* 7 equal blocks in a row */}
    {Array.from({ length: 7 }).map((_, i) => (
      <rect
        key={i}
        x={i * 15 + 8}
        y={32}
        width="12"
        height="24"
        rx="3"
        fill={i === 4 ? accent : 'rgba(255,255,255,0.08)'}
        stroke={i === 4 ? accent : 'rgba(255,255,255,0.1)'}
        strokeWidth="0.5"
        style={i === 4 ? { filter: `drop-shadow(0 0 6px ${accent})` } : {}}
      />
    ))}
    {/* Pointer arrow above highlighted block */}
    <polygon points="74,24 68,16 80,16" fill={accent} opacity="0.8" />
    {/* Magnifying glass */}
    <circle cx="96" cy="28" r="8" stroke={accent} strokeWidth="1.5" fill="none" opacity="0.6" />
    <line x1="102" y1="34" x2="108" y2="40" stroke={accent} strokeWidth="1.5" opacity="0.6" />
  </svg>
);

const BacktrackingSVG = ({ accent }) => {
  const walls = new Set(['0,1', '1,0', '2,2', '3,1']);
  const pathCells = ['0,0', '1,1', '1,2', '2,1', '3,0', '3,2'];
  const pathSet = new Set(pathCells);

  return (
    <svg width="120" height="80" viewBox="0 0 120 80" fill="none" aria-hidden="true">
      {/* 4x3 mini grid */}
      {Array.from({ length: 4 }).map((_, col) =>
        Array.from({ length: 3 }).map((_, row) => {
          const key = `${col},${row}`;
          const isWall = walls.has(key);
          const isPath = pathSet.has(key);
          return (
            <rect
              key={key}
              x={col * 22 + 14}
              y={row * 20 + 10}
              width="18"
              height="16"
              rx="3"
              fill={isWall ? 'rgba(255,255,255,0.03)' : isPath ? `${accent}30` : 'rgba(255,255,255,0.06)'}
              stroke={isWall ? 'rgba(255,255,255,0.06)' : isPath ? accent : 'rgba(255,255,255,0.08)'}
              strokeWidth={isPath ? '1' : '0.5'}
            />
          );
        })
      )}
      {/* Dotted path from top-left toward bottom-right */}
      <path
        d="M23 18 L23 38 L45 38 L45 28 L67 28 L67 18 L89 18 L89 58"
        stroke={accent}
        strokeWidth="1.5"
        fill="none"
        strokeDasharray="4 3"
        opacity="0.7"
        style={{ filter: `drop-shadow(0 0 3px ${accent})` }}
      />
    </svg>
  );
};

const GraphsSVG = ({ accent }) => {
  const nodes = [
    { cx: 35, cy: 25 },
    { cx: 75, cy: 18 },
    { cx: 95, cy: 48 },
    { cx: 55, cy: 55 },
    { cx: 20, cy: 55 },
  ];
  const edges = [
    [0, 1], [1, 2], [2, 3], [3, 4], [0, 4], [0, 3], [1, 3],
  ];

  return (
    <svg width="120" height="80" viewBox="0 0 120 80" fill="none" aria-hidden="true">
      {/* Edges */}
      {edges.map(([a, b], i) => (
        <line
          key={i}
          x1={nodes[a].cx}
          y1={nodes[a].cy}
          x2={nodes[b].cx}
          y2={nodes[b].cy}
          stroke="rgba(167,139,250,0.3)"
          strokeWidth="1"
        />
      ))}
      {/* BFS wave ripple on node 0 */}
      <circle cx={nodes[0].cx} cy={nodes[0].cy} r="14" fill="none" stroke={accent} strokeWidth="0.5" opacity="0.3" />
      <circle cx={nodes[0].cx} cy={nodes[0].cy} r="20" fill="none" stroke={accent} strokeWidth="0.3" opacity="0.15" />
      {/* Nodes */}
      {nodes.map((n, i) => (
        <circle
          key={i}
          cx={n.cx}
          cy={n.cy}
          r="7"
          fill={i === 0 ? accent : 'rgba(255,255,255,0.08)'}
          stroke={i === 0 ? accent : 'rgba(167,139,250,0.4)'}
          strokeWidth="1.5"
          style={i === 0 ? { filter: `drop-shadow(0 0 6px ${accent})` } : {}}
        />
      ))}
    </svg>
  );
};

/* ── Category data ── */
const CATEGORIES = [
  {
    name: 'Sorting',
    accent: '#6C63FF',
    Illustration: SortingSVG,
    algorithms: [
      { name: 'Bubble Sort', slug: 'bubble-sort' },
      { name: 'Selection Sort', slug: 'selection-sort' },
      { name: 'Insertion Sort', slug: 'insertion-sort' },
      { name: 'Merge Sort', slug: 'merge-sort' },
      { name: 'Quick Sort', slug: 'quick-sort' },
    ],
  },
  {
    name: 'Searching',
    accent: '#00E5CC',
    Illustration: SearchingSVG,
    algorithms: [
      { name: 'Linear Search', slug: 'linear-search' },
      { name: 'Binary Search', slug: 'binary-search' },
    ],
  },
  {
    name: 'Backtracking',
    accent: '#FF4D6D',
    Illustration: BacktrackingSVG,
    algorithms: [
      { name: 'Maze Solver', slug: 'maze-solver' },
      { name: 'N-Queens', slug: 'n-queens' },
      { name: "Knight's Tour", slug: 'knights-tour' },
      { name: 'Sudoku Solver', slug: 'sudoku-solver' },
    ],
  },
  {
    name: 'Graphs',
    accent: '#A78BFA',
    Illustration: GraphsSVG,
    algorithms: [
      { name: 'Graph BFS', slug: 'graph-bfs' },
    ],
  },
];

/* ── Card entrance animation variants ── */
const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.12,
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

/* ── Category Card ── */
function CategoryCard({ category, index }) {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();
  const { name, accent, Illustration, algorithms } = category;

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        minHeight: 0,
        borderRadius: 16,
        background: 'var(--bg-card)',
        border: `1px solid ${hovered ? `${accent}59` : 'var(--border-subtle)'}`,
        padding: 28,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        cursor: 'default',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        boxShadow: hovered
          ? `0 20px 40px rgba(0,0,0,0.3), 0 0 20px ${accent}20`
          : '0 2px 12px rgba(0,0,0,0.2)',
        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      {/* 1. SVG illustration */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 80,
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: 80,
            height: 40,
            borderRadius: '50%',
            background: accent,
            opacity: 0.06,
            filter: 'blur(20px)',
          }}
        />
        <Illustration accent={accent} />
      </div>

      {/* 2. Category name */}
      <h3
        style={{
          fontFamily: 'Syne, sans-serif',
          fontSize: 24,
          fontWeight: 700,
          color: 'var(--text-primary, #EEF2FF)',
          margin: 0,
        }}
      >
        {name}
      </h3>

      {/* 3. Algorithm count badge */}
      <span
        style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 11,
          color: accent,
          letterSpacing: '0.04em',
        }}
      >
        {algorithms.length} algorithm{algorithms.length !== 1 ? 's' : ''}
      </span>

      {/* 4. Algorithm pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {algorithms.map((algo) => (
          <AlgoPill key={algo.slug} algo={algo} accent={accent} navigate={navigate} />
        ))}
      </div>

      {/* 5. Explore link */}
      <span
        style={{
          marginTop: 'auto',
          fontFamily: 'DM Sans, sans-serif',
          fontSize: 13,
          fontWeight: 500,
          color: accent,
          opacity: hovered ? 1 : 0,
          transform: hovered ? 'translateY(0)' : 'translateY(6px)',
          transition: 'opacity 0.25s ease, transform 0.25s ease',
          paddingTop: 4,
        }}
      >
        Explore &rarr;
      </span>
    </motion.div>
  );
}

/* ── Algorithm Pill ── */
function AlgoPill({ algo, accent, navigate }) {
  const [hovered, setHovered] = useState(false);

  return (
    <span
      onClick={() => navigate(`/visualizer/${algo.slug}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontFamily: 'DM Sans, sans-serif',
        fontSize: 13,
        color: accent,
        padding: '6px 12px',
        borderRadius: 9999,
        background: hovered ? `${accent}33` : `${accent}1A`,
        border: `1px solid ${accent}33`,
        cursor: 'pointer',
        transition: 'background 0.2s ease',
        whiteSpace: 'nowrap',
        userSelect: 'none',
      }}
    >
      {algo.name}
    </span>
  );
}

/* ── Main Component ── */
export default function AlgorithmShowcase() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' });

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-24 overflow-hidden"
      style={{ background: 'var(--bg-primary, #0A0A0F)' }}
    >
      {/* Section Header */}
      <motion.div
        className="max-w-7xl mx-auto px-6 mb-14 text-center"
        initial={{ opacity: 0, y: 24 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {/* Label with flanking lines */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            justifyContent: 'center',
            marginBottom: 20,
          }}
        >
          <div style={{ flex: '0 1 80px', height: 1, background: 'rgba(108,99,255,0.2)' }} />
          <span
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 11,
              color: 'var(--text-muted)',
              letterSpacing: '0.15em',
              whiteSpace: 'nowrap',
            }}
          >
            ALGORITHM ROSTER
          </span>
          <div style={{ flex: '0 1 80px', height: 1, background: 'rgba(108,99,255,0.2)' }} />
        </div>

        <h2 style={{ marginBottom: 12 }}>
          <span
            style={{
              display: 'inline',
              fontFamily: 'Syne, sans-serif',
              fontSize: 'clamp(28px, 4vw, 42px)',
              fontWeight: 700,
              color: 'var(--text-primary)',
              lineHeight: 1.2,
            }}
          >
            4 categories.{' '}
          </span>
          <span
            style={{
              display: 'inline',
              fontFamily: 'Syne, sans-serif',
              fontSize: 'clamp(28px, 4vw, 42px)',
              fontWeight: 700,
              lineHeight: 1.2,
              background: 'linear-gradient(135deg, #6366F1, #06B6D4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            12 algorithms ready.
          </span>
        </h2>

        <p
          style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: 16,
            color: 'var(--text-secondary)',
            maxWidth: 520,
            margin: '0 auto',
          }}
        >
          Pick any category. Choose an algorithm. Watch it execute.
        </p>
      </motion.div>

      {/* 2x2 Grid */}
      <div
        className="max-w-7xl mx-auto px-6"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 20,
          maxWidth: 1000,
          margin: '0 auto',
        }}
      >
        {CATEGORIES.map((cat, i) => (
          <CategoryCard key={cat.name} category={cat} index={i} />
        ))}
      </div>
    </section>
  );
}
