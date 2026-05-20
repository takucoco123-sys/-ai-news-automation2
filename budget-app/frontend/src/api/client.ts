import type {
  Category, CategoryCreate,
  Transaction, TransactionCreate,
  Budget, BudgetCreate,
  MonthlyReport, CategoryReport, TrendPoint,
} from '../types';

// ── Storage helpers ────────────────────────────────────────
const KEYS = {
  categories: 'kakeibo_categories',
  transactions: 'kakeibo_transactions',
  budgets: 'kakeibo_budgets',
  nextId: 'kakeibo_next_id',
};

function load<T>(key: string): T[] {
  try { return JSON.parse(localStorage.getItem(key) ?? '[]'); }
  catch { return []; }
}

function save<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

function nextId(): number {
  const n = parseInt(localStorage.getItem(KEYS.nextId) ?? '1');
  localStorage.setItem(KEYS.nextId, String(n + 1));
  return n;
}

const now = () => new Date().toISOString();

// ── Default categories ─────────────────────────────────────
const DEFAULT_CATEGORIES: Omit<Category, 'id' | 'created_at'>[] = [
  { name: '食費',       type: 'expense', color: '#f59e0b', icon: '🍽️' },
  { name: '交通費',     type: 'expense', color: '#3b82f6', icon: '🚃' },
  { name: '光熱費',     type: 'expense', color: '#8b5cf6', icon: '💡' },
  { name: '家賃',       type: 'expense', color: '#ec4899', icon: '🏠' },
  { name: '日用品',     type: 'expense', color: '#06b6d4', icon: '🧴' },
  { name: '医療費',     type: 'expense', color: '#ef4444', icon: '🏥' },
  { name: '娯楽費',     type: 'expense', color: '#f97316', icon: '🎮' },
  { name: '衣服',       type: 'expense', color: '#84cc16', icon: '👕' },
  { name: '外食',       type: 'expense', color: '#d97706', icon: '🍜' },
  { name: 'その他支出', type: 'expense', color: '#6b7280', icon: '💸' },
  { name: '給与',       type: 'income',  color: '#10b981', icon: '💰' },
  { name: '副収入',     type: 'income',  color: '#059669', icon: '📈' },
  { name: 'その他収入', type: 'income',  color: '#047857', icon: '💵' },
];

function seedCategories(): void {
  if (load<Category>(KEYS.categories).length === 0) {
    save(KEYS.categories, DEFAULT_CATEGORIES.map((c) => ({ ...c, id: nextId(), created_at: now() })));
  }
}
seedCategories();

// ── Categories ─────────────────────────────────────────────
export async function getCategories(type?: 'income' | 'expense'): Promise<Category[]> {
  let cats = load<Category>(KEYS.categories);
  if (type) cats = cats.filter((c) => c.type === type);
  return cats.sort((a, b) => a.name.localeCompare(b.name, 'ja'));
}

export async function createCategory(body: CategoryCreate): Promise<Category> {
  const cats = load<Category>(KEYS.categories);
  if (cats.some((c) => c.name === body.name)) throw new Error('カテゴリ名がすでに存在します');
  const cat: Category = { ...body, id: nextId(), created_at: now(), icon: body.icon ?? null };
  save(KEYS.categories, [...cats, cat]);
  return cat;
}

export async function updateCategory(id: number, body: CategoryCreate): Promise<Category> {
  const cats = load<Category>(KEYS.categories);
  if (cats.some((c) => c.name === body.name && c.id !== id)) throw new Error('カテゴリ名がすでに存在します');
  const updated = cats.map((c) => c.id === id ? { ...c, ...body, icon: body.icon ?? null } : c);
  save(KEYS.categories, updated);
  return updated.find((c) => c.id === id)!;
}

export async function deleteCategory(id: number): Promise<void> {
  if (load<Transaction>(KEYS.transactions).some((t) => t.category_id === id))
    throw new Error('このカテゴリには取引が存在するため削除できません');
  save(KEYS.categories, load<Category>(KEYS.categories).filter((c) => c.id !== id));
}

// ── Transactions ───────────────────────────────────────────
function withCategoryInfo(txs: Transaction[]): Transaction[] {
  const catMap = Object.fromEntries(load<Category>(KEYS.categories).map((c) => [c.id, c]));
  return txs.map((t) => ({
    ...t,
    category_name: catMap[t.category_id]?.name ?? '不明',
    category_color: catMap[t.category_id]?.color ?? '#6b7280',
  }));
}

export async function getTransactions(params: { year_month?: string; type?: string; category_id?: number } = {}): Promise<Transaction[]> {
  let txs = load<Transaction>(KEYS.transactions);
  if (params.year_month) txs = txs.filter((t) => t.date.startsWith(params.year_month!));
  if (params.type) txs = txs.filter((t) => t.type === params.type);
  if (params.category_id) txs = txs.filter((t) => t.category_id === params.category_id);
  return withCategoryInfo(txs).sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
}

