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
    <div className="space-y-2 max-w-2xl mx-auto md:max-w-none">
      {categories.map((cat) => {
        const hasBudget = budgets.some((b) => b.category_id === cat.id);
        return (
          <div key={cat.id} className="flex items-center gap-3 glass glass-hover rounded-xl px-4 py-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
              style={{ background: `${cat.color}18`, border: `1px solid ${cat.color}30` }}>
              {cat.icon || '📁'}
            </div>
            <span className="text-sm w-24 flex-shrink-0 truncate" style={{ color: '#e8e4da' }}>{cat.name}</span>
            <div className="flex items-center gap-1 flex-1">
              <span className="text-sm" style={{ color: '#7a6f5e' }}>¥</span>
              <input type="number" min="0" value={drafts[cat.id] ?? ''}
                onChange={(e) => setDrafts((d) => ({ ...d, [cat.id]: e.target.value }))}
                className="flex-1 rounded-lg px-2 py-1.5 text-sm focus:outline-none"
                style={{ background: 'var(--gold-subtle)', border: '1px solid var(--gold-border)', color: '#e8e4da' }}
                placeholder="0" />
            </div>
            <button onClick={() => handleSave(cat.id)} disabled={saving === cat.id}
              className="btn-gold px-3 py-1.5 rounded-lg text-xs disabled:opacity-40">
              {saving === cat.id ? '...' : '保存'}
            </button>
            {hasBudget && (
              <button onClick={() => handleDelete(cat.id)} className="text-xs transition-colors" style={{ color: '#666055' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#fb7185')} onMouseLeave={(e) => (e.currentTarget.style.color = '#666055')}>削除</button>
            )}
          </div>
        );
      })}
    </div>
  );
}
