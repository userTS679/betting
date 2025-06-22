import { Event, User, Bet, Transaction, PaymentMethod } from '../types';

export const mockUser: User = {
  id: 'user-1',
  name: 'John Doe',
  balance: 10000,
  totalBets: 25,
  totalWinnings: 8500,
  isAdmin: false
};

export const mockAdmin: User = {
  id: 'admin-1',
  name: 'Admin',
  balance: 50000,
  totalBets: 0,
  totalWinnings: 0,
  isAdmin: true
};

export const mockEvents: Event[] = [
  {
    id: 'event-1',
    title: 'Will it rain in Bangalore today?',
    description: 'Weather prediction for Bangalore on December 20, 2024. Based on current weather patterns and forecasts.',
    category: 'Weather',
    createdBy: 'admin-1',
    createdAt: new Date('2024-12-20T06:00:00Z'),
    expiresAt: new Date('2024-12-20T18:00:00Z'),
    status: 'active',
    totalPool: 15000,
    participantCount: 45,
    options: [
      { id: 'opt-1', label: 'Yes, it will rain', odds: 2.3, totalBets: 8000, bettors: 25 },
      { id: 'opt-2', label: 'No, it will not rain', odds: 1.8, totalBets: 7000, bettors: 20 }
    ]
  },
  {
    id: 'event-2',
    title: 'Bitcoin price above $100,000 by end of month?',
    description: 'Will Bitcoin (BTC) reach or exceed $100,000 USD by December 31, 2024?',
    category: 'Cryptocurrency',
    createdBy: 'admin-1',
    createdAt: new Date('2024-12-15T10:00:00Z'),
    expiresAt: new Date('2024-12-31T23:59:59Z'),
    status: 'active',
    totalPool: 25000,
    participantCount: 78,
    options: [
      { id: 'opt-3', label: 'Yes, above $100K', odds: 3.2, totalBets: 12000, bettors: 35 },
      { id: 'opt-4', label: 'No, below $100K', odds: 1.4, totalBets: 13000, bettors: 43 }
    ]
  },
  {
    id: 'event-3',
    title: 'India vs Australia Cricket Match Winner',
    description: 'Test match at Melbourne Cricket Ground. Who will win the 3rd Test?',
    category: 'Sports',
    createdBy: 'admin-1',
    createdAt: new Date('2024-12-18T08:00:00Z'),
    expiresAt: new Date('2024-12-22T10:00:00Z'),
    status: 'active',
    totalPool: 35000,
    participantCount: 120,
    options: [
      { id: 'opt-5', label: 'India wins', odds: 2.1, totalBets: 18000, bettors: 65 },
      { id: 'opt-6', label: 'Australia wins', odds: 1.9, totalBets: 15000, bettors: 50 },
      { id: 'opt-7', label: 'Draw/Tie', odds: 4.5, totalBets: 2000, bettors: 5 }
    ]
  },
  {
    id: 'event-4',
    title: 'Will OpenAI release GPT-5 in 2025?',
    description: 'Prediction on whether OpenAI will officially release GPT-5 model during 2025.',
    category: 'Technology',
    createdBy: 'admin-1',
    createdAt: new Date('2024-12-10T12:00:00Z'),
    expiresAt: new Date('2025-12-31T23:59:59Z'),
    status: 'active',
    totalPool: 18000,
    participantCount: 55,
    options: [
      { id: 'opt-8', label: 'Yes, GPT-5 in 2025', odds: 1.6, totalBets: 12000, bettors: 38 },
      { id: 'opt-9', label: 'No, not in 2025', odds: 2.8, totalBets: 6000, bettors: 17 }
    ]
  },
  {
    id: 'event-5',
    title: 'Stock Market: Nifty 50 above 25,000 by Jan 31?',
    description: 'Will the Nifty 50 index close above 25,000 points by January 31, 2025?',
    category: 'Finance',
    createdBy: 'admin-1',
    createdAt: new Date('2024-12-19T09:00:00Z'),
    expiresAt: new Date('2025-01-31T15:30:00Z'),
    status: 'active',
    totalPool: 22000,
    participantCount: 67,
    options: [
      { id: 'opt-10', label: 'Yes, above 25,000', odds: 2.4, totalBets: 10000, bettors: 30 },
      { id: 'opt-11', label: 'No, below 25,000', odds: 1.7, totalBets: 12000, bettors: 37 }
    ]
  }
];

