import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { CategoryReport } from '../../types';

interface Props { data: CategoryReport[]; }

const formatYen = (v: unknown) => typeof v === 'number' ? `¥${v.toLocaleString()}` : '';

const tooltipStyle = {
  background: 'rgba(20, 16, 10, 0.96)',
  border: '1px solid rgba(201,168,76,0.2)',
  borderRadius: '10px',
  color: '#e8e4da',
  fontSize: 13,
};

export default function ExpensePieChart({ data }: Props) {
  const filtered = data.filter((d) => d.total > 0);
  if (filtered.length === 0)
    return <p className="text-center py-12 text-sm" style={{ color: '#666055' }}>データなし</p>;
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={filtered} dataKey="total" nameKey="category_name" cx="50%" cy="50%"
          outerRadius={85} innerRadius={50} paddingAngle={2}
          label={({ percent }) => `${(((percent as number) ?? 0) * 100).toFixed(0)}%`}
          labelLine={false}>
          {filtered.map((entry) => (
            <Cell key={entry.category_id} fill={entry.color} stroke="rgba(13,11,9,0.8)" strokeWidth={2} />
          ))}
        </Pie>
        <Tooltip formatter={formatYen} contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: '11px', color: '#7a6f5e' }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
