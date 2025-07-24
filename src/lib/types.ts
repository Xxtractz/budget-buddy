export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
}

export interface BudgetCategory {
  id: string;
  name: string;
  limit: number;
  color: string;
  spent: number;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  color: string;
}

export const EXPENSE_CATEGORIES = [
  { name: 'Food & Dining', color: '#ef4444' },
  { name: 'Transportation', color: '#f97316' },
  { name: 'Shopping', color: '#eab308' },
  { name: 'Entertainment', color: '#22c55e' },
  { name: 'Bills & Utilities', color: '#3b82f6' },
  { name: 'Healthcare', color: '#8b5cf6' },
  { name: 'Education', color: '#06b6d4' },
  { name: 'Other', color: '#6b7280' },
];

export const INCOME_CATEGORIES = [
  { name: 'Salary', color: '#22c55e' },
  { name: 'Freelance', color: '#3b82f6' },
  { name: 'Investment', color: '#8b5cf6' },
  { name: 'Gift', color: '#f59e0b' },
  { name: 'Other', color: '#6b7280' },
];