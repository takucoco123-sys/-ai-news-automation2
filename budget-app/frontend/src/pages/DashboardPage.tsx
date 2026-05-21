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
    setLoading(true); setError('');
    Promise.all([getMonthlyReport(yearMonth), getTransactions({ year_month: yearMonth })])
      .then(([r, t]) => { setReport(r); setTransactions(t); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [yearMonth]);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">ダッシュボード</h1>
          <p className="text-sm text-gray-500 mt-1">今月のサマリーと予算進捗</p>
        </div>
        <input type="month" value={yearMonth} onChange={(e) => setYearMonth(e.target.value)}
          className="glass rounded-xl px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400/50" />
      </div>
      {error && <p className="text-rose-400 text-sm mb-4">{error}</p>}
      {loading ? <p className="text-gray-500 text-sm">読み込み中...</p> : report && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[
              { label: '収入', value: report.total_income, gradient: 'from-emerald-400 to-teal-300', glow: 'shadow-[0_0_40px_-12px_rgba(52,211,153,0.5)]', icon: '↗' },
              { label: '支出', value: report.total_expense, gradient: 'from-rose-400 to-pink-300', glow: 'shadow-[0_0_40px_-12px_rgba(244,114,182,0.5)]', icon: '↘' },
              { label: '残高', value: report.balance, gradient: report.balance >= 0 ? 'from-indigo-400 to-purple-300' : 'from-rose-400 to-orange-300', glow: report.balance >= 0 ? 'shadow-[0_0_40px_-12px_rgba(99,102,241,0.5)]' : 'shadow-[0_0_40px_-12px_rgba(244,114,182,0.5)]', icon: '◆' },
            ].map(({ label, value, gradient, glow, icon }) => (
              <div key={label} className={`glass rounded-2xl p-5 ${glow} relative overflow-hidden`}>
                <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br ${gradient} opacity-10 blur-2xl`} />
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-gray-400 uppercase tracking-wider">{label}</p>
                  <span className={`text-base bg-gradient-to-br ${gradient} bg-clip-text text-transparent`}>{icon}</span>
                </div>
                <p className={`text-2xl md:text-3xl font-bold bg-gradient-to-br ${gradient} bg-clip-text text-transparent`}>{formatYen(value)}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="glass rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4 tracking-wide">支出内訳</h3>
              <ExpensePieChart data={report.by_category.filter((c) => c.total > 0)} />
            </div>
            <div className="glass rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4 tracking-wide">予算進捗</h3>
              <BudgetProgressBar items={report.by_category} />
            </div>
          </div>
          <div className="glass rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-gray-300 mb-4 tracking-wide">最近の取引</h3>
            <TransactionList transactions={transactions} limit={5} />
          </div>
        </>
      )}
    </div>
  );
}
