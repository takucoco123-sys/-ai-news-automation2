import { useEffect, useState } from 'react';
import type { Transaction } from '../types';
import { getTransactions } from '../api/client';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';

const thisMonth = () => new Date().toISOString().slice(0, 7);

type Tab = 'all' | 'income' | 'expense';

export default function TransactionsPage() {
  const [yearMonth, setYearMonth] = useState(thisMonth());
  const [tab, setTab] = useState<Tab>('all');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => { setLoading(true); getTransactions({ year_month: yearMonth }).then(setTransactions).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, [yearMonth]);

  const openNew = () => { setEditing(null); setShowForm(true); };
  const openEdit = (t: Transaction) => { setEditing(t); setShowForm(true); };
  const handleSave = () => { setShowForm(false); setEditing(null); load(); };
  const handleCancel = () => { setShowForm(false); setEditing(null); };

  const filtered = tab === 'all' ? transactions : transactions.filter((t) => t.type === tab);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'all', label: 'すべて' },
    { key: 'income', label: '収入' },
    { key: 'expense', label: '支出' },
  ];

  return (
    <div className="max-w-2xl mx-auto md:max-w-none">
      <div className="flex items-center justify-between mb-5">
        <div className="flex gap-1 rounded-xl p-1" style={{ background: 'var(--gold-subtle)', border: '1px solid var(--gold-border)' }}>
          {tabs.map(({ key, label }) => (
            <button key={key} onClick={() => setTab(key)}
              className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
              style={tab === key
                ? { background: 'var(--gold)', color: '#1a1410' }
                : { color: '#7a6f5e' }}>
              {label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input type="month" value={yearMonth} onChange={(e) => setYearMonth(e.target.value)}
            className="rounded-xl px-3 py-1.5 text-sm focus:outline-none"
            style={{ background: 'var(--gold-subtle)', border: '1px solid var(--gold-border)', color: '#c9a84c' }} />
          <button onClick={openNew} className="btn-gold px-4 py-1.5 rounded-xl text-sm">+ 追加</button>
        </div>
      </div>

      {showForm && (
        <div className="glass rounded-2xl p-6 mb-4">
          <h2 className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: '#7a6f5e' }}>{editing ? '取引を編集' : '新しい取引'}</h2>
          <TransactionForm editing={editing} onSave={handleSave} onCancel={handleCancel} />
        </div>
      )}

      {loading
        ? <p className="text-center py-12 text-sm" style={{ color: '#666055' }}>読み込み中...</p>
        : <TransactionList transactions={filtered} onEdit={openEdit} onDeleted={load} />
      }

      {/* Add button (mobile floating) */}
      {!showForm && (
        <button onClick={openNew} className="fixed bottom-20 right-5 md:hidden btn-gold w-14 h-14 rounded-full text-2xl shadow-[0_4px_24px_rgba(201,168,76,0.4)] z-30">
          +
        </button>
      )}
    </div>
  );
}
