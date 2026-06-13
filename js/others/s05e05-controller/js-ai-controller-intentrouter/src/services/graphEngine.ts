import { employees } from "../utils/employees";

// Adjacency list: manager id -> list of direct report ids
function buildGraph(): Map<string, string[]> {
  const graph = new Map<string, string[]>();

  for (const emp of employees) {
    if (!graph.has(emp.id)) graph.set(emp.id, []);
    if (emp.reportsTo) {
      if (!graph.has(emp.reportsTo)) graph.set(emp.reportsTo, []);
      graph.get(emp.reportsTo)!.push(emp.id);
    }
  }

  return graph;
}

function findEmployeeByName(name: string) {
  return employees.find(
    (e) => e.name.toLowerCase() === name.toLowerCase()
  );
}

function findDirectReports(managerId: string): string {
  const graph = buildGraph();
  const reportIds = graph.get(managerId) ?? [];

  if (reportIds.length === 0) return "No direct reports found.";

  const manager = employees.find((e) => e.id === managerId)!;
  const reports = reportIds.map((id) => {
    const emp = employees.find((e) => e.id === id)!;
    return `${emp.name} (${emp.title})`;
  });

  return `${manager.name} -> ${reports.join(", ")}`;
}

// BFS shortest path between two nodes
function findPath(fromId: string, toId: string): string {
  if (fromId === toId) {
    const emp = employees.find((e) => e.id === fromId)!;
    return emp.name;
  }

  // Build undirected adjacency list for path finding
  const adjacency = new Map<string, string[]>();
  for (const emp of employees) {
    if (!adjacency.has(emp.id)) adjacency.set(emp.id, []);
    if (emp.reportsTo) {
      if (!adjacency.has(emp.reportsTo)) adjacency.set(emp.reportsTo, []);
      adjacency.get(emp.id)!.push(emp.reportsTo);
      adjacency.get(emp.reportsTo)!.push(emp.id);
    }
  }

  const visited = new Set<string>();
  const queue: { id: string; path: string[] }[] = [{ id: fromId, path: [fromId] }];
  visited.add(fromId);

  while (queue.length > 0) {
    const { id, path } = queue.shift()!;
    const neighbors = adjacency.get(id) ?? [];

    for (const neighbor of neighbors) {
      if (visited.has(neighbor)) continue;
      const newPath = [...path, neighbor];

      if (neighbor === toId) {
        return newPath
          .map((nodeId) => {
            const emp = employees.find((e) => e.id === nodeId)!;
            return `${emp.name} (${emp.title})`;
          })
          .join(" -> ");
      }

      visited.add(neighbor);
      queue.push({ id: neighbor, path: newPath });
    }
  }

  return "No path found between the two employees.";
}

export function query(question: string): string {
  const lower = question.toLowerCase();

  // Detect "path between X and Y"
  const pathMatch = lower.match(/path.*between\s+(\w+)\s+and\s+(\w+)/);
  if (pathMatch) {
    const a = findEmployeeByName(pathMatch[1]);
    const b = findEmployeeByName(pathMatch[2]);
    if (!a || !b) return "Could not find one or both employees mentioned.";
    return findPath(a.id, b.id);
  }

  // Detect "who reports to X" or "reports to X"
  const reportsMatch = lower.match(/reports?\s+to\s+(\w+)/);
  if (reportsMatch) {
    const manager = findEmployeeByName(reportsMatch[1]);
    if (!manager) return `Employee "${reportsMatch[1]}" not found.`;
    return findDirectReports(manager.id);
  }

  // Fallback: list all reporting relations
  const graph = buildGraph();
  const lines: string[] = [];
  for (const emp of employees) {
    const reports = graph.get(emp.id) ?? [];
    if (reports.length > 0) {
      const reportNames = reports.map((id) => {
        const e = employees.find((x) => x.id === id)!;
        return e.name;
      });
      lines.push(`${emp.name} -> ${reportNames.join(", ")}`);
    }
  }
  return lines.join("\n");
}
