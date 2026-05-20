import type { CategoryReport } from '../../types';

interface Props {
  items: CategoryReport[];
}

export default function BudgetProgressBar({ items }: Props) {
  const withBudget = items.filter((i) => i.budget != null);
  if (withBudget.length === 0)
    return <p className="text-gray-400 text-sm">予算が設定されていません</p>;

  return (
    <div className="space-y-3">
      {withBudget.map((item) => {
        const pct = Math.min(item.percent_used ?? 0, 100);
        const over = (item.percent_used ?? 0) > 100;
        return (
          <div key={item.category_id}>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-gray-700">
                <span className="mr-1" style={{ color: item.color }}>■</span>
                {item.category_name}
              </span>
              <span className={over ? 'text-red-600 font-semibold' : 'text-gray-500'}>
                ¥{item.total.toLocaleString()} / ¥{item.budget!.toLocaleString()}
                {over && ' ⚠️'}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${over ? 'bg-red-500' : pct > 80 ? 'bg-orange-400' : 'bg-emerald-500'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
