import { Transaction, BudgetCategory, SavingsGoal } from '@/lib/types';
import { generateId } from '@/lib/helpers';

export const sampleTransactions: Transaction[] = [
  {
    id: generateId(),
    type: 'income',
    amount: 3500,
    category: 'Salary',
    description: 'Monthly salary',
    date: new Date().toISOString().split('T')[0],
  },
  {
    id: generateId(),
    type: 'expense',
    amount: 1200,
    category: 'Bills & Utilities',
    description: 'Rent payment',
    date: new Date().toISOString().split('T')[0],
  },
  {
    id: generateId(),
    type: 'expense',
    amount: 45.50,
    category: 'Food & Dining',
    description: 'Grocery shopping',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
  },
  {
    id: generateId(),
    type: 'expense',
    amount: 25,
    category: 'Transportation',
    description: 'Gas station',
    date: new Date(Date.now() - 172800000).toISOString().split('T')[0], // 2 days ago
  },
];

export const sampleBudgets: BudgetCategory[] = [
  {
    id: generateId(),
    name: 'Food & Dining',
    limit: 400,
    color: '#ef4444',
    spent: 0,
  },
  {
    id: generateId(),
    name: 'Transportation',
    limit: 200,
    color: '#f97316',
    spent: 0,
  },
  {
    id: generateId(),
    name: 'Entertainment',
    limit: 150,
    color: '#22c55e',
    spent: 0,
  },
];

export const sampleGoals: SavingsGoal[] = [
  {
    id: generateId(),
    name: 'Emergency Fund',
    targetAmount: 5000,
    currentAmount: 1250,
    deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days from now
    color: '#22c55e',
  },
  {
    id: generateId(),
    name: 'Vacation',
    targetAmount: 2000,
    currentAmount: 450,
    deadline: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 180 days from now
    color: '#3b82f6',
  },
];