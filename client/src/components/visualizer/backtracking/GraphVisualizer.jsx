/**
 * @file GraphVisualizer.jsx
 * @description D3 force-directed graph visualizer for BFS traversal. Renders
 *              nodes and edges with 2 distinct visual states:
 *              1. Visited/discovered (slate grey) — explored but NOT part of answer
 *              2. Shortest path (green) — only the actual answer path
 *              Side panels show the visited[] array and BFS queue in real-time.
 * @module components/visualizer/backtracking/GraphVisualizer
 */

import { useRef, useEffect, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { useTrace } from '../../../context/TraceContext';

/* ── 2-state node color mapping: visited (grey) + path (green) ── */
const NODE_COLORS = {
  default: '#1E293B',           // untouched — dark slate
  queued:  '#64748B',           // in queue — same as visited (discovered)
  visiting:'#64748B',           // processing — same as visited
  visited: '#64748B',           // fully explored — muted slate grey
  found:   '#00C896',           // destination found — green
  path:    '#00C896',           // final shortest path — green
};

/* ── Edge color mapping ── */
const EDGE_COLORS = {
  default:   '#334155',         // untouched — dark border
  exploring: '#475569',         // currently checking — neutral
  traversed: '#475569',         // explored — faded neutral
  path:      '#00C896',         // shortest path — green
};

const EDGE_WIDTHS = {
  default: 1.5,
  exploring: 2,
  traversed: 1.8,
  path: 3.5,
};

/**
 * D3 Force-directed graph visualizer for BFS.
 * @returns {JSX.Element}
 */
export default function GraphVisualizer() {
  const { state } = useTrace();
  const { steps, currentStep } = state;
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const simulationRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 });

  const step = currentStep >= 0 && currentStep < steps.length ? steps[currentStep] : null;

  /* Extract graph structure from first step — stable across step changes */
  const graphData = useMemo(() => {
    const s = steps.length > 0 ? steps[0] : null;
    if (!s || !s.n) return null;
    return {
      n: s.n,
      edges: s.edges,
      source: s.source,
      destination: s.destination,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [steps.length > 0 ? steps[0]?.n : 0, steps.length > 0 ? steps[0]?.source : 0, steps.length]);

  /* ── Responsive sizing ── */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const measure = () => {
      const w = container.clientWidth || 600;
      const h = container.clientHeight || 400;
      if (w > 0 && h > 0) setDimensions({ width: w, height: h });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  /* ── D3 Force Simulation + Rendering ── */
  useEffect(() => {
    if (!graphData) return;

    const { n, edges, source, destination } = graphData;
    const { width, height } = dimensions;
    const svg = d3.select(svgRef.current);

    const nodes = Array.from({ length: n }, (_, i) => ({
      id: i,
      label: String(i),
    }));

    const links = edges.map(([u, v]) => ({
      source: u,
      target: v,
      id: `${u}-${v}`,
    }));

    svg.selectAll('*').remove();

    /* ── Defs: filters ── */
    const defs = svg.append('defs');

    const glowFilter = defs.append('filter').attr('id', 'glow');
    glowFilter.append('feGaussianBlur').attr('stdDeviation', '4').attr('result', 'coloredBlur');
    const glowMerge = glowFilter.append('feMerge');
    glowMerge.append('feMergeNode').attr('in', 'coloredBlur');
    glowMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    const pathGlow = defs.append('filter').attr('id', 'path-glow');
    pathGlow.append('feGaussianBlur').attr('stdDeviation', '6').attr('result', 'coloredBlur');
    const pathMerge = pathGlow.append('feMerge');
    pathMerge.append('feMergeNode').attr('in', 'coloredBlur');
    pathMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    const g = svg.append('g').attr('class', 'graph-group');

    /* ── Zoom ── */
    const zoom = d3.zoom()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });
    svg.call(zoom);

    /* ── Force simulation ── */
    const nodeRadius = Math.max(18, Math.min(28, 200 / Math.sqrt(n)));
    const linkDistance = Math.max(80, Math.min(140, 500 / Math.sqrt(n)));

    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(linkDistance).strength(0.8))
      .force('charge', d3.forceManyBody().strength(-300).distanceMax(400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(nodeRadius + 8))
      .force('x', d3.forceX(width / 2).strength(0.05))
      .force('y', d3.forceY(height / 2).strength(0.05));

    simulationRef.current = simulation;

    /* ── Links ── */
    const linkGroup = g.append('g').attr('class', 'links');
    const link = linkGroup.selectAll('line')
      .data(links)
      .join('line')
      .attr('class', 'graph-edge')
      .attr('stroke', EDGE_COLORS.default)
      .attr('stroke-width', EDGE_WIDTHS.default)
      .attr('stroke-linecap', 'round')
      .attr('opacity', 0.6);

    /* ── Nodes ── */
    const nodeGroup = g.append('g').attr('class', 'nodes');
    const node = nodeGroup.selectAll('g')
      .data(nodes)
      .join('g')
      .attr('class', 'graph-node')
      .call(d3.drag()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x; d.fy = d.y;
        })
        .on('drag', (event, d) => { d.fx = event.x; d.fy = event.y; })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null; d.fy = null;
        })
      );

    /* Outer ring for source/destination */
    node.append('circle')
      .attr('class', 'node-ring')
      .attr('r', nodeRadius + 4)
      .attr('fill', 'none')
      .attr('stroke', d => d.id === source ? '#00C896' : d.id === destination ? '#FF4D6D' : 'none')
      .attr('stroke-width', 2.5)
      .attr('stroke-dasharray', d => d.id === destination ? '4 3' : 'none')
      .attr('opacity', 0.8);

    /* Main circle */
    node.append('circle')
      .attr('class', 'node-circle')
      .attr('r', nodeRadius)
      .attr('fill', NODE_COLORS.default)
      .attr('stroke', 'var(--border-subtle, #475569)')
      .attr('stroke-width', 1.5)
      .style('cursor', 'grab')
      .style('transition', 'fill 0.3s ease');

    /* Node label */
    node.append('text')
      .attr('class', 'node-label')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('fill', 'var(--text-primary, #E2E8F0)')
      .attr('font-family', '"JetBrains Mono", monospace')
      .attr('font-size', Math.min(14, nodeRadius * 0.65))
      .attr('font-weight', '700')
      .style('pointer-events', 'none')
      .text(d => d.label);

    /* Source / Dest labels */
    node.filter(d => d.id === source)
      .append('text')
      .attr('class', 'node-role-label')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'auto')
      .attr('y', -(nodeRadius + 10))
      .attr('fill', '#00C896')
      .attr('font-family', '"JetBrains Mono", monospace')
      .attr('font-size', 10)
      .attr('font-weight', '700')
      .text('SRC');

    node.filter(d => d.id === destination)
      .append('text')
      .attr('class', 'node-role-label')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'auto')
      .attr('y', -(nodeRadius + 10))
      .attr('fill', '#FF4D6D')
      .attr('font-family', '"JetBrains Mono", monospace')
      .attr('font-size', 10)
      .attr('font-weight', '700')
      .text('DST');

    /* ── Tick ── */
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x).attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    /* Settle and stop */
    for (let i = 0; i < 200; i++) simulation.tick();
    simulation.stop();

    link
      .attr('x1', d => d.source.x).attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
    node.attr('transform', d => `translate(${d.x},${d.y})`);

    /* Fit graph to viewport */
    const pad = 60;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    nodes.forEach(d => {
      if (d.x - nodeRadius < minX) minX = d.x - nodeRadius;
      if (d.y - nodeRadius - 15 < minY) minY = d.y - nodeRadius - 15;
      if (d.x + nodeRadius > maxX) maxX = d.x + nodeRadius;
      if (d.y + nodeRadius + 10 > maxY) maxY = d.y + nodeRadius + 10;
    });
    const gW = maxX - minX + pad * 2;
    const gH = maxY - minY + pad * 2;
    const scale = Math.min(width / gW, height / gH, 1.5);
    const tx = (width - gW * scale) / 2 - minX * scale + pad * scale;
    const ty = (height - gH * scale) / 2 - minY * scale + pad * scale;
    svg.call(zoom.transform, d3.zoomIdentity.translate(tx, ty).scale(scale));

    return () => { simulation.stop(); };
  }, [graphData, dimensions]);

  /* ── Update colors based on current step (2 states: visited grey + path green) ── */
  useEffect(() => {
    if (!graphData || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const s = step;

    if (!s) {
      svg.selectAll('.node-circle')
        .attr('fill', NODE_COLORS.default)
        .attr('filter', null)
        .attr('stroke', '#475569')
        .attr('stroke-width', 1.5);
      svg.selectAll('.graph-edge')
        .attr('stroke', EDGE_COLORS.default)
        .attr('stroke-width', EDGE_WIDTHS.default)
        .attr('opacity', 0.6);
      return;
    }

    const { nodeStates: ns, edgeStates: es } = s;

    svg.selectAll('.graph-node').each(function (d) {
      const nodeState = ns[d.id] || 'default';
      const circle = d3.select(this).select('.node-circle');
      const isPath = nodeState === 'path' || nodeState === 'found';
      const isVisited = nodeState === 'visited' || nodeState === 'queued' || nodeState === 'visiting';

      circle
        .transition()
        .duration(250)
        .attr('fill', NODE_COLORS[nodeState] || NODE_COLORS.default);

      if (isPath) {
        /* Shortest path — bright green with glow */
        circle
          .attr('filter', 'url(#path-glow)')
          .attr('stroke', '#34D399')
          .attr('stroke-width', 3);
      } else if (isVisited) {
        /* Visited / explored — muted grey, no glow */
        circle
          .attr('filter', null)
          .attr('stroke', '#94A3B8')
          .attr('stroke-width', 1.5);
      } else {
        /* Untouched */
        circle
          .attr('filter', null)
          .attr('stroke', '#475569')
          .attr('stroke-width', 1.5);
      }

      /* Label color for contrast */
      const label = d3.select(this).select('.node-label');
      if (isPath) {
        label.attr('fill', '#022C22');  // dark on green
      } else if (isVisited) {
        label.attr('fill', '#F1F5F9');  // light on grey
      } else {
        label.attr('fill', '#E2E8F0');  // light on dark
      }
    });

    /* Update edge colors */
    svg.selectAll('.graph-edge').each(function (d) {
      const key1 = `${d.source.id ?? d.source},${d.target.id ?? d.target}`;
      const key2 = `${d.target.id ?? d.target},${d.source.id ?? d.source}`;
      const edgeState = es[key1] || es[key2] || 'default';

      d3.select(this)
        .transition()
        .duration(250)
        .attr('stroke', EDGE_COLORS[edgeState] || EDGE_COLORS.default)
        .attr('stroke-width', EDGE_WIDTHS[edgeState] || EDGE_WIDTHS.default)
        .attr('opacity',
          edgeState === 'path' ? 1.0 :
          edgeState === 'traversed' || edgeState === 'exploring' ? 0.35 :
          0.3
        );
    });
  }, [step, graphData]);

  /* ── Derive visited array and queue from step ── */
  const n = graphData?.n || 0;
  const nodeStates = step?.nodeStates || [];
  const queueNodes = step?.queue || [];
  const pathResult = step?.path || null;

  /* Build visited[] display with state info */
  const visitedArr = useMemo(() => {
    if (!n) return [];
    return Array.from({ length: n }, (_, i) => {
      const st = nodeStates[i] || 'default';
      const isVisited = st === 'visited' || st === 'queued' || st === 'visiting' || st === 'found' || st === 'path';
      return { index: i, isVisited, state: st };
    });
  }, [n, nodeStates]);

  if (!graphData) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-tf-muted text-sm font-mono">
          Click &quot;Generate&quot; to start the visualization.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex gap-3">
      {/* ── Left side panel: Visited Array ── */}
      <div className="shrink-0 w-36 flex flex-col gap-2 py-2 overflow-y-auto">
        <div className="px-2">
          <h3 className="text-[10px] font-bold text-tf-muted uppercase tracking-widest mb-2">
            visited[]
          </h3>
          <div className="flex flex-col gap-1">
            {visitedArr.map(({ index: i, isVisited, state: st }) => {
              /* Color-code: path = green, visited/queued/visiting = grey, default = dark */
              const isPath = st === 'path' || st === 'found';
              let bg, border, color;
              if (isPath) {
                bg = '#00C896'; border = '#34D399'; color = '#022C22';
              } else if (isVisited) {
                bg = '#64748B'; border = '#94A3B8'; color = '#F1F5F9';
              } else {
                bg = 'var(--bg-card, #1E293B)'; border = 'var(--border-subtle, #334155)'; color = 'var(--text-muted, #64748B)';
              }
              return (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-tf-muted w-4 text-right shrink-0">{i}</span>
                  <div
                    className="flex-1 h-6 rounded-md flex items-center justify-center text-[11px] font-bold font-mono border transition-all duration-200"
                    style={{ backgroundColor: bg, borderColor: border, color }}
                  >
                    {isVisited ? 'true' : 'false'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend: 2 states — Visited + Shortest Path */}
        <div className="px-2 pt-2 mt-auto border-t border-[var(--border-subtle)]">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-full shrink-0 border border-[#94A3B8]" style={{ backgroundColor: '#64748B' }} />
              <span className="text-[10px] text-tf-text2 font-mono">Visited</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-full shrink-0 border border-[#34D399]" style={{ backgroundColor: '#00C896' }} />
              <span className="text-[10px] text-tf-text2 font-mono">Shortest Path</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Center: Graph SVG ── */}
      <div ref={containerRef} className="flex-1 min-h-0 min-w-0 relative">
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          className="w-full h-full"
          style={{ background: 'transparent' }}
        />
      </div>

      {/* ── Right side panel: Queue ── */}
      <div className="shrink-0 w-36 flex flex-col gap-2 py-2 overflow-y-auto">
        <div className="px-2">
          <h3 className="text-[10px] font-bold text-tf-muted uppercase tracking-widest mb-2">
            Queue (FIFO)
          </h3>
          {queueNodes.length > 0 ? (
            <div className="flex flex-col gap-1">
              {queueNodes.map((nodeId, i) => (
                <div
                  key={`${nodeId}-${i}`}
                  className="h-7 rounded-md flex items-center justify-between px-2 border transition-all duration-200"
                  style={{
                    backgroundColor: i === 0 ? 'var(--accent-primary, #6C63FF)' : 'var(--bg-card, #1E293B)',
                    borderColor: i === 0 ? 'var(--accent-primary, #6C63FF)' : 'var(--border-subtle, #334155)',
                    color: i === 0 ? '#FFFFFF' : 'var(--text-primary, #E2E8F0)',
                  }}
                >
                  <span className="text-[10px] font-mono text-inherit opacity-60">
                    {i === 0 ? 'front →' : `[${i}]`}
                  </span>
                  <span className="text-[12px] font-bold font-mono">{nodeId}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-7 rounded-md flex items-center justify-center border border-[var(--border-subtle)] bg-[var(--bg-card,#1E293B)]">
              <span className="text-[10px] font-mono text-tf-muted">
                {step ? 'empty' : '—'}
              </span>
            </div>
          )}
        </div>

        {/* Path result display */}
        {pathResult && (
          <div className="px-2 pt-2 mt-auto border-t border-[var(--border-subtle)]">
            <h3 className="text-[10px] font-bold text-[#00C896] uppercase tracking-widest mb-1.5">
              Path Found
            </h3>
            <div className="flex flex-wrap items-center gap-1">
              {pathResult.map((nodeId, i) => (
                <div key={i} className="flex items-center gap-1">
                  <span
                    className="inline-flex items-center justify-center w-6 h-6 rounded-md text-[11px] font-bold font-mono border"
                    style={{
                      backgroundColor: '#00C896',
                      borderColor: '#00C896',
                      color: '#0F172A',
                    }}
                  >
                    {nodeId}
                  </span>
                  {i < pathResult.length - 1 && (
                    <span className="text-[10px] text-[#00C896] font-mono">→</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No-solution indicator */}
        {step?.type === 'no-solution' && (
          <div className="px-2 pt-2 mt-auto border-t border-[var(--border-subtle)]">
            <div className="px-2 py-1.5 rounded-md bg-red-500/15 border border-red-500/30">
              <p className="text-[10px] text-red-400 font-bold text-center">No Path Exists</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

GraphVisualizer.propTypes = {};
