import * as fs from 'fs';
import * as path from 'path';

export interface Node {
  id: string;
  label: string;
  properties: Record<string, string | number>;
}

export interface Edge {
  from: string;
  to: string;
  relation: string;
}

export interface KnowledgeGraph {
  nodes: Node[];
  edges: Edge[];
}

export function loadGraph(graphPath: string): KnowledgeGraph {
  const filePath = path.join(process.cwd(), graphPath);
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as KnowledgeGraph;
}

export function searchNodes(graph: KnowledgeGraph, query: string): Node[] {
  const keywords = query.toLowerCase().split(/\s+/).filter(k => k.length > 0);

  return graph.nodes.filter(node => {
    const targets = [
      node.id,
      node.label,
      ...Object.values(node.properties).map(String),
    ].map(s => s.toLowerCase());

    return keywords.some(keyword =>
      targets.some(target => target.includes(keyword))
    );
  });
}

export function getNeighbors(graph: KnowledgeGraph, nodeIds: string[], depth: number): Node[] {
  const visited = new Set<string>(nodeIds);
  const queue: Array<{ id: string; currentDepth: number }> = nodeIds.map(id => ({ id, currentDepth: 0 }));
  const result: Node[] = [];

  const nodeMap = new Map<string, Node>(graph.nodes.map(n => [n.id, n]));

  for (const id of nodeIds) {
    const node = nodeMap.get(id);
    if (node) result.push(node);
  }

  while (queue.length > 0) {
    const { id, currentDepth } = queue.shift()!;
    if (currentDepth >= depth) continue;

    const connected = graph.edges
      .filter(e => e.from === id || e.to === id)
      .map(e => (e.from === id ? e.to : e.from));

    for (const neighborId of connected) {
      if (!visited.has(neighborId)) {
        visited.add(neighborId);
        const node = nodeMap.get(neighborId);
        if (node) {
          result.push(node);
          queue.push({ id: neighborId, currentDepth: currentDepth + 1 });
        }
      }
    }
  }

  return result;
}

export function buildContext(graph: KnowledgeGraph, query: string): string {
  const matched = searchNodes(graph, query);

  if (matched.length === 0) {
    return '(No relevant knowledge graph nodes found for this query.)';
  }

  const matchedIds = matched.map(n => n.id);
  const allNodes = getNeighbors(graph, matchedIds, 2);
  const allNodeIds = new Set(allNodes.map(n => n.id));

  const relevantEdges = graph.edges.filter(
    e => allNodeIds.has(e.from) && allNodeIds.has(e.to)
  );

  const nodeMap = new Map<string, Node>(allNodes.map(n => [n.id, n]));

  const nodeLines = allNodes.map(node => {
    const props = Object.entries(node.properties)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ');
    return `- ${node.properties['name'] ?? node.id} (${node.label}): ${props}`;
  });

  const edgeLines = relevantEdges.map(edge => {
    const fromNode = nodeMap.get(edge.from);
    const toNode = nodeMap.get(edge.to);
    const fromName = fromNode?.properties['name'] ?? edge.from;
    const toName = toNode?.properties['name'] ?? edge.to;
    return `- ${fromName} --${edge.relation}--> ${toName}`;
  });

  return `Nodes:\n${nodeLines.join('\n')}\n\nRelations:\n${edgeLines.join('\n')}`;
}
