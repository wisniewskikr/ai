export class ScopeViolationError extends Error {
  constructor(model: string, tokenName: string) {
    super(`model '${model}' not in scope for '${tokenName}'`);
    this.name = "ScopeViolationError";
  }
}

export class TokenExpiredError extends Error {
  constructor(tokenName: string, minutesAgo: number) {
    super(`token '${tokenName}' expired ${minutesAgo} minutes ago`);
    this.name = "TokenExpiredError";
  }
}

interface TokenConfig {
  apiKey: string;
  scope: string[];
  expiresAt: Date;
  ttlMinutes: number;
  refreshFn?: () => Promise<string>;
}

export interface AuditEntry {
  timestamp: Date;
  tokenName: string;
  model: string;
  tokens: number;
}

export class TokenVault {
  private tokens = new Map<string, TokenConfig>();
  private log: AuditEntry[] = [];

  register(name: string, apiKey: string, scope: string[], expiresInMinutes: number, refreshFn?: () => Promise<string>): void {
    this.tokens.set(name, {
      apiKey,
      scope,
      expiresAt: new Date(Date.now() + expiresInMinutes * 60 * 1000),
      ttlMinutes: expiresInMinutes,
      refreshFn,
    });
  }

  async getApiKey(tokenName: string, model: string): Promise<string> {
    const token = this.tokens.get(tokenName);
    if (!token) throw new Error(`Token '${tokenName}' not found`);

    const now = new Date();
    if (now > token.expiresAt) {
      if (token.refreshFn) {
        const newKey = await token.refreshFn();
        token.apiKey = newKey;
        token.expiresAt = new Date(Date.now() + token.ttlMinutes * 60 * 1000);
      } else {
        const minutesAgo = Math.round((now.getTime() - token.expiresAt.getTime()) / 60000);
        throw new TokenExpiredError(tokenName, minutesAgo);
      }
    }

    if (!token.scope.includes(model)) {
      throw new ScopeViolationError(model, tokenName);
    }

    return token.apiKey;
  }

  recordUsage(tokenName: string, model: string, tokens: number): void {
    this.log.push({ timestamp: new Date(), tokenName, model, tokens });
  }

  getAuditLog(): AuditEntry[] {
    return [...this.log];
  }

  getTtlMinutes(tokenName: string): number {
    const token = this.tokens.get(tokenName);
    if (!token) return 0;
    return Math.max(0, Math.round((token.expiresAt.getTime() - Date.now()) / 60000));
  }
}
