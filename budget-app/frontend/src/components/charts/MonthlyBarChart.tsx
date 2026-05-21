import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import type { TrendPoint } from '../../types';

interface Props { data: TrendPoint[]; }

const formatYen = (v: unknown) => typeof v === 'number' ? `¥${v.toLocaleString()}` : '';

export default function MonthlyBarChart({ data }: Props) {
  if (data.length === 0)
    return <p className="text-center text-gray-500 py-12 text-sm">データなし</p>;
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 4, right: 16, left: 16, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="year_month" tick={{ fontSize: 11, fill: '#a0a0b0' }} stroke="rgba(255,255,255,0.1)" />
        <YAxis tickFormatter={(v) => `¥${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: '#a0a0b0' }} stroke="rgba(255,255,255,0.1)" />
        <Tooltip
          formatter={formatYen}
          cursor={{ fill: 'rgba(255,255,255,0.03)' }}
          contentStyle={{
            background: 'rgba(15, 15, 25, 0.95)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            color: '#e8e8f0',
            backdropFilter: 'blur(12px)',
          }}
        />
        <Legend wrapperStyle={{ fontSize: '12px', color: '#a0a0b0' }} />
        <Bar dataKey="income" name="収入" fill="url(#gradIncome)" radius={[6, 6, 0, 0]}>
          {data.map((_, i) => <Cell key={i} />)}
        </Bar>
        <Bar dataKey="expense" name="支出" fill="url(#gradExpense)" radius={[6, 6, 0, 0]}>
          {data.map((_, i) => <Cell key={i} />)}
        </Bar>
        <defs>
          <linearGradient id="gradIncome" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34d399" stopOpacity={0.9} />
            <stop offset="100%" stopColor="#14b8a6" stopOpacity={0.6} />
          </linearGradient>
          <linearGradient id="gradExpense" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb7185" stopOpacity={0.9} />
            <stop offset="100%" stopColor="#ec4899" stopOpacity={0.6} />
          </linearGradient>
        </defs>
      </BarChart>
    </ResponsiveContainer>
  );
}
