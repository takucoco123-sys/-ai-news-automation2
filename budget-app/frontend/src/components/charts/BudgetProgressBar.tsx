import type { CategoryReport } from '../../types';

interface Props { items: CategoryReport[]; }

export default function BudgetProgressBar({ items }: Props) {
  const withBudget = items.filter((i) => i.budget != null);
  if (withBudget.length === 0)
    return <p className="text-gray-500 text-sm text-center py-8">予算が設定されていません</p>;
  return (
    <div className="space-y-4">
      {withBudget.map((item) => {
        const pct = Math.min(item.percent_used ?? 0, 100);
        const over = (item.percent_used ?? 0) > 100;
        return (
          <div key={item.category_id}>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="font-medium text-gray-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color, boxShadow: `0 0 8px ${item.color}` }} />
                {item.category_name}
              </span>
              <span className={over ? 'text-rose-400 font-semibold' : 'text-gray-400'}>
                ¥{item.total.toLocaleString()} <span className="text-gray-600">/</span> ¥{item.budget!.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  over
                    ? 'bg-gradient-to-r from-rose-500 to-pink-500 shadow-[0_0_12px_rgba(244,114,182,0.6)]'
                    : pct > 80
                    ? 'bg-gradient-to-r from-orange-400 to-amber-400 shadow-[0_0_12px_rgba(251,146,60,0.5)]'
                    : 'bg-gradient-to-r from-emerald-400 to-teal-400 shadow-[0_0_12px_rgba(52,211,153,0.5)]'
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
