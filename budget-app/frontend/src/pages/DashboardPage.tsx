import { useEffect, useState } from 'react';
import type { MonthlyReport, Transaction } from '../types';
import { getMonthlyReport, getTransactions } from '../api/client';
import ExpensePieChart from '../components/charts/ExpensePieChart';
import BudgetProgressBar from '../components/charts/BudgetProgressBar';
import TransactionList from '../components/TransactionList';

const thisMonth = () => new Date().toISOString().slice(0, 7);
const formatYen = (v: number) => `¥${Math.abs(v).toLocaleString()}`;

export default function DashboardPage() {
  const [yearMonth, setYearMonth] = useState(thisMonth());
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    Promise.all([getMonthlyReport(yearMonth), getTransactions({ year_month: yearMonth })])
      .then(([r, t]) => { setReport(r); setTransactions(t); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [yearMonth]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
        <input
          type="month"
          value={yearMonth}
          onChange={(e) => setYearMonth(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      {loading ? (
        <p className="text-gray-400">読み込み中...</p>
      ) : report && (
        <>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: '収入', value: report.total_income, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: '支出', value: report.total_expense, color: 'text-red-500', bg: 'bg-red-50' },
              { label: '残高', value: report.balance, color: report.balance >= 0 ? 'text-indigo-600' : 'text-red-600', bg: 'bg-indigo-50' },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className={`${bg} rounded-xl p-4`}>
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className={`text-xl font-bold ${color}`}>{formatYen(value)}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">支出内訳</h3>
              <ExpensePieChart data={report.by_category.filter((c) => c.total > 0)} />
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">予算進捗</h3>
              <BudgetProgressBar items={report.by_category} />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">最近の取引</h3>
            <TransactionList transactions={transactions} limit={5} />
          </div>
        </>
      )}
    </div>
  );
}
