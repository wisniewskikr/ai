import * as fs from 'fs';
import * as path from 'path';

interface Node {
  id: string;
  name: string;
  title: string;
}

interface Edge {
  from: string;
  to: string;
}

interface Graph {
  nodes: Node[];
  edges: Edge[];
}

let cachedGraph: Graph | null = null;

function loadGraph(): Graph {
  if (cachedGraph) return cachedGraph;
  const graphPath = path.join(__dirname, '../../data/graph.json');
  cachedGraph = JSON.parse(fs.readFileSync(graphPath, 'utf-8')) as Graph;
  return cachedGraph;
}

function findNode(name: string): Node | undefined {
  const g = loadGraph();
  const lower = name.toLowerCase();
  // Exact match first, then first-name-only fallback
  return (
    g.nodes.find(n => n.name.toLowerCase() === lower) ??
    g.nodes.find(n => n.name.toLowerCase().split(' ')[0] === lower)
  );
}

export function getDirectReports(name: string): {
  found: boolean;
  person?: Node;
  reports: Node[];
} {
  const g = loadGraph();
  const person = findNode(name);
  if (!person) return { found: false, reports: [] };

  const reportIds = g.edges.filter(e => e.from === person.id).map(e => e.to);
  const reports = g.nodes.filter(n => reportIds.includes(n.id));
  return { found: true, person, reports };
}

export function getManager(name: string): {
  found: boolean;
  person?: Node;
  manager?: Node;
} {
  const g = loadGraph();
  const person = findNode(name);
  if (!person) return { found: false };

  const managerEdge = g.edges.find(e => e.to === person.id);
  const manager = managerEdge ? g.nodes.find(n => n.id === managerEdge.from) : undefined;
  return { found: true, person, manager };
}

export function getAllNodes(): { nodes: Node[]; edges: Edge[] } {
  const g = loadGraph();
  return { nodes: g.nodes, edges: g.edges };
}

export function getNodeNames(): string[] {
  return loadGraph().nodes.map(n => n.name);
}
