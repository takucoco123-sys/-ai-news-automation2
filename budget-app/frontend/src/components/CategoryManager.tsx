import { useEffect, useState } from 'react';
import type { Category, CategoryCreate } from '../types';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../api/client';

const COLORS = ['#f59e0b','#3b82f6','#8b5cf6','#ec4899','#06b6d4','#ef4444','#f97316','#84cc16','#10b981','#c9a84c','#d97706','#9ca3af'];

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<CategoryCreate>({ name: '', type: 'expense', color: '#c9a84c' });
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  const load = () => getCategories().then(setCategories);
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm({ name: '', type: 'expense', color: '#c9a84c', icon: '' }); setError(''); setShowForm(true); };
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
  const inputStyle = { background: 'var(--gold-subtle)', border: '1px solid var(--gold-border)', color: '#e8e4da' };

  return (
    <div className="max-w-2xl mx-auto md:max-w-none">
      <div className="flex justify-end mb-4">
        <button onClick={openNew} className="btn-gold px-4 py-2 rounded-xl text-sm">+ 追加</button>
      </div>
      {showForm && (
        <div className="glass rounded-2xl p-5 mb-6 space-y-3">
          {error && <p className="text-rose-400 text-sm">{error}</p>}
          <div className="flex gap-2">
            {(['expense', 'income'] as const).map((t) => (
              <button key={t} type="button" onClick={() => setForm((f) => ({ ...f, type: t }))}
                className="flex-1 py-2 rounded-xl text-sm font-medium transition-all"
                style={form.type === t
                  ? { background: 'var(--gold)', color: '#1a1410' }
                  : { background: 'var(--gold-subtle)', border: '1px solid var(--gold-border)', color: '#7a6f5e' }}>
                {t === 'expense' ? '支出' : '収入'}
              </button>
            ))}
          </div>
          <input type="text" placeholder="カテゴリ名" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none" style={inputStyle} />
          <input type="text" placeholder="アイコン (絵文字, 任意)" value={form.icon ?? ''} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
            className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none" style={inputStyle} />
          <div>
            <p className="text-xs uppercase tracking-wider mb-2" style={{ color: '#7a6f5e' }}>カラー</p>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button key={c} type="button" onClick={() => setForm((f) => ({ ...f, color: c }))}
                  className="w-7 h-7 rounded-full transition-all"
                  style={{ backgroundColor: c, outline: form.color === c ? `2px solid ${c}` : '2px solid transparent', outlineOffset: '2px', boxShadow: form.color === c ? `0 0 12px ${c}80` : 'none' }} />
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={handleSave} className="flex-1 btn-gold py-2.5 rounded-xl text-sm">{editing ? '更新' : '追加'}</button>
            <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl text-sm"
              style={{ background: 'var(--gold-subtle)', border: '1px solid var(--gold-border)', color: '#7a6f5e' }}>キャンセル</button>
          </div>
        </div>
      )}
      {[{ label: '支出カテゴリ', items: expense }, { label: '収入カテゴリ', items: income }].map(({ label, items }) => (
        <div key={label} className="mb-6">
          <h3 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#7a6f5e' }}>{label}</h3>
          <div className="space-y-2">
            {items.map((c) => (
              <div key={c.id} className="flex items-center justify-between glass glass-hover rounded-xl px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base"
                    style={{ background: `${c.color}18`, border: `1px solid ${c.color}30` }}>
                    {c.icon || '📁'}
                  </div>
                  <span className="text-sm" style={{ color: '#e8e4da' }}>{c.name}</span>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => openEdit(c)} className="text-xs transition-colors" style={{ color: '#666055' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#c9a84c')} onMouseLeave={(e) => (e.currentTarget.style.color = '#666055')}>編集</button>
                  <button onClick={() => handleDelete(c.id)} className="text-xs transition-colors" style={{ color: '#666055' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#fb7185')} onMouseLeave={(e) => (e.currentTarget.style.color = '#666055')}>削除</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
