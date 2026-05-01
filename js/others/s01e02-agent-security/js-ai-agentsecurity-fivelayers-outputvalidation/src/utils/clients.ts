import { Client } from '../types';

export const clients: Client[] = [
  {
    id: 1001,
    name: 'Jan Kowalski',
    accounts: [
      { iban: 'PL02109024020001', type: 'Rachunek biezacy', balance: 4231.50, currency: 'PLN' },
      { iban: 'PL02109024020002', type: 'Rachunek oszczednosciowy', balance: 18750.00, currency: 'PLN' },
    ],
    creditCards: [
      { type: 'Visa Gold', limit: 5000, used: 1200, paymentDay: 10 },
    ],
    loans: [
      { type: 'Lokata 3-miesięczna', remaining: 10000, monthlyPayment: 0, endDate: '2025-08-15' },
    ],
    transactions: [
      { description: 'Biedronka', amount: -45.20 },
      { description: 'Przelew wychodzacy (Czynsz)', amount: -500.00 },
      { description: 'Wyplata z bankomatu', amount: -200.00 },
    ],
  },
  {
    id: 1002,
    name: 'Anna Nowak',
    accounts: [
      { iban: 'PL02109024020011', type: 'Rachunek biezacy', balance: 892.30, currency: 'PLN' },
      { iban: 'PL02109024020012', type: 'Rachunek walutowy EUR', balance: 2340.00, currency: 'EUR' },
    ],
    creditCards: [
      { type: 'Mastercard Debit', limit: 2000, used: 0, paymentDay: 0 },
    ],
    loans: [
      { type: 'Kredyt hipoteczny', remaining: 287500, monthlyPayment: 1843, endDate: '2042-03-01' },
    ],
    transactions: [
      { description: 'Przelew przychodzacy (Wynagrodzenie)', amount: 3200 },
      { description: 'Orlen', amount: -180.00 },
      { description: 'Netflix', amount: -49.00 },
    ],
  },
];

export function getClientById(id: number): Client | undefined {
  return clients.find(c => c.id === id);
}