export const mockBets: Bet[] = [
  {
    id: 'bet-1',
    eventId: 'event-1',
    userId: 'user-1',
    optionId: 'opt-1',
    amount: 500,
    placedAt: new Date('2024-12-20T08:00:00Z'),
    status: 'active'
  },
  {
    id: 'bet-2',
    eventId: 'event-2',
    userId: 'user-1',
    optionId: 'opt-4',
    amount: 1000,
    placedAt: new Date('2024-12-18T14:00:00Z'),
    status: 'active'
  },
  {
    id: 'bet-3',
    eventId: 'event-3',
    userId: 'user-1',
    optionId: 'opt-5',
    amount: 750,
    placedAt: new Date('2024-12-15T10:30:00Z'),
    status: 'won',
    payout: 1575
  },
  {
    id: 'bet-4',
    eventId: 'event-4',
    userId: 'user-1',
    optionId: 'opt-8',
    amount: 300,
    placedAt: new Date('2024-12-12T16:45:00Z'),
    status: 'lost'
  }
];

export const mockTransactions: Transaction[] = [
  {
    id: 'txn-1',
    userId: 'user-1',
    type: 'deposit',
    amount: 5000,
    description: 'Wallet top-up via UPI',
    timestamp: new Date('2024-12-20T09:15:00Z'),
    status: 'completed',
    paymentMethod: 'UPI',
    transactionId: 'UPI123456789'
  },
  {
    id: 'txn-2',
    userId: 'user-1',
    type: 'bet_placed',
    amount: -500,
    description: 'Bet placed on "Will it rain in Bangalore today?"',
    timestamp: new Date('2024-12-20T08:00:00Z'),
    status: 'completed',
    eventId: 'event-1',
    betId: 'bet-1'
  },
  {
    id: 'txn-3',
    userId: 'user-1',
    type: 'bet_won',
    amount: 1575,
    description: 'Bet won on "India vs Australia Cricket Match"',
    timestamp: new Date('2024-12-19T18:30:00Z'),
    status: 'completed',
    eventId: 'event-3',
    betId: 'bet-3'
  },
  {
    id: 'txn-4',
    userId: 'user-1',
    type: 'deposit',
    amount: 3000,
    description: 'Wallet top-up via Credit Card',
    timestamp: new Date('2024-12-18T14:20:00Z'),
    status: 'completed',
    paymentMethod: 'Credit Card',
    transactionId: 'CC987654321'
  },
  {
    id: 'txn-5',
    userId: 'user-1',
    type: 'bet_placed',
    amount: -1000,
    description: 'Bet placed on "Bitcoin price above $100,000"',
    timestamp: new Date('2024-12-18T14:00:00Z'),
    status: 'completed',
    eventId: 'event-2',
    betId: 'bet-2'
  },
  {
    id: 'txn-6',
    userId: 'user-1',
    type: 'bet_lost',
    amount: -300,
    description: 'Bet lost on "Will OpenAI release GPT-5 in 2025?"',
    timestamp: new Date('2024-12-17T12:00:00Z'),
    status: 'completed',
    eventId: 'event-4',
    betId: 'bet-4'
  },
  {
    id: 'txn-7',
    userId: 'user-1',
    type: 'withdrawal',
    amount: -2000,
    description: 'Withdrawal to bank account',
    timestamp: new Date('2024-12-16T11:30:00Z'),
    status: 'completed',
    paymentMethod: 'Bank Transfer',
    transactionId: 'BT456789123'
  }
];

export const mockPaymentMethods: PaymentMethod[] = [
  {
    id: 'pm-1',
    type: 'upi',
    name: 'Google Pay',
    details: 'john.doe@okaxis',
    isDefault: true
  },
  {
    id: 'pm-2',
    type: 'card',
    name: 'HDFC Credit Card',
    details: '**** **** **** 1234',
    isDefault: false
  },
  {
    id: 'pm-3',
    type: 'netbanking',
    name: 'ICICI Bank',
    details: 'Net Banking',
    isDefault: false
  }
];