/**
 * @file graphBFS.js
 * @description Graph BFS (Breadth-First Search) step generator for TraceFlow V2.
 *              Checks if a valid path exists between source and destination nodes
 *              using BFS traversal on an undirected graph. Produces step objects
 *              that capture every queue operation, node visit, edge exploration,
 *              and path discovery for frame-by-frame visualization.
 * @exports generateSteps, metadata, pseudoCode
 */

/** Algorithm metadata displayed in the UI. */
export const metadata = {
  name: 'Graph BFS',
  slug: 'graph-bfs',
  category: 'Graph',
  difficulty: 'Beginner',
  timeComplexity: { best: 'O(V+E)', average: 'O(V+E)', worst: 'O(V+E)' },
  spaceComplexity: 'O(V)',
  complexityNote: 'V = number of vertices, E = number of edges',
  stable: null,
  description:
    'Finds if a valid path exists between two nodes in an undirected graph using Breadth-First Search. Builds an adjacency list, then explores nodes level by level using a queue until the destination is found or all reachable nodes are exhausted.',
  icon: 'graph',
};

/**
 * Pseudocode for the Graph BFS algorithm.
 * @type {Array<{ line: number, code: string }>}
 */
export const pseudoCode = [
  { line: 0, code: 'function validPath(n, edges, source, dest)' },
  { line: 1, code: '  graph = buildAdjacencyList(n, edges)' },
  { line: 2, code: '  visited = new boolean[n]' },
  { line: 3, code: '  queue = [source]' },
  { line: 4, code: '  visited[source] = true' },
  { line: 5, code: '  while queue is not empty' },
  { line: 6, code: '    node = queue.dequeue()' },
  { line: 7, code: '    if node == destination → return true' },
  { line: 8, code: '    for each neighbor of node' },
  { line: 9, code: '      if not visited[neighbor]' },
  { line: 10, code: '        visited[neighbor] = true' },
  { line: 11, code: '        queue.enqueue(neighbor)' },
  { line: 12, code: '  return false  // no path found' },
];

/** Hard cap to prevent runaway step generation. */
const MAX_STEPS = 2000;

/**
 * Preset graph configurations for demonstration.
 */
const PRESETS = {
  simple: {
    n: 6,
    edges: [[0,1],[0,2],[1,3],[2,3],[3,4],[4,5]],
    source: 0,
    destination: 5,
    label: 'Simple Path',
  },
  disconnected: {
    n: 6,
    edges: [[0,1],[1,2],[3,4],[4,5]],
    source: 0,
    destination: 5,
    label: 'Disconnected',
  },
  cyclic: {
    n: 7,
    edges: [[0,1],[1,2],[2,3],[3,0],[3,4],[4,5],[5,6],[6,4]],
    source: 0,
    destination: 6,
    label: 'Cyclic Graph',
  },
  tree: {
    n: 7,
    edges: [[0,1],[0,2],[1,3],[1,4],[2,5],[2,6]],
    source: 0,
    destination: 6,
    label: 'Binary Tree',
  },
  dense: {
    n: 6,
    edges: [[0,1],[0,2],[0,3],[1,2],[1,4],[2,3],[2,4],[3,5],[4,5]],
    source: 0,
    destination: 5,
    label: 'Dense Graph',
  },
};

export { PRESETS };

/**
 * Generate a random connected graph.
 * @param {number} n - Number of nodes.
 * @returns {{ edges: number[][], source: number, destination: number }}
 */
function generateRandomGraph(n) {
  const edges = [];
  const edgeSet = new Set();

  /* Ensure connectivity: create a spanning path first */
  const nodes = Array.from({ length: n }, (_, i) => i);
  for (let i = 1; i < n; i++) {
    const j = Math.floor(Math.random() * i);
    const u = Math.min(nodes[i], nodes[j]);
    const v = Math.max(nodes[i], nodes[j]);
    const key = `${u},${v}`;
    if (!edgeSet.has(key)) {
      edgeSet.add(key);
      edges.push([u, v]);
    }
  }

  /* Add extra random edges for density */
  const extraEdges = Math.floor(n * 0.6);
  let attempts = 0;
  while (edges.length < n - 1 + extraEdges && attempts < n * n) {
    attempts++;
    const u = Math.floor(Math.random() * n);
    const v = Math.floor(Math.random() * n);
    if (u === v) continue;
    const a = Math.min(u, v);
    const b = Math.max(u, v);
    const key = `${a},${b}`;
    if (!edgeSet.has(key)) {
      edgeSet.add(key);
      edges.push([a, b]);
    }
  }

  const source = 0;
  const destination = n - 1;

  return { edges, source, destination };
}

