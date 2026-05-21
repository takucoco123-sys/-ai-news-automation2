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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">取引</h1>
        <div className="flex gap-2">
          <input type="month" value={yearMonth} onChange={(e) => setYearMonth(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          <button onClick={openNew} className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">+ 追加</button>
        </div>
      </div>
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">{editing ? '取引を編集' : '新しい取引'}</h2>
          <TransactionForm editing={editing} onSave={handleSave} onCancel={handleCancel} />
        </div>
      )}
      {loading ? <p className="text-gray-400 text-sm">読み込み中...</p> : <TransactionList transactions={transactions} onEdit={openEdit} onDeleted={load} />}
    </div>
  );
}
