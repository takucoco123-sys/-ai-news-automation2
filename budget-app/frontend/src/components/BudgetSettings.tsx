import { useEffect, useState } from 'react';
import type { Budget, Category } from '../types';
import { getBudgets, getCategories, upsertBudget, deleteBudget } from '../api/client';

interface Props { yearMonth: string; }

export default function BudgetSettings({ yearMonth }: Props) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState<number | null>(null);

  const load = async () => {
    const [b, c] = await Promise.all([getBudgets(yearMonth), getCategories('expense')]);
    setBudgets(b); setCategories(c);
    const map: Record<number, string> = {};
    b.forEach((bud) => { map[bud.category_id] = String(bud.amount); });
    setDrafts(map);
  };
  useEffect(() => { load(); }, [yearMonth]);

  const handleSave = async (categoryId: number) => {
    const val = parseFloat(drafts[categoryId] ?? '0');
    if (isNaN(val) || val < 0) return;
    setSaving(categoryId);
    try { await upsertBudget({ category_id: categoryId, year_month: yearMonth, amount: val }); await load(); }
    finally { setSaving(null); }
  };

  const handleDelete = async (categoryId: number) => {
    const bud = budgets.find((b) => b.category_id === categoryId);
    if (!bud || !confirm('この予算設定を削除しますか？')) return;
    await deleteBudget(bud.id); await load();
  };

  return (
    <div className="space-y-2">
      {categories.map((cat) => {
        const hasBudget = budgets.some((b) => b.category_id === cat.id);
        return (
          <div key={cat.id} className="flex items-center gap-3 glass glass-hover rounded-xl px-4 py-3 transition-all">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{
                backgroundColor: cat.color,
                boxShadow: `0 0 10px ${cat.color}80`,
              }}
            />
            <span className="text-sm text-gray-100 w-28 flex-shrink-0 truncate">{cat.icon ? `${cat.icon} ` : ''}{cat.name}</span>
            <div className="flex items-center gap-1 flex-1">
              <span className="text-gray-500 text-sm">¥</span>
              <input type="number" min="0" value={drafts[cat.id] ?? ''}
                onChange={(e) => setDrafts((d) => ({ ...d, [cat.id]: e.target.value }))}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
                placeholder="0" />
            </div>
            <button onClick={() => handleSave(cat.id)} disabled={saving === cat.id}
              className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:shadow-[0_0_16px_-4px_rgba(99,102,241,0.6)] disabled:opacity-50 transition-all">
              {saving === cat.id ? '...' : '保存'}
            </button>
            {hasBudget && <button onClick={() => handleDelete(cat.id)} className="text-xs text-gray-500 hover:text-rose-400 transition-colors">削除</button>}
          </div>
        );
      })}
    </div>
  );
}
