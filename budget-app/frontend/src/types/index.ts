export interface Category {
  id: number;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon: string | null;
  created_at: string;
}

export interface CategoryCreate {
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon?: string;
}

export interface Transaction {
  id: number;
  amount: number;
  type: 'income' | 'expense';
  category_id: number;
  category_name: string;
  category_color: string;
  category_icon: string | null;
  description: string | null;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface TransactionCreate {
  amount: number;
  type: 'income' | 'expense';
  category_id: number;
  description?: string;
  date: string;
}

export interface Budget {
  id: number;
  category_id: number;
  category_name: string;
  category_color: string;
  year_month: string;
  amount: number;
}

export interface BudgetCreate {
  category_id: number;
  year_month: string;
  amount: number;
}

export interface CategoryReport {
  category_id: number;
  category_name: string;
  color: string;
  total: number;
  budget: number | null;
  percent_used: number | null;
}

export interface MonthlyReport {
  year_month: string;
  total_income: number;
  total_expense: number;
  balance: number;
  by_category: CategoryReport[];
}

export interface TrendPoint {
  year_month: string;
  income: number;
  expense: number;
}
