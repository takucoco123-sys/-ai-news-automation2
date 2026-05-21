import { useEffect, useState } from 'react';
import type { MonthlyReport, Transaction } from '../types';
import { getMonthlyReport, getTransactions } from '../api/client';
import ExpensePieChart from '../components/charts/ExpensePieChart';
import BudgetProgressBar from '../components/charts/BudgetProgressBar';
import DailyAreaChart from '../components/charts/DailyAreaChart';
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

  const [y, m] = yearMonth.split('-');
  const displayMonth = `${y}年${parseInt(m)}月`;

  return (
    <div className="max-w-2xl mx-auto md:max-w-none">
      {/* Month selector */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-medium" style={{ color: '#7a6f5e' }}>ダッシュボード</h2>
        <input type="month" value={yearMonth} onChange={(e) => setYearMonth(e.target.value)}
          className="rounded-xl px-3 py-1.5 text-sm focus:outline-none"
          style={{ background: 'var(--gold-subtle)', border: '1px solid var(--gold-border)', color: '#c9a84c' }} />
      </div>

      {error && <p className="text-rose-400 text-sm mb-4">{error}</p>}
      {loading ? <p className="text-sm py-8 text-center" style={{ color: '#666055' }}>読み込み中...</p> : report && (
        <>
          {/* Main balance card */}
          <div className="rounded-2xl p-6 mb-4 relative overflow-hidden" style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid var(--gold-border)' }}>
            <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full" style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.12), transparent)' }} />
            <p className="text-xs tracking-widest uppercase mb-2" style={{ color: '#7a6f5e' }}>今月の収支 · {displayMonth}</p>
            <p className="text-4xl md:text-5xl font-bold mb-3 tracking-tight" style={{ color: report.balance >= 0 ? '#c9a84c' : '#fb7185' }}>
              {report.balance >= 0 ? '' : '-'}{formatYen(report.balance)}
            </p>
            <div className="flex gap-6 text-sm">
              <span style={{ color: '#7a8a7a' }}>収入 <span className="font-semibold" style={{ color: '#4ade80' }}>{formatYen(report.total_income)}</span></span>
              <span style={{ color: '#8a7a7a' }}>支出 <span className="font-semibold" style={{ color: '#fb7185' }}>{formatYen(report.total_expense)}</span></span>
            </div>
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="rounded-2xl p-5 glass">
              <h3 className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: '#7a6f5e' }}>支出内訳</h3>
              <ExpensePieChart data={report.by_category.filter((c) => c.total > 0)} />
            </div>
            <div className="rounded-2xl p-5 glass">
              <h3 className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: '#7a6f5e' }}>予算進捗</h3>
              <BudgetProgressBar items={report.by_category} />
            </div>
          </div>

          {/* Daily trend */}
          <div className="rounded-2xl p-5 glass mb-4">
            <h3 className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: '#7a6f5e' }}>今月の推移</h3>
            <DailyAreaChart transactions={transactions} yearMonth={yearMonth} />
          </div>

          {/* Recent transactions */}
          <div className="rounded-2xl p-5 glass">
            <h3 className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: '#7a6f5e' }}>最近の取引</h3>
            <TransactionList transactions={transactions} limit={5} />
          </div>
        </>
      )}
    </div>
  );
}
