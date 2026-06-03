import { activeWindow } from 'active-win';

export async function getActiveWindowTitle(): Promise<string | null> {
  const win = await activeWindow();
  return win?.title ?? null;
}
