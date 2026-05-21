import { useEffect, useState } from 'react';
import type { Category, CategoryCreate } from '../types';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../api/client';

const COLORS = ['#f59e0b','#3b82f6','#8b5cf6','#ec4899','#06b6d4','#ef4444','#f97316','#84cc16','#10b981','#6366f1','#d97706','#9ca3af'];

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<CategoryCreate>({ name: '', type: 'expense', color: '#6366f1' });
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  const load = () => getCategories().then(setCategories);
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm({ name: '', type: 'expense', color: '#6366f1', icon: '' }); setError(''); setShowForm(true); };
  const openEdit = (c: Category) => { setEditing(c); setForm({ name: c.name, type: c.type, color: c.color, icon: c.icon ?? '' }); setError(''); setShowForm(true); };

  const handleSave = async () => {
    if (!form.name.trim()) { setError('カテゴリ名は必須です'); return; }
    try {
      if (editing) { await updateCategory(editing.id, form); } else { await createCategory(form); }
      setShowForm(false); load();
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'エラーが発生しました'); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('このカテゴリを削除しますか？')) return;
    try { await deleteCategory(id); load(); }
    catch (err: unknown) { alert(err instanceof Error ? err.message : '削除できませんでした'); }
  };

  const income = categories.filter((c) => c.type === 'income');
  const expense = categories.filter((c) => c.type === 'expense');

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 transition-all";

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={openNew} className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:shadow-[0_0_24px_-4px_rgba(99,102,241,0.6)] transition-all">+ 追加</button>
      </div>
      {showForm && (
        <div className="glass rounded-2xl p-5 mb-6 space-y-3">
          {error && <p className="text-rose-400 text-sm">{error}</p>}
          <div className="flex gap-2">
            {(['expense', 'income'] as const).map((t) => (
              <button key={t} type="button" onClick={() => setForm((f) => ({ ...f, type: t }))}
                className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${
                  form.type === t
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-indigo-400/50 shadow-[0_0_20px_-6px_rgba(99,102,241,0.5)]'
                    : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                }`}>{t === 'expense' ? '支出' : '収入'}</button>
            ))}
          </div>
          <input type="text" placeholder="カテゴリ名" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={inputCls} />
          <input type="text" placeholder="アイコン (絵文字, 任意)" value={form.icon ?? ''} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))} className={inputCls} />
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">カラー</p>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button key={c} type="button" onClick={() => setForm((f) => ({ ...f, color: c }))}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${form.color === c ? 'border-white scale-110' : 'border-white/10 hover:border-white/30'}`}
                  style={{
                    backgroundColor: c,
                    boxShadow: form.color === c ? `0 0 16px ${c}80` : 'none',
                  }} />
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={handleSave} className="flex-1 bg-gradient-to-br from-indigo-500 to-purple-600 text-white py-2.5 rounded-xl text-sm font-medium hover:shadow-[0_0_24px_-4px_rgba(99,102,241,0.6)] transition-all">{editing ? '更新' : '追加'}</button>
            <button onClick={() => setShowForm(false)} className="flex-1 bg-white/5 border border-white/10 text-gray-300 py-2.5 rounded-xl text-sm font-medium hover:bg-white/10 transition-all">キャンセル</button>
          </div>
        </div>
      )}
      {[{ label: '支出カテゴリ', items: expense }, { label: '収入カテゴリ', items: income }].map(({ label, items }) => (
        <div key={label} className="mb-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{label}</h3>
          <div className="space-y-2">
            {items.map((c) => (
              <div key={c.id} className="flex items-center justify-between glass glass-hover rounded-xl px-4 py-3 transition-all">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: c.color,
                      boxShadow: `0 0 10px ${c.color}80`,
                    }}
                  />
                  <span className="text-sm text-gray-100">{c.icon ? `${c.icon} ` : ''}{c.name}</span>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => openEdit(c)} className="text-xs text-gray-500 hover:text-indigo-300 transition-colors">編集</button>
                  <button onClick={() => handleDelete(c.id)} className="text-xs text-gray-500 hover:text-rose-400 transition-colors">削除</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
