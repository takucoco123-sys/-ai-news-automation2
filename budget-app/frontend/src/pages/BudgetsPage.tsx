import { useState } from 'react';
import BudgetSettings from '../components/BudgetSettings';

const thisMonth = () => new Date().toISOString().slice(0, 7);

export default function BudgetsPage() {
  const [yearMonth, setYearMonth] = useState(thisMonth());
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">予算管理</h1>
        <input type="month" value={yearMonth} onChange={(e) => setYearMonth(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
      </div>
      <p className="text-sm text-gray-500 mb-4">各カテゴリの月次予算を設定してください。ダッシュボードで進捗を確認できます。</p>
      <BudgetSettings yearMonth={yearMonth} />
    </div>
  );
}
