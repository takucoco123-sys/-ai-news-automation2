import { useEffect, useState } from 'react';
import type { MonthlyReport, TrendPoint } from '../types';
import { getMonthlyReport, getTrend } from '../api/client';
import MonthlyBarChart from '../components/charts/MonthlyBarChart';
import ExpensePieChart from '../components/charts/ExpensePieChart';

const thisMonth = () => new Date().toISOString().slice(0, 7);
const fmt = (v: number) => `¥${Math.abs(v).toLocaleString()}`;

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
    <div className="max-w-2xl mx-auto md:max-w-none">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">レポート</h1>
          <p className="text-xs mt-1 uppercase tracking-widest" style={{ color: '#7a6f5e' }}>Monthly Report</p>
        </div>
        <input type="month" value={yearMonth} onChange={(e) => setYearMonth(e.target.value)}
          className="rounded-xl px-3 py-1.5 text-sm focus:outline-none"
          style={{ background: 'var(--gold-subtle)', border: '1px solid var(--gold-border)', color: '#c9a84c' }} />
      </div>
      {loading ? <p className="text-center py-12 text-sm" style={{ color: '#666055' }}>読み込み中...</p> : (
        <>
          {report && (
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: '収入', value: report.total_income, color: '#4ade80' },
                { label: '支出', value: report.total_expense, color: '#c9a84c' },
                { label: '残高', value: report.balance, color: report.balance >= 0 ? '#c9a84c' : '#fb7185' },
              ].map(({ label, value, color }) => (
                <div key={label} className="glass rounded-2xl p-4">
                  <p className="text-xs uppercase tracking-widest mb-2" style={{ color: '#7a6f5e' }}>{label}</p>
                  <p className="text-lg font-bold" style={{ color }}>{fmt(value)}</p>
                </div>
              ))}
            </div>
          )}
          <div className="glass rounded-2xl p-5 mb-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#7a6f5e' }}>過去6ヶ月の収支推移</h3>
            <MonthlyBarChart data={trend} />
          </div>
          {report && (
            <div className="glass rounded-2xl p-5">
              <h3 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#7a6f5e' }}>支出カテゴリ内訳</h3>
              <ExpensePieChart data={report.by_category.filter((c) => c.total > 0)} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
