import type { Transaction } from '../types';
import { deleteTransaction } from '../api/client';

interface Props {
  transactions: Transaction[];
  onEdit?: (t: Transaction) => void;
  onDeleted?: () => void;
  limit?: number;
}

const formatYen = (v: number) => `¥${v.toLocaleString()}`;

export default function TransactionList({ transactions, onEdit, onDeleted, limit }: Props) {
  const items = limit ? transactions.slice(0, limit) : transactions;

  const handleDelete = async (id: number) => {
    if (!confirm('この取引を削除しますか？')) return;
    await deleteTransaction(id);
    onDeleted?.();
  };

  if (items.length === 0)
    return <p className="text-center text-gray-500 py-12 text-sm">取引がありません</p>;

  return (
    <div className="space-y-2">
      {items.map((t) => (
        <div key={t.id} className="flex items-center justify-between glass glass-hover rounded-xl px-4 py-3 transition-all">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-1 h-10 rounded-full flex-shrink-0"
              style={{
                backgroundColor: t.category_color,
                boxShadow: `0 0 12px ${t.category_color}80`,
              }}
            />
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-100 truncate">{t.category_name}</p>
              <p className="text-xs text-gray-500 truncate">{t.date}{t.description ? ` · ${t.description}` : ''}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className={`text-sm font-semibold ${t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
              {t.type === 'income' ? '+' : '-'}{formatYen(t.amount)}
            </span>
            {onEdit && <button onClick={() => onEdit(t)} className="text-xs text-gray-500 hover:text-indigo-300 px-1 transition-colors">編集</button>}
            {onDeleted && <button onClick={() => handleDelete(t.id)} className="text-xs text-gray-500 hover:text-rose-400 px-1 transition-colors">削除</button>}
          </div>
        </div>
      ))}
    </div>
  );
}
