import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { CategoryReport } from '../../types';

interface Props { data: CategoryReport[]; }

const formatYen = (v: unknown) => typeof v === 'number' ? `¥${v.toLocaleString()}` : '';

export default function ExpensePieChart({ data }: Props) {
  const filtered = data.filter((d) => d.total > 0);
  if (filtered.length === 0) return <p className="text-center text-gray-400 py-8">データなし</p>;
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={filtered} dataKey="total" nameKey="category_name" cx="50%" cy="50%" outerRadius={90}
          label={({ name, percent }) => `${name ?? ''} ${(((percent as number) ?? 0) * 100).toFixed(0)}%`}
          labelLine={false}>
          {filtered.map((entry) => <Cell key={entry.category_id} fill={entry.color} />)}
        </Pie>
        <Tooltip formatter={formatYen} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
