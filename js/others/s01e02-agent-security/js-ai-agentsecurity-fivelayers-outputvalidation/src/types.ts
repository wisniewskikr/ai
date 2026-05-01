export type ValidatorStatus = 'OK' | 'SAFE' | 'SUSPICIOUS' | 'BLOCK';

export interface ValidatorResult {
  status: ValidatorStatus;
  reason?: string;
  sanitizedText?: string;
}

export interface LayerResult {
  num: number;
  name: string;
  status: ValidatorStatus;
  reason?: string;
}

export interface PipelineResult {
  blocked: boolean;
  sanitized: boolean;
  displayResponse?: string;
  blockReason?: string;
  layers: LayerResult[];
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface BankAccount {
  iban: string;
  type: string;
  balance: number;
  currency: string;
}

export interface CreditCard {
  type: string;
  limit: number;
  used: number;
  paymentDay: number;
}

export interface Loan {
  type: string;
  remaining: number;
  monthlyPayment: number;
  endDate: string;
}

export interface Transaction {
  description: string;
  amount: number;
}

export interface Client {
  id: number;
  name: string;
  accounts: BankAccount[];
  creditCards: CreditCard[];
  loans: Loan[];
  transactions: Transaction[];
}

export interface ValidationContext {
  client: Client;
  conversationHistory: ChatMessage[];
}
