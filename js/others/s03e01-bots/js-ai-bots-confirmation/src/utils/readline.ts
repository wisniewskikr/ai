import * as rl from 'readline/promises';
import { stdin as input, stdout as output } from 'process';

const iface = rl.createInterface({ input, output });

export async function ask(question: string): Promise<string> {
  const answer = await iface.question(question);
  return answer.trim();
}

export function close(): void {
  iface.close();
}
