function timestamp(): string {
  const now = new Date();
  const y = now.getFullYear();
  const mo = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const h = String(now.getHours()).padStart(2, '0');
  const mi = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  return `${y}-${mo}-${d} ${h}:${mi}:${s}`;
}

export function logInfo(msg: string): void {
  console.log(`[${timestamp()}] [INFO]  ${msg}`);
}

export function logWarn(msg: string): void {
  console.warn(`[${timestamp()}] [WARN]  ${msg}`);
}

export function logError(msg: string): void {
  console.error(`[${timestamp()}] [ERROR] ${msg}`);
}
