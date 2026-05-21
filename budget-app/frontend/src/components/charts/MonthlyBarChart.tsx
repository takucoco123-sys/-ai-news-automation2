import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import type { TrendPoint } from '../../types';

interface Props { data: TrendPoint[]; }

const formatYen = (v: unknown) => typeof v === 'number' ? `¥${v.toLocaleString()}` : '';

const tooltipStyle = {
  background: 'rgba(20, 16, 10, 0.96)',
  border: '1px solid rgba(201,168,76,0.2)',
  borderRadius: '10px',
  color: '#e8e4da',
  fontSize: 13,
};

export default function MonthlyBarChart({ data }: Props) {
  if (data.length === 0)
    return <p className="text-center py-12 text-sm" style={{ color: '#666055' }}>データなし</p>;
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
        <XAxis dataKey="year_month" tick={{ fontSize: 10, fill: '#666055' }} stroke="transparent" />
        <YAxis tickFormatter={(v) => `¥${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: '#666055' }} stroke="transparent" width={36} />
        <Tooltip formatter={formatYen} cursor={{ fill: 'rgba(201,168,76,0.04)' }} contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: '11px', color: '#7a6f5e' }} />
        <defs>
          <linearGradient id="gradIncome" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4ade80" stopOpacity={0.85} />
            <stop offset="100%" stopColor="#16a34a" stopOpacity={0.5} />
          </linearGradient>
          <linearGradient id="gradExpense" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c9a84c" stopOpacity={0.85} />
            <stop offset="100%" stopColor="#8b6914" stopOpacity={0.5} />
          </linearGradient>
        </defs>
        <Bar dataKey="income" name="収入" fill="url(#gradIncome)" radius={[5, 5, 0, 0]}>
          {data.map((_, i) => <Cell key={i} />)}
        </Bar>
        <Bar dataKey="expense" name="支出" fill="url(#gradExpense)" radius={[5, 5, 0, 0]}>
          {data.map((_, i) => <Cell key={i} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
