/**
 * @file Visualizer.jsx
 * @description D3.js-powered SVG bar chart that visualizes the current state
 *              of the array at each algorithm step. Bars are color-coded by
 *              step type (compare, swap, sorted) and animate smoothly.
 * @exports Visualizer (default)
 */

import { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { useTrace } from '../context/TraceContext';

/** Padding inside the SVG in pixels. */
const PADDING = { top: 30, right: 20, bottom: 40, left: 20 };

/** Fraction of the step speed used for D3 transition duration. */
const TRANSITION_RATIO = 0.4;

/** Minimum gap between bars in pixels. */
const BAR_GAP = 4;

/**
 * Determine the fill color for a bar based on the current step.
 *
 * @param {number}      index - Index of the bar in the array.
 * @param {Object|null} step  - Current step object, or null if not started.
 * @param {number}      total - Total number of elements in the array.
 * @returns {string} CSS color value.
 */
function getBarColor(index, step, total) {
  if (!step) return 'var(--color-bar)';

  if (step.type === 'done') return 'var(--color-sorted)';
  if (step.type === 'sorted') {
    if (step.indices.includes(index)) return 'var(--color-sorted)';
    /* Elements beyond the sorted boundary are also sorted. */
    if (index >= total - step.pass - 1 && step.pass >= 0) return 'var(--color-sorted)';
  }
  if (step.type === 'swap' && step.indices.includes(index)) return 'var(--color-swap)';
  if (step.type === 'compare' && step.indices.includes(index)) return 'var(--color-compare)';

  /* Check if this index is in a previously sorted region. */
  if (step.pass >= 0 && index > total - 1 - step.pass) return 'var(--color-sorted)';

  return 'var(--color-bar)';
}

/**
 * SVG bar chart visualizer for algorithm steps.
 *
 * @returns {JSX.Element}
 */
export default function Visualizer() {
  const { state } = useTrace();
  const { inputArray, steps, currentStep, speed } = state;

  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 350 });

  /* Observe container size for responsive SVG. */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        setDimensions({ width, height: Math.max(250, Math.min(400, width * 0.5)) });
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  /* Draw / update bars whenever the step or dimensions change. */
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const step = currentStep >= 0 && currentStep < steps.length ? steps[currentStep] : null;
    const data = step ? step.array : inputArray;
    const n = data.length;

    const innerWidth = dimensions.width - PADDING.left - PADDING.right;
    const innerHeight = dimensions.height - PADDING.top - PADDING.bottom;

    /* Scales */
    const xScale = d3
      .scaleBand()
      .domain(d3.range(n))
      .range([0, innerWidth])
      .padding(0.15);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => Math.abs(d)) || 1])
      .nice()
      .range([0, innerHeight]);

    const transitionDuration = speed * TRANSITION_RATIO;

    /* Root group */
    let g = svg.select('.chart-group');
    if (g.empty()) {
      g = svg.append('g').attr('class', 'chart-group');
    }
    g.attr('transform', `translate(${PADDING.left}, ${PADDING.top})`);

    /* ── Bars (enter / update / exit) ── */
    const bars = g.selectAll('.bar').data(data, (_d, i) => i);

    /* Enter */
    const barsEnter = bars
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (_d, i) => xScale(i))
      .attr('y', innerHeight)
      .attr('width', xScale.bandwidth())
      .attr('height', 0)
      .attr('rx', 4)
      .attr('fill', (_d, i) => getBarColor(i, step, n));

    /* Update (merge enter + existing) */
    bars
      .merge(barsEnter)
      .transition()
      .duration(transitionDuration)
      .attr('x', (_d, i) => xScale(i))
      .attr('width', xScale.bandwidth())
      .attr('y', (d) => innerHeight - yScale(Math.abs(d)))
      .attr('height', (d) => yScale(Math.abs(d)))
      .attr('fill', (_d, i) => getBarColor(i, step, n));

    /* Exit */
    bars.exit().transition().duration(transitionDuration).attr('height', 0).attr('y', innerHeight).remove();

    /* ── Value labels (below bars) ── */
    const valLabels = g.selectAll('.val-label').data(data, (_d, i) => i);

    const valEnter = valLabels
      .enter()
      .append('text')
      .attr('class', 'val-label')
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--color-text)')
      .attr('font-size', Math.min(14, xScale.bandwidth() * 0.45))
      .attr('y', innerHeight + 18);

    valLabels
      .merge(valEnter)
      .transition()
      .duration(transitionDuration)
      .attr('x', (_d, i) => xScale(i) + xScale.bandwidth() / 2)
      .attr('y', innerHeight + 18)
      .attr('font-size', Math.min(14, xScale.bandwidth() * 0.45))
      .text((d) => d);

    valLabels.exit().remove();

    /* ── Index labels (above bars) ── */
    const idxLabels = g.selectAll('.idx-label').data(data, (_d, i) => i);

    const idxEnter = idxLabels
      .enter()
      .append('text')
      .attr('class', 'idx-label')
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--color-bar)')
      .attr('font-size', Math.min(11, xScale.bandwidth() * 0.35))
      .attr('opacity', 0.7);

    idxLabels
      .merge(idxEnter)
      .transition()
      .duration(transitionDuration)
      .attr('x', (_d, i) => xScale(i) + xScale.bandwidth() / 2)
      .attr('y', (d) => innerHeight - yScale(Math.abs(d)) - 6)
      .attr('font-size', Math.min(11, xScale.bandwidth() * 0.35))
      .text((_d, i) => i);

    idxLabels.exit().remove();
  }, [currentStep, steps, inputArray, dimensions, speed]);

  return (
    <div ref={containerRef} className="card w-full min-h-[250px] flex items-center justify-center">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full"
      />
    </div>
  );
}
