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
    return <p className="text-center py-12 text-sm" style={{ color: '#666055' }}>取引がありません</p>;

  return (
    <div className="space-y-2">
      {items.map((t) => (
        <div key={t.id} className="flex items-center gap-3 rounded-xl px-3 py-3 transition-all glass-hover cursor-default" style={{ border: '1px solid transparent' }}>
          {/* Category icon */}
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
            style={{ background: `${t.category_color}18`, border: `1px solid ${t.category_color}30` }}>
            {t.category_icon || '📁'}
          </div>
          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: '#e8e4da' }}>{t.description || t.category_name}</p>
            <p className="text-xs truncate" style={{ color: '#666055' }}>{t.category_name} · {t.date}</p>
          </div>
          {/* Amount */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-sm font-semibold" style={{ color: t.type === 'income' ? '#4ade80' : '#fb7185' }}>
              {t.type === 'income' ? '+' : '-'}{formatYen(t.amount)}
            </span>
            {onEdit && <button onClick={() => onEdit(t)} className="text-xs px-1 transition-colors" style={{ color: '#666055' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#c9a84c')} onMouseLeave={(e) => (e.currentTarget.style.color = '#666055')}>編集</button>}
            {onDeleted && <button onClick={() => handleDelete(t.id)} className="text-xs px-1 transition-colors" style={{ color: '#666055' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#fb7185')} onMouseLeave={(e) => (e.currentTarget.style.color = '#666055')}>削除</button>}
          </div>
        </div>
      ))}
    </div>
  );
}
