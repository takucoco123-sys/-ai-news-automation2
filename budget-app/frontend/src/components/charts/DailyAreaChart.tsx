import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { Transaction } from '../../types';

interface Props {
  transactions: Transaction[];
  yearMonth: string;
}

const formatYen = (v: unknown) => typeof v === 'number' ? `¥${v.toLocaleString()}` : '';

export default function DailyAreaChart({ transactions, yearMonth }: Props) {
  const [year, month] = yearMonth.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const todayStr = new Date().toISOString().slice(0, 10);

  const byDate: Record<string, number> = {};
  transactions.forEach((t) => {
    const amount = t.type === 'income' ? t.amount : -t.amount;
    byDate[t.date] = (byDate[t.date] || 0) + amount;
  });

  let cumulative = 0;
  const data = Array.from({ length: daysInMonth }, (_, i) => {
    const d = i + 1;
    const dateStr = `${yearMonth}-${String(d).padStart(2, '0')}`;
    if (dateStr > todayStr) return null;
    cumulative += byDate[dateStr] || 0;
    return { date: `${month}/${d}`, value: cumulative };
  }).filter(Boolean) as { date: string; value: number }[];

  if (data.length === 0) return <p className="text-center py-12 text-sm" style={{ color: '#666055' }}>データなし</p>;

  const isPositive = data[data.length - 1]?.value >= 0;

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isPositive ? '#c9a84c' : '#fb7185'} stopOpacity={0.4} />
            <stop offset="100%" stopColor={isPositive ? '#c9a84c' : '#fb7185'} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: '#666055' }}
          stroke="transparent"
          interval="preserveStartEnd"
        />
        <YAxis
          tickFormatter={(v) => `${(v / 10000).toFixed(0)}万`}
          tick={{ fontSize: 10, fill: '#666055' }}
          stroke="transparent"
          width={36}
        />
        <Tooltip
          formatter={formatYen}
          labelStyle={{ color: '#c9a84c', fontSize: 12 }}
          contentStyle={{
            background: 'rgba(20, 16, 10, 0.96)',
            border: '1px solid rgba(201,168,76,0.2)',
            borderRadius: '10px',
            color: '#e8e4da',
            fontSize: 13,
          }}
        />
        <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" />
        <Area
          type="monotone"
          dataKey="value"
          stroke={isPositive ? '#c9a84c' : '#fb7185'}
          strokeWidth={2.5}
          fill="url(#goldGrad)"
          dot={false}
          activeDot={{ r: 5, fill: isPositive ? '#c9a84c' : '#fb7185', strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
