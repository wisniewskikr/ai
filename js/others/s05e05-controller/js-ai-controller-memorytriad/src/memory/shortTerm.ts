export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export class ShortTermMemory {
  private messages: Message[] = [];
  private readonly maxMessages: number;

  constructor(maxMessages: number) {
    this.maxMessages = maxMessages;
  }

  add(role: 'user' | 'assistant', content: string): void {
    this.messages.push({ role, content });
    while (this.messages.length > this.maxMessages) {
      this.messages.shift();
    }
  }

  getMessages(): Message[] {
    return [...this.messages];
  }

  clear(): void {
    this.messages = [];
  }

  isEmpty(): boolean {
    return this.messages.length === 0;
  }
}
