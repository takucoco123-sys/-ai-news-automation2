import type { CategoryReport } from '../../types';

interface Props { items: CategoryReport[]; }

export default function BudgetProgressBar({ items }: Props) {
  const withBudget = items.filter((i) => i.budget != null);
  if (withBudget.length === 0)
    return <p className="text-center py-8 text-sm" style={{ color: '#666055' }}>予算が設定されていません</p>;
  return (
    <div className="space-y-4">
      {withBudget.map((item) => {
        const pct = Math.min(item.percent_used ?? 0, 100);
        const over = (item.percent_used ?? 0) > 100;
        return (
          <div key={item.category_id}>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="font-medium flex items-center gap-1.5" style={{ color: '#e8e4da' }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color, boxShadow: `0 0 6px ${item.color}` }} />
                {item.category_name}
              </span>
              <span className="text-xs" style={{ color: over ? '#fb7185' : '#7a6f5e' }}>
                ¥{item.total.toLocaleString()} / ¥{item.budget!.toLocaleString()}
              </span>
            </div>
            <div className="w-full rounded-full h-1.5 overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div className="h-1.5 rounded-full transition-all duration-700"
                style={{
                  width: `${pct}%`,
                  background: over
                    ? 'linear-gradient(90deg, #fb7185, #ec4899)'
                    : pct > 80
                    ? 'linear-gradient(90deg, #fb923c, #f59e0b)'
                    : 'linear-gradient(90deg, #c9a84c, #dfc17a)',
                  boxShadow: over ? '0 0 8px rgba(251,113,133,0.5)' : '0 0 8px rgba(201,168,76,0.4)',
                }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
