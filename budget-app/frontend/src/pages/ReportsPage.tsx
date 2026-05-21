import { useEffect, useState } from 'react';
import type { MonthlyReport, TrendPoint } from '../types';
import { getMonthlyReport, getTrend } from '../api/client';
import MonthlyBarChart from '../components/charts/MonthlyBarChart';
import ExpensePieChart from '../components/charts/ExpensePieChart';

const thisMonth = () => new Date().toISOString().slice(0, 7);
const formatYen = (v: number) => `¥${Math.abs(v).toLocaleString()}`;

export default function ReportsPage() {
  const [yearMonth, setYearMonth] = useState(thisMonth());
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([getMonthlyReport(yearMonth), getTrend(6)]).then(([r, t]) => { setReport(r); setTrend(t); }).finally(() => setLoading(false));
  }, [yearMonth]);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">レポート</h1>
          <p className="text-sm text-gray-500 mt-1">月次サマリーと推移分析</p>
        </div>
        <input type="month" value={yearMonth} onChange={(e) => setYearMonth(e.target.value)}
          className="glass rounded-xl px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400/50" />
      </div>
      {loading ? <p className="text-gray-500 text-sm">読み込み中...</p> : (
        <>
          {report && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[
                { label: '収入', value: report.total_income, gradient: 'from-emerald-400 to-teal-300' },
                { label: '支出', value: report.total_expense, gradient: 'from-rose-400 to-pink-300' },
                { label: '残高', value: report.balance, gradient: report.balance >= 0 ? 'from-indigo-400 to-purple-300' : 'from-rose-400 to-orange-300' },
              ].map(({ label, value, gradient }) => (
                <div key={label} className="glass rounded-2xl p-5">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">{label}</p>
                  <p className={`text-2xl font-bold bg-gradient-to-br ${gradient} bg-clip-text text-transparent`}>{formatYen(value)}</p>
                </div>
              ))}
            </div>
          )}
          <div className="glass rounded-2xl p-5 mb-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-4 tracking-wide">過去6ヶ月の収支推移</h3>
            <MonthlyBarChart data={trend} />
          </div>
          {report && (
            <div className="glass rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4 tracking-wide">{yearMonth} 支出カテゴリ内訳</h3>
              <ExpensePieChart data={report.by_category.filter((c) => c.total > 0)} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
