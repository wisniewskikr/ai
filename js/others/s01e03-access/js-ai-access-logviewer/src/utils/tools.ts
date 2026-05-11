import { logAction, getRecentLogs } from '../services/logger.js';

// Simulated access control list — read-only data
const ACCESS_RULES: Record<string, string[]> = {
  'user:42': ['/reports/q4.pdf', '/data/customers.csv', '/reports/'],
  'user:1':  ['/reports/', '/data/'],
};

// Paths that are always forbidden
const FORBIDDEN_PATHS = ['/system/', '/admin/', '/root/'];

// Simulated file registry — read-only metadata, no file contents
const FILE_METADATA: Record<string, Record<string, string>> = {
  '/reports/q4.pdf':     { size: '2.4MB', owner: 'finance', modified: '2026-04-30', type: 'PDF' },
  '/data/customers.csv': { size: '15MB',  owner: 'sales',   modified: '2026-05-01', type: 'CSV' },
  '/admin/secrets.db':   { size: '512KB', owner: 'admin',   modified: '2026-05-10', type: 'SQLite' },
};

export function check_user_access(userId: string, resource: string): string {
  const isForbidden = FORBIDDEN_PATHS.some(p => resource.startsWith(p));
  if (isForbidden) {
    const result = `Access DENIED: ${userId} cannot access restricted path ${resource}`;
    logAction('check_user_access', `${userId}, ${resource}`, result, 'DENIED');
    return result;
  }

  const allowed = ACCESS_RULES[userId] ?? [];
  const hasAccess = allowed.some(p => resource.startsWith(p));

  if (hasAccess) {
    const result = `Access GRANTED: ${userId} can access ${resource}`;
    logAction('check_user_access', `${userId}, ${resource}`, result, 'OK');
    return result;
  }

  const result = `Access DENIED: ${userId} has no permission for ${resource}`;
  logAction('check_user_access', `${userId}, ${resource}`, result, 'DENIED');
  return result;
}

export function get_file_metadata(filePath: string): string {
  const isForbidden = FORBIDDEN_PATHS.some(p => filePath.startsWith(p));
  if (isForbidden) {
    const result = `ERROR: Access to ${filePath} is forbidden`;
    logAction('get_file_metadata', filePath, result, 'ERROR');
    return result;
  }

  const meta = FILE_METADATA[filePath];
  if (!meta) {
    const result = `ERROR: File not found: ${filePath}`;
    logAction('get_file_metadata', filePath, result, 'ERROR');
    return result;
  }

  const result = JSON.stringify(meta);
  logAction('get_file_metadata', filePath, result, 'OK');
  return result;
}

export function list_recent_actions(limit: number): string {
  const logs = getRecentLogs(limit);
  const result = JSON.stringify(logs);
  logAction('list_recent_actions', `limit:${limit}`, `${logs.length} entries returned`, 'OK');
  return result;
}
