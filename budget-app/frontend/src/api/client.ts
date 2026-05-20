import type {
  Category, CategoryCreate,
  Transaction, TransactionCreate,
  Budget, BudgetCreate,
  MonthlyReport, TrendPoint,
} from '../types';

const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? 'Request failed');
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// Categories
export const getCategories = (type?: 'income' | 'expense') =>
  request<Category[]>(`/api/categories${type ? `?type=${type}` : ''}`);

export const createCategory = (body: CategoryCreate) =>
  request<Category>('/api/categories', { method: 'POST', body: JSON.stringify(body) });

export const updateCategory = (id: number, body: CategoryCreate) =>
  request<Category>(`/api/categories/${id}`, { method: 'PUT', body: JSON.stringify(body) });

export const deleteCategory = (id: number) =>
  request<void>(`/api/categories/${id}`, { method: 'DELETE' });

// Transactions
export const getTransactions = (params: { year_month?: string; type?: string; category_id?: number } = {}) => {
  const q = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v != null).map(([k, v]) => [k, String(v)]))
  );
  return request<Transaction[]>(`/api/transactions${q.toString() ? `?${q}` : ''}`);
};

export const createTransaction = (body: TransactionCreate) =>
  request<Transaction>('/api/transactions', { method: 'POST', body: JSON.stringify(body) });

export const updateTransaction = (id: number, body: TransactionCreate) =>
  request<Transaction>(`/api/transactions/${id}`, { method: 'PUT', body: JSON.stringify(body) });

export const deleteTransaction = (id: number) =>
  request<void>(`/api/transactions/${id}`, { method: 'DELETE' });

// Budgets
export const getBudgets = (year_month: string) =>
  request<Budget[]>(`/api/budgets?year_month=${year_month}`);

export const upsertBudget = (body: BudgetCreate) =>
  request<Budget>('/api/budgets', { method: 'POST', body: JSON.stringify(body) });

export const deleteBudget = (id: number) =>
  request<void>(`/api/budgets/${id}`, { method: 'DELETE' });

// Reports
export const getMonthlyReport = (year_month: string) =>
  request<MonthlyReport>(`/api/reports/monthly?year_month=${year_month}`);

export const getTrend = (months = 6) =>
  request<TrendPoint[]>(`/api/reports/trend?months=${months}`);
