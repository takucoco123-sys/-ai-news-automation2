import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import type { TrendPoint } from '../../types';

interface Props {
  data: TrendPoint[];
}

const formatYen = (v: unknown) =>
  typeof v === 'number' ? `¥${v.toLocaleString()}` : '';

export default function MonthlyBarChart({ data }: Props) {
  if (data.length === 0)
    return <p className="text-center text-gray-400 py-8">データなし</p>;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 4, right: 16, left: 16, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="year_month" tick={{ fontSize: 12 }} />
        <YAxis tickFormatter={(v) => `¥${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
        <Tooltip formatter={formatYen} />
        <Legend />
        <Bar dataKey="income" name="収入" fill="#10b981" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expense" name="支出" fill="#ef4444" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
