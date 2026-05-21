import { useEffect, useState } from 'react';
import type { Transaction } from '../types';
import { getTransactions } from '../api/client';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';

const thisMonth = () => new Date().toISOString().slice(0, 7);

export default function TransactionsPage() {
  const [yearMonth, setYearMonth] = useState(thisMonth());
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

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">取引</h1>
          <p className="text-sm text-gray-500 mt-1">収入・支出の記録</p>
        </div>
        <div className="flex gap-2">
          <input type="month" value={yearMonth} onChange={(e) => setYearMonth(e.target.value)}
            className="glass rounded-xl px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400/50" />
          <button onClick={openNew} className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:shadow-[0_0_24px_-4px_rgba(99,102,241,0.6)] transition-all">+ 追加</button>
        </div>
      </div>
      {showForm && (
        <div className="glass rounded-2xl p-6 mb-4">
          <h2 className="text-sm font-semibold text-gray-300 mb-4 tracking-wide">{editing ? '取引を編集' : '新しい取引'}</h2>
          <TransactionForm editing={editing} onSave={handleSave} onCancel={handleCancel} />
        </div>
      )}
      {loading ? <p className="text-gray-500 text-sm">読み込み中...</p> : <TransactionList transactions={transactions} onEdit={openEdit} onDeleted={load} />}
    </div>
  );
}
