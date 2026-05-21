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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">レポート</h1>
        <input type="month" value={yearMonth} onChange={(e) => setYearMonth(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
      </div>
      {loading ? <p className="text-gray-400 text-sm">読み込み中...</p> : (
        <>
          {report && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: '収入', value: report.total_income, color: 'text-emerald-600' },
                { label: '支出', value: report.total_expense, color: 'text-red-500' },
                { label: '残高', value: report.balance, color: report.balance >= 0 ? 'text-indigo-600' : 'text-red-600' },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-white rounded-xl border border-gray-100 p-4">
                  <p className="text-xs text-gray-500 mb-1">{label}</p>
                  <p className={`text-xl font-bold ${color}`}>{formatYen(value)}</p>
                </div>
              ))}
            </div>
          )}
          <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">過去6ヶ月の収支推移</h3>
            <MonthlyBarChart data={trend} />
          </div>
          {report && (
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">{yearMonth} 支出カテゴリ内訳</h3>
              <ExpensePieChart data={report.by_category.filter((c) => c.total > 0)} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