export async function createTransaction(body: TransactionCreate): Promise<Transaction> {
  const cat = load<Category>(KEYS.categories).find((c) => c.id === body.category_id);
  if (!cat) throw new Error('カテゴリが見つかりません');
  if (cat.type !== body.type) throw new Error('種別がカテゴリと一致しません');
  const t: Transaction = {
    ...body, id: nextId(), description: body.description ?? null,
    category_name: cat.name, category_color: cat.color,
    created_at: now(), updated_at: now(),
  };
  save(KEYS.transactions, [...load<Transaction>(KEYS.transactions), t]);
  return t;
}

export async function updateTransaction(id: number, body: TransactionCreate): Promise<Transaction> {
  const cat = load<Category>(KEYS.categories).find((c) => c.id === body.category_id);
  if (!cat) throw new Error('カテゴリが見つかりません');
  if (cat.type !== body.type) throw new Error('種別がカテゴリと一致しません');
  const txs = load<Transaction>(KEYS.transactions);
  const updated = txs.map((t) =>
    t.id === id ? { ...t, ...body, description: body.description ?? null,
      category_name: cat.name, category_color: cat.color, updated_at: now() } : t
  );
  save(KEYS.transactions, updated);
  return updated.find((t) => t.id === id)!;
}

export async function deleteTransaction(id: number): Promise<void> {
  save(KEYS.transactions, load<Transaction>(KEYS.transactions).filter((t) => t.id !== id));
}

// ── Budgets ────────────────────────────────────────────────
export async function getBudgets(year_month: string): Promise<Budget[]> {
  const catMap = Object.fromEntries(load<Category>(KEYS.categories).map((c) => [c.id, c]));
  return load<Budget>(KEYS.budgets)
    .filter((b) => b.year_month === year_month)
    .map((b) => ({ ...b, category_name: catMap[b.category_id]?.name ?? '不明', category_color: catMap[b.category_id]?.color ?? '#6b7280' }))
    .sort((a, b) => a.category_name.localeCompare(b.category_name, 'ja'));
}

export async function upsertBudget(body: BudgetCreate): Promise<Budget> {
  const cat = load<Category>(KEYS.categories).find((c) => c.id === body.category_id);
  if (!cat) throw new Error('カテゴリが見つかりません');
  const budgets = load<Budget>(KEYS.budgets);
  const existing = budgets.find((b) => b.category_id === body.category_id && b.year_month === body.year_month);
  const result: Budget = { ...body, id: existing?.id ?? nextId(), category_name: cat.name, category_color: cat.color };
  save(KEYS.budgets, existing ? budgets.map((b) => b.id === existing.id ? result : b) : [...budgets, result]);
  return result;
}

export async function deleteBudget(id: number): Promise<void> {
  save(KEYS.budgets, load<Budget>(KEYS.budgets).filter((b) => b.id !== id));
}

// ── Reports ────────────────────────────────────────────────
export async function getMonthlyReport(year_month: string): Promise<MonthlyReport> {
  const cats = load<Category>(KEYS.categories);
  const catMap = Object.fromEntries(cats.map((c) => [c.id, c]));
  const txs = load<Transaction>(KEYS.transactions).filter((t) => t.date.startsWith(year_month));
  const budgets = load<Budget>(KEYS.budgets).filter((b) => b.year_month === year_month);

  const totalIncome = txs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = txs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const byCat: Record<number, number> = {};
  txs.forEach((t) => { byCat[t.category_id] = (byCat[t.category_id] ?? 0) + t.amount; });

  const catIds = new Set([...Object.keys(byCat).map(Number), ...budgets.map((b) => b.category_id)]);
  const breakdown: CategoryReport[] = Array.from(catIds).map((catId) => {
    const total = byCat[catId] ?? 0;
    const budget = budgets.find((b) => b.category_id === catId)?.amount ?? null;
    return {
      category_id: catId,
      category_name: catMap[catId]?.name ?? '不明',
      color: catMap[catId]?.color ?? '#6b7280',
      total,
      budget,
      percent_used: budget ? Math.round(total / budget * 1000) / 10 : null,
    };
  }).sort((a, b) => b.total - a.total);

  return { year_month, total_income: totalIncome, total_expense: totalExpense, balance: totalIncome - totalExpense, by_category: breakdown };
}

export async function getTrend(months = 6): Promise<TrendPoint[]> {
  const txs = load<Transaction>(KEYS.transactions);
  return Array.from({ length: months }, (_, i) => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - (months - 1 - i));
    const ym = d.toISOString().slice(0, 7);
    const monthTxs = txs.filter((t) => t.date.startsWith(ym));
    return {
      year_month: ym,
      income: monthTxs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
      expense: monthTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    };
  });
}

// ── データエクスポート/インポート ──────────────────────────
export function exportData(): string {
  return JSON.stringify({
    categories: load(KEYS.categories),
    transactions: load(KEYS.transactions),
    budgets: load(KEYS.budgets),
    exportedAt: now(),
  }, null, 2);
}

export function importData(json: string): void {
  const data = JSON.parse(json);
  if (data.categories) save(KEYS.categories, data.categories);
  if (data.transactions) save(KEYS.transactions, data.transactions);
  if (data.budgets) save(KEYS.budgets, data.budgets);
}
