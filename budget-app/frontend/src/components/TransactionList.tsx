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
    return <p className="text-center text-gray-400 py-8 text-sm">取引がありません</p>;

  return (
    <div className="space-y-2">
      {items.map((t) => (
        <div
          key={t.id}
          className="flex items-center justify-between bg-white rounded-lg border border-gray-100 px-4 py-3 hover:shadow-sm transition-shadow"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-2 h-10 rounded-full"
              style={{ backgroundColor: t.category_color }}
            />
            <div>
              <p className="text-sm font-medium text-gray-800">{t.category_name}</p>
              <p className="text-xs text-gray-400">{t.date}{t.description ? ` · ${t.description}` : ''}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`text-sm font-semibold ${t.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}
            >
              {t.type === 'income' ? '+' : '-'}{formatYen(t.amount)}
            </span>
            {onEdit && (
              <button
                onClick={() => onEdit(t)}
                className="text-xs text-gray-400 hover:text-indigo-600 px-1"
              >
                編集
              </button>
            )}
            {onDeleted && (
              <button
                onClick={() => handleDelete(t.id)}
                className="text-xs text-gray-400 hover:text-red-500 px-1"
              >
                削除
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
