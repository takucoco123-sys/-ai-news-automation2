import { useState } from 'react';
import BudgetSettings from '../components/BudgetSettings';

const thisMonth = () => new Date().toISOString().slice(0, 7);

export default function BudgetsPage() {
  const [yearMonth, setYearMonth] = useState(thisMonth());
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">予算管理</h1>
          <p className="text-xs mt-1 uppercase tracking-widest" style={{ color: '#7a6f5e' }}>Budget Settings</p>
        </div>
        <input type="month" value={yearMonth} onChange={(e) => setYearMonth(e.target.value)}
          className="rounded-xl px-3 py-1.5 text-sm focus:outline-none"
          style={{ background: 'var(--gold-subtle)', border: '1px solid var(--gold-border)', color: '#c9a84c' }} />
      </div>
      <BudgetSettings yearMonth={yearMonth} />
    </div>
  );
}