/**
 * Build an adjacency list from edges.
 * Each neighbor list is sorted in ascending order so BFS explores
 * neighbors deterministically (smallest-ID first). This ensures
 * parent pointers and the reconstructed shortest path always match
 * the intuitive left-to-right BFS traversal a student would expect.
 * @param {number} n
 * @param {number[][]} edges
 * @returns {number[][]}
 */
function buildAdjList(n, edges) {
  const adj = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) {
    adj[u].push(v);
    adj[v].push(u);
  }
  /* Sort each neighbor list for deterministic BFS order */
  for (let i = 0; i < n; i++) {
    adj[i].sort((a, b) => a - b);
  }
  return adj;
}

/**
 * Generate an array of step objects representing a full BFS execution on a graph.
 *
 * @param {{ n?: number, edges?: number[][], source?: number, destination?: number, preset?: string }} [params]
 * @returns {Array<Object>} Ordered list of steps.
 */
export function generateSteps({
  n: inputN,
  edges: inputEdges,
  source: inputSource,
  destination: inputDest,
  preset,
} = {}) {
  let n, edges, source, destination;

  if (preset && PRESETS[preset]) {
    ({ n, edges, source, destination } = PRESETS[preset]);
  } else if (inputEdges) {
    n = inputN || 0;
    edges = inputEdges;
    /* Ensure n covers all edge vertices */
    for (const [u, v] of edges) {
      n = Math.max(n, u + 1, v + 1);
    }
    source = inputSource ?? 0;
    destination = inputDest ?? n - 1;
  } else {
    const gen = generateRandomGraph(inputN || 7);
    n = inputN || 7;
    edges = gen.edges;
    source = gen.source;
    destination = gen.destination;
  }

  const adj = buildAdjList(n, edges);
  const steps = [];

  let comparisons = 0;
  let edgesExplored = 0;
  let pass = 0;

  /**
   * Node states:
   *   'default'    - not yet touched
   *   'queued'     - in the BFS queue
   *   'visiting'   - currently being dequeued/processed
   *   'visited'    - fully processed
   *   'found'      - destination found
   *   'path'       - part of the solution path
   */
  const nodeStates = Array(n).fill('default');

  /**
   * Edge states:
   *   'default'    - not yet explored
   *   'exploring'  - currently being checked
   *   'traversed'  - traversed during BFS
   *   'path'       - part of solution path
   */
  const edgeStates = {};
  for (const [u, v] of edges) {
    edgeStates[`${u},${v}`] = 'default';
    edgeStates[`${v},${u}`] = 'default';
  }

  /** Parent map for path reconstruction. */
  const parent = Array(n).fill(-1);

  /** Helper: create a snapshot */
  function snapshot() {
    return {
      nodeStates: [...nodeStates],
      edgeStates: { ...edgeStates },
      n,
      edges: edges.map(e => [...e]),
      adj: adj.map(a => [...a]),
      source,
      destination,
    };
  }

  /** Helper: push a step */
  function pushStep(step) {
    steps.push(step);
    return steps.length < MAX_STEPS;
  }

  /* ── Step 0: Build adjacency list ── */
  if (!pushStep({
    type: 'build',
    description: `Building adjacency list for ${n} nodes and ${edges.length} edges.`,
    activeLines: [0, 1],
    comparisons,
    swaps: edgesExplored,
    pass,
    ...snapshot(),
    activeNode: -1,
    activeEdge: null,
    queue: [],
  })) return steps;

  /* ── Step 1: Initialize BFS ── */
  nodeStates[source] = 'queued';
  const queue = [source];
  const visited = new Array(n).fill(false);
  visited[source] = true;

  if (!pushStep({
    type: 'init',
    description: `Initialize BFS: mark node ${source} as visited, add to queue.`,
    activeLines: [2, 3, 4],
    comparisons,
    swaps: edgesExplored,
    pass,
    ...snapshot(),
    activeNode: source,
    activeEdge: null,
    queue: [...queue],
  })) return steps;

  /* ── BFS loop ── */
  while (queue.length > 0) {
    if (steps.length >= MAX_STEPS) break;

    const node = queue.shift();
    nodeStates[node] = 'visiting';
    pass++;

    /* Dequeue step */
    if (!pushStep({
      type: 'dequeue',
      description: `Dequeue node ${node} from the front of the queue.`,
      activeLines: [5, 6],
      comparisons,
      swaps: edgesExplored,
      pass,
      ...snapshot(),
      activeNode: node,
      activeEdge: null,
      queue: [...queue],
    })) return steps;

    /* Check if destination reached */
    comparisons++;
    if (node === destination) {
      nodeStates[node] = 'found';

      /* Reconstruct path */
      const path = [];
      let cur = destination;
      while (cur !== -1) {
        path.unshift(cur);
        cur = parent[cur];
      }

      /* Mark path nodes and edges */
      for (const pn of path) nodeStates[pn] = 'path';
      for (let i = 0; i < path.length - 1; i++) {
        const u = path[i], v = path[i + 1];
        edgeStates[`${u},${v}`] = 'path';
        edgeStates[`${v},${u}`] = 'path';
      }

      pushStep({
        type: 'done',
        description: `Path found! ${source} → ${destination} (length: ${path.length} nodes). Path: ${path.join(' → ')}`,
        activeLines: [7],
        comparisons,
        swaps: edgesExplored,
        pass: -1,
        ...snapshot(),
        activeNode: destination,
        activeEdge: null,
        queue: [...queue],
        path,
      });
      return steps;
    }

    /* Not destination — continue checking step */
    if (!pushStep({
      type: 'check',
      description: `Node ${node} ≠ destination ${destination}. Exploring neighbors...`,
      activeLines: [7, 8],
      comparisons,
      swaps: edgesExplored,
      pass,
      ...snapshot(),
      activeNode: node,
      activeEdge: null,
      queue: [...queue],
    })) return steps;

    /* Explore neighbors */
    for (const neighbor of adj[node]) {
      if (steps.length >= MAX_STEPS) break;
      edgesExplored++;
      comparisons++;

      /* Mark edge as exploring */
      edgeStates[`${node},${neighbor}`] = 'exploring';
      edgeStates[`${neighbor},${node}`] = 'exploring';

      if (!visited[neighbor]) {
        visited[neighbor] = true;
        parent[neighbor] = node;
        nodeStates[neighbor] = 'queued';
        queue.push(neighbor);

        edgeStates[`${node},${neighbor}`] = 'traversed';
        edgeStates[`${neighbor},${node}`] = 'traversed';

        if (!pushStep({
          type: 'enqueue',
          description: `Node ${neighbor} not visited — mark visited, enqueue. (via edge ${node}→${neighbor})`,
          activeLines: [9, 10, 11],
          comparisons,
          swaps: edgesExplored,
          pass,
          ...snapshot(),
          activeNode: neighbor,
          activeEdge: [node, neighbor],
          queue: [...queue],
        })) return steps;
      } else {
        edgeStates[`${node},${neighbor}`] = 'traversed';
        edgeStates[`${neighbor},${node}`] = 'traversed';

        if (!pushStep({
          type: 'skip',
          description: `Node ${neighbor} already visited — skip.`,
          activeLines: [8, 9],
          comparisons,
          swaps: edgesExplored,
          pass,
          ...snapshot(),
          activeNode: node,
          activeEdge: [node, neighbor],
          queue: [...queue],
        })) return steps;
      }
    }

    /* Mark node as fully visited */
    nodeStates[node] = 'visited';
  }

  /* ── No path found ── */
  pushStep({
    type: 'no-solution',
    description: `No path exists from node ${source} to node ${destination}. All reachable nodes exhausted.`,
    activeLines: [12],
    comparisons,
    swaps: edgesExplored,
    pass: -1,
    ...snapshot(),
    activeNode: -1,
    activeEdge: null,
    queue: [],
  });

  return steps;
}
