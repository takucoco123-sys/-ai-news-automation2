import { useEffect, useState } from 'react';
import type { Category, Transaction, TransactionCreate } from '../types';
import { getCategories, createTransaction, updateTransaction } from '../api/client';

interface Props {
  editing?: Transaction | null;
  onSave: () => void;
  onCancel: () => void;
}

const today = () => new Date().toISOString().slice(0, 10);

export default function TransactionForm({ editing, onSave, onCancel }: Props) {
  const [type, setType] = useState<'income' | 'expense'>(editing?.type ?? 'expense');
  const [amount, setAmount] = useState(editing ? String(editing.amount) : '');
  const [categoryId, setCategoryId] = useState(editing ? String(editing.category_id) : '');
  const [description, setDescription] = useState(editing?.description ?? '');
  const [date, setDate] = useState(editing?.date ?? today());
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getCategories(type).then(setCategories);
    setCategoryId('');
  }, [type]);

  useEffect(() => {
    if (editing) {
      const matchingCat = categories.find((c) => c.id === editing.category_id);
      if (matchingCat) setCategoryId(String(editing.category_id));
    }
  }, [categories, editing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !categoryId || !date) {
      setError('金額・カテゴリ・日付は必須です');
      return;
    }
    const body: TransactionCreate = {
      amount: parseFloat(amount),
      type,
      category_id: parseInt(categoryId),
      description: description || undefined,
      date,
    };
    setSaving(true);
    try {
      if (editing) {
        await updateTransaction(editing.id, body);
      } else {
        await createTransaction(body);
      }
      onSave();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400/30 transition-all";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-rose-400 text-sm">{error}</p>}
      <div className="flex gap-2">
        {(['expense', 'income'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
              type === t
                ? t === 'expense'
                  ? 'bg-gradient-to-br from-rose-500 to-pink-500 text-white border-rose-400/50 shadow-[0_0_20px_-6px_rgba(244,114,182,0.5)]'
                  : 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white border-emerald-400/50 shadow-[0_0_20px_-6px_rgba(52,211,153,0.5)]'
                : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-gray-200'
            }`}
          >
            {t === 'expense' ? '支出' : '収入'}
          </button>
        ))}
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">金額 (円)</label>
        <input type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)}
          className={inputCls} placeholder="例: 1500" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">カテゴリ</label>
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputCls}>
          <option value="">選択してください</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.icon ? `${c.icon} ` : ''}{c.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">日付</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">メモ (任意)</label>
        <input type="text" value={description} onChange={(e) => setDescription(e.target.value)}
          className={inputCls} placeholder="例: スーパーで購入" />
      </div>
      <div className="flex gap-2 pt-2">
        <button type="submit" disabled={saving}
          className="flex-1 bg-gradient-to-br from-indigo-500 to-purple-600 text-white py-2.5 rounded-xl text-sm font-medium hover:shadow-[0_0_24px_-4px_rgba(99,102,241,0.6)] disabled:opacity-50 transition-all">
          {saving ? '保存中...' : editing ? '更新' : '追加'}
        </button>
        <button type="button" onClick={onCancel}
          className="flex-1 bg-white/5 border border-white/10 text-gray-300 py-2.5 rounded-xl text-sm font-medium hover:bg-white/10 transition-all">
          キャンセル
        </button>
      </div>
    </form>
  );
}
