/**
 * @file Visualizer.jsx
 * @description D3.js-powered SVG bar chart that visualizes the current state of
 *              the array at each algorithm step. Bars are color-coded by step type
 *              and feature a gradient fill for depth. Uses a ResizeObserver for
 *              responsive sizing and fills its container completely. The step
 *              description pill is overlaid at the bottom of the SVG area.
 * @module components/visualizer/Visualizer
 * @exports Visualizer (default)
 */

import { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import PropTypes from 'prop-types';
import { useTrace } from '../../context/TraceContext';

/* ── Layout constants ── */

/** @type {{ top: number, right: number, bottom: number, left: number }} */
const PADDING = { top: 20, right: 16, bottom: 32, left: 16 };

/** Fraction of the step speed used for D3 transition duration. */
const TRANSITION_RATIO = 0.4;

/** Minimum rendered bar height in pixels so tiny values remain visible. */
const MIN_BAR_HEIGHT = 8;

/** Gap between bars in pixels. */
const BAR_GAP = 4;

/* ── Color helpers ── */

/**
 * Map of step type to fill color.
 * @type {Record<string, string>}
 */
const TYPE_COLORS = {
  compare: 'var(--color-compare)',
  swap: 'var(--color-swap)',
  pivot: 'var(--color-pivot)',
  sorted: 'var(--color-sorted)',
  found: 'var(--color-found)',
  done: 'var(--color-sorted)'
};

/**
 * CSS color for badge prefix.
 * @type {Record<string, string>}
 */
const BADGE_PREFIX_COLORS = {
  compare: '#FFB347',
  swap: '#FF4D6D',
  pivot: '#FF6B35',
  sorted: '#00C896',
  found: '#4ECDC4',
  done: '#FF6B35'
};

/**
 * Raw hex colors for gradient generation (lighter variants).
 * @type {Record<string, [string, string]>}
 */
const GRADIENT_COLORS = {
  compare: ['#FFB347', '#E89530'],
  swap: ['#FF4D6D', '#D93B58'],
  pivot: ['#FF6B35', '#D95A2B'],
  sorted: ['#00C896', '#00A67A'],
  found: ['#4ECDC4', '#3AAFA6'],
  done: ['#00C896', '#00A67A'],
  default: ['#475569', '#334155']
};

/**
 * Determine the fill color for a bar based on the current step.
 *
 * @param {number}      index - Index of the bar.
 * @param {Object|null} step  - Current step object.
 * @param {number}      total - Total elements in array.
 * @returns {string} CSS color value.
 */
function getBarColor(index, step, total) {
  if (!step) return 'url(#bar-gradient-default)';

  if (step.type === 'done') return 'url(#bar-gradient-done)';
  if (step.type === 'found' && step.indices.includes(index)) return 'url(#bar-gradient-found)';

  if (step.type === 'sorted') {
    if (step.indices.includes(index)) return 'url(#bar-gradient-sorted)';
    if (step.pass >= 0 && index > total - 1 - step.pass) return 'url(#bar-gradient-sorted)';
  }

  if (step.type === 'pivot' && step.indices.includes(index)) return 'url(#bar-gradient-pivot)';
  if (step.type === 'swap' && step.indices.includes(index)) return 'url(#bar-gradient-swap)';
  if (step.type === 'compare' && step.indices.includes(index)) return 'url(#bar-gradient-compare)';

  if (step.pass >= 0 && index > total - 1 - step.pass) return 'url(#bar-gradient-sorted)';

  return 'url(#bar-gradient-default)';
}

/**
 * D3.js SVG bar chart visualizer for algorithm trace steps.
 *
 * @returns {JSX.Element}
 */
export default function Visualizer() {
  const { state } = useTrace();
  const { inputArray, steps, currentStep, speed } = state;

  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 300 });

  /* ── Responsive sizing via ResizeObserver ── */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const measure = () => {
      const w = container.clientWidth || 600;
      const h = container.clientHeight || 300;
      if (w > 0 && h > 0) {
        setDimensions({ width: w, height: h });
      }
    };

    measure();

    const observer = new ResizeObserver(() => measure());
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  /* ── D3 draw / update ── */
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const step =
      currentStep >= 0 && currentStep < steps.length ? steps[currentStep] : null;
    const data = step ? step.array : inputArray;
    const n = data.length;

    const innerWidth = dimensions.width - PADDING.left - PADDING.right;
    const innerHeight = dimensions.height - PADDING.top - PADDING.bottom;

    if (innerWidth <= 0 || innerHeight <= 0) return;

    /* ── Scales ── */
    const xScale = d3
      .scaleBand()
      .domain(d3.range(n))
      .range([0, innerWidth])
      .paddingInner(BAR_GAP / (innerWidth / n || 1))
      .paddingOuter(0.05);

    const maxVal = d3.max(data, (d) => Math.abs(d)) || 1;
    const yScale = d3.scaleLinear().domain([0, maxVal]).nice().range([0, innerHeight]);

    const transitionDuration = speed * TRANSITION_RATIO;

    /* ── Root group ── */
    let g = svg.select('.chart-group');
    if (g.empty()) {
      g = svg.append('g').attr('class', 'chart-group');
    }
    g.attr('transform', `translate(${PADDING.left}, ${PADDING.top})`);

    /* ── Dashed baseline ── */
    let baseline = g.select('.baseline');
    if (baseline.empty()) {
      baseline = g
        .append('line')
        .attr('class', 'baseline')
        .attr('stroke', 'var(--border-subtle)')
        .attr('stroke-dasharray', '4 4');
    }
    baseline
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', innerHeight)
      .attr('y2', innerHeight);

    /* ── Bars (enter / update / exit) ── */
    const bars = g.selectAll('.bar').data(data, (_d, i) => i);

    const barsEnter = bars
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (_d, i) => xScale(i))
      .attr('y', innerHeight)
      .attr('width', xScale.bandwidth())
      .attr('height', 0)
      .attr('rx', 3)
      .attr('fill', (_d, i) => getBarColor(i, step, n))
      .style('cursor', 'pointer')
      .style('filter', 'none')
      .on('mouseenter', function () {
        d3.select(this)
          .transition().duration(150)
          .style('filter', 'brightness(1.3) drop-shadow(0 0 6px rgba(255,107,53,0.3))')
          .attr('rx', 5);
      })
      .on('mouseleave', function () {
        d3.select(this)
          .transition().duration(300)
          .style('filter', 'none')
          .attr('rx', 3);
      });

    bars
      .merge(barsEnter)
      .transition()
      .duration(transitionDuration)
      .ease(d3.easeCubicInOut)
      .attr('x', (_d, i) => xScale(i))
      .attr('width', xScale.bandwidth())
      .attr('y', (d) => {
        const h = Math.max(MIN_BAR_HEIGHT, yScale(Math.abs(d)));
        return innerHeight - h;
      })
      .attr('height', (d) => Math.max(MIN_BAR_HEIGHT, yScale(Math.abs(d))))
      .attr('fill', (_d, i) => getBarColor(i, step, n));

    bars
      .exit()
      .transition()
      .duration(transitionDuration)
      .ease(d3.easeCubicInOut)
      .attr('height', 0)
      .attr('y', innerHeight)
      .remove();

    /* ── Value labels (below bars) ── */
    const valLabels = g.selectAll('.val-label').data(data, (_d, i) => i);

    const valEnter = valLabels
      .enter()
      .append('text')
      .attr('class', 'val-label')
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--text-primary)')
      .attr('font-family', '"JetBrains Mono", monospace')
      .attr('font-size', 10)
      .attr('y', innerHeight + 15);

    valLabels
      .merge(valEnter)
      .attr('fill', 'var(--text-primary)')
      .transition()
      .duration(transitionDuration)
      .ease(d3.easeCubicInOut)
      .attr('x', (_d, i) => xScale(i) + xScale.bandwidth() / 2)
      .attr('y', innerHeight + 15)
      .attr('font-size', Math.min(10, xScale.bandwidth() * 0.45))
      .text((d) => d);

    valLabels.exit().remove();

    /* ── Index badges (above bars) — clear, visible ── */
    const idxBgs = g.selectAll('.idx-bg').data(data, (_d, i) => i);

    const idxBgEnter = idxBgs
      .enter()
      .append('rect')
      .attr('class', 'idx-bg')
      .attr('rx', 4)
      .attr('fill', 'var(--accent-primary)')
      .attr('opacity', 0.15);

    const badgeW = Math.min(22, xScale.bandwidth() * 0.6);
    const badgeH = 16;

    idxBgs
      .merge(idxBgEnter)
      .transition()
      .duration(transitionDuration)
      .ease(d3.easeCubicInOut)
      .attr('x', (_d, i) => xScale(i) + xScale.bandwidth() / 2 - badgeW / 2)
      .attr('y', (d) => {
        const h = Math.max(MIN_BAR_HEIGHT, yScale(Math.abs(d)));
        return innerHeight - h - badgeH - 4;
      })
      .attr('width', badgeW)
      .attr('height', badgeH);

    idxBgs.exit().remove();

    const idxLabels = g.selectAll('.idx-label').data(data, (_d, i) => i);

    const idxEnter = idxLabels
      .enter()
      .append('text')
      .attr('class', 'idx-label')
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--accent-primary)')
      .attr('font-family', '"JetBrains Mono", monospace')
      .attr('font-weight', '600')
      .attr('font-size', 10);

    idxLabels
      .merge(idxEnter)
      .transition()
      .duration(transitionDuration)
      .ease(d3.easeCubicInOut)
      .attr('x', (_d, i) => xScale(i) + xScale.bandwidth() / 2)
      .attr('y', (d) => {
        const h = Math.max(MIN_BAR_HEIGHT, yScale(Math.abs(d)));
        return innerHeight - h - badgeH / 2 - 4 + 4;
      })
      .attr('font-size', Math.min(10, xScale.bandwidth() * 0.4))
      .text((_d, i) => i);

    idxLabels.exit().remove();
  }, [currentStep, steps, inputArray, dimensions, speed]);

  /* ── Step description pill ── */
  const step =
    currentStep >= 0 && currentStep < steps.length ? steps[currentStep] : null;
  const prefixLabel = step ? `[${step.type.toUpperCase()}]` : null;
  const prefixColor = step ? BADGE_PREFIX_COLORS[step.type] || '#8892B0' : null;

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* SVG container — fills all available space */}
      <div ref={containerRef} className="flex-1 min-h-0 w-full">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full"
        >
          {/* Gradient definitions for bar fills */}
          <defs>
            {Object.entries(GRADIENT_COLORS).map(([key, [light, dark]]) => (
              <linearGradient key={key} id={`bar-gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={light} stopOpacity="0.95" />
                <stop offset="100%" stopColor={dark} stopOpacity="1" />
              </linearGradient>
            ))}
          </defs>
        </svg>
      </div>

      {/* Step description moved to Controls component */}
    </div>
  );
}

Visualizer.propTypes = {};
