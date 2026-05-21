import { useState } from 'react';
import BudgetSettings from '../components/BudgetSettings';

const thisMonth = () => new Date().toISOString().slice(0, 7);

export default function BudgetsPage() {
  const [yearMonth, setYearMonth] = useState(thisMonth());
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">予算管理</h1>
          <p className="text-sm text-gray-500 mt-1">各カテゴリの月次予算を設定してください</p>
        </div>
        <input type="month" value={yearMonth} onChange={(e) => setYearMonth(e.target.value)}
          className="glass rounded-xl px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400/50" />
      </div>
      <BudgetSettings yearMonth={yearMonth} />
    </div>
  );
}
