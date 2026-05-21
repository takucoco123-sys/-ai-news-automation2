import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { CategoryReport } from '../../types';

interface Props { data: CategoryReport[]; }

const formatYen = (v: unknown) => typeof v === 'number' ? `¥${v.toLocaleString()}` : '';

export default function ExpensePieChart({ data }: Props) {
  const filtered = data.filter((d) => d.total > 0);
  if (filtered.length === 0)
    return <p className="text-center text-gray-500 py-12 text-sm">データなし</p>;
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={filtered}
          dataKey="total"
          nameKey="category_name"
          cx="50%"
          cy="50%"
          outerRadius={90}
          innerRadius={50}
          paddingAngle={2}
          label={({ name, percent }) => `${name ?? ''} ${(((percent as number) ?? 0) * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {filtered.map((entry) => (
            <Cell key={entry.category_id} fill={entry.color} stroke="rgba(7,7,12,0.8)" strokeWidth={2} />
          ))}
        </Pie>
        <Tooltip
          formatter={formatYen}
          contentStyle={{
            background: 'rgba(15, 15, 25, 0.95)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            color: '#e8e8f0',
            backdropFilter: 'blur(12px)',
          }}
        />
        <Legend wrapperStyle={{ fontSize: '12px', color: '#a0a0b0' }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
