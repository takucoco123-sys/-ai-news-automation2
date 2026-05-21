import { useEffect, useState } from 'react';
import type { Category, Transaction, TransactionCreate } from '../types';
import { getCategories, createTransaction, updateTransaction } from '../api/client';

interface Props { editing?: Transaction | null; onSave: () => void; onCancel: () => void; }

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

  useEffect(() => { getCategories(type).then(setCategories); setCategoryId(''); }, [type]);
  useEffect(() => {
    if (editing) {
      const matchingCat = categories.find((c) => c.id === editing.category_id);
      if (matchingCat) setCategoryId(String(editing.category_id));
    }
  }, [categories, editing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !categoryId || !date) { setError('金額・カテゴリ・日付は必須です'); return; }
    const body: TransactionCreate = { amount: parseFloat(amount), type, category_id: parseInt(categoryId), description: description || undefined, date };
    setSaving(true);
    try {
      if (editing) { await updateTransaction(editing.id, body); } else { await createTransaction(body); }
      onSave();
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'エラーが発生しました'); }
    finally { setSaving(false); }
  };

  const inputCls = "w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none transition-all";
  const inputStyle = { background: 'var(--gold-subtle)', border: '1px solid var(--gold-border)', color: '#e8e4da' };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-rose-400 text-sm">{error}</p>}
      <div className="flex gap-2">
        {(['expense', 'income'] as const).map((t) => (
          <button key={t} type="button" onClick={() => setType(t)}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={type === t
              ? { background: t === 'expense' ? 'rgba(251,113,133,0.15)' : 'rgba(74,222,128,0.15)', border: `1px solid ${t === 'expense' ? 'rgba(251,113,133,0.4)' : 'rgba(74,222,128,0.4)'}`, color: t === 'expense' ? '#fb7185' : '#4ade80' }
              : { background: 'var(--gold-subtle)', border: '1px solid var(--gold-border)', color: '#7a6f5e' }}>
            {t === 'expense' ? '支出' : '収入'}
          </button>
        ))}
      </div>
      <div>
        <label className="block text-xs font-medium uppercase tracking-wider mb-1.5" style={{ color: '#7a6f5e' }}>金額 (円)</label>
        <input type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} className={inputCls} style={inputStyle} placeholder="例: 1500" />
      </div>
      <div>
        <label className="block text-xs font-medium uppercase tracking-wider mb-1.5" style={{ color: '#7a6f5e' }}>カテゴリ</label>
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputCls} style={inputStyle}>
          <option value="">選択してください</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.icon ? `${c.icon} ` : ''}{c.name}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium uppercase tracking-wider mb-1.5" style={{ color: '#7a6f5e' }}>日付</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} style={inputStyle} />
      </div>
      <div>
        <label className="block text-xs font-medium uppercase tracking-wider mb-1.5" style={{ color: '#7a6f5e' }}>メモ (任意)</label>
        <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className={inputCls} style={inputStyle} placeholder="例: スーパーで購入" />
      </div>
      <div className="flex gap-2 pt-2">
        <button type="submit" disabled={saving} className="flex-1 btn-gold py-2.5 rounded-xl text-sm">
          {saving ? '保存中...' : editing ? '更新' : '追加'}
        </button>
        <button type="button" onClick={onCancel} className="flex-1 py-2.5 rounded-xl text-sm transition-all"
          style={{ background: 'var(--gold-subtle)', border: '1px solid var(--gold-border)', color: '#7a6f5e' }}>
          キャンセル
        </button>
      </div>
    </form>
  );
}
