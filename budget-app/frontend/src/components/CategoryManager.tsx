import { useEffect, useState } from 'react';
import type { Category, CategoryCreate } from '../types';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../api/client';

const COLORS = ['#f59e0b','#3b82f6','#8b5cf6','#ec4899','#06b6d4','#ef4444','#f97316','#84cc16','#10b981','#6366f1','#d97706','#6b7280'];

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<CategoryCreate>({ name: '', type: 'expense', color: '#6366f1' });
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  const load = () => getCategories().then(setCategories);
  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', type: 'expense', color: '#6366f1', icon: '' });
    setError('');
    setShowForm(true);
  };

  const openEdit = (c: Category) => {
    setEditing(c);
    setForm({ name: c.name, type: c.type, color: c.color, icon: c.icon ?? '' });
    setError('');
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError('カテゴリ名は必須です'); return; }
    try {
      if (editing) {
        await updateCategory(editing.id, form);
      } else {
        await createCategory(form);
      }
      setShowForm(false);
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('このカテゴリを削除しますか？')) return;
    try {
      await deleteCategory(id);
      load();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : '削除できませんでした');
    }
  };

  const income = categories.filter((c) => c.type === 'income');
  const expense = categories.filter((c) => c.type === 'expense');

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">カテゴリ管理</h2>
        <button
          onClick={openNew}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          + 追加
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 space-y-3">
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="flex gap-2">
            {(['expense', 'income'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setForm((f) => ({ ...f, type: t }))}
                className={`flex-1 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                  form.type === t ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-300'
                }`}
              >
                {t === 'expense' ? '支出' : '収入'}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="カテゴリ名"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <input
            type="text"
            placeholder="アイコン (絵文字, 任意)"
            value={form.icon ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <div>
            <p className="text-xs text-gray-500 mb-1">カラー</p>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, color: c }))}
                  className={`w-6 h-6 rounded-full border-2 transition-transform ${form.color === c ? 'border-gray-800 scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
              {editing ? '更新' : '追加'}
            </button>
            <button onClick={() => setShowForm(false)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
              キャンセル
            </button>
          </div>
        </div>
      )}

      {[{ label: '支出カテゴリ', items: expense }, { label: '収入カテゴリ', items: income }].map(({ label, items }) => (
        <div key={label} className="mb-4">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">{label}</h3>
          <div className="space-y-2">
            {items.map((c) => (
              <div key={c.id} className="flex items-center justify-between bg-white rounded-lg border border-gray-100 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="text-sm text-gray-800">{c.icon ? `${c.icon} ` : ''}{c.name}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(c)} className="text-xs text-gray-400 hover:text-indigo-600">編集</button>
                  <button onClick={() => handleDelete(c.id)} className="text-xs text-gray-400 hover:text-red-500">削除</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
