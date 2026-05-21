import { NavLink } from 'react-router-dom';

const links = [
  { to: '/',             label: 'AIアシスタント', icon: '🤖' },
  { to: '/dashboard',    label: 'ダッシュボード', icon: '🏠' },
  { to: '/transactions', label: '取引',           icon: '📝' },
  { to: '/categories',   label: 'カテゴリ',       icon: '🏷️' },
  { to: '/budgets',      label: '予算',           icon: '🎯' },
  { to: '/reports',      label: 'レポート',       icon: '📊' },
  { to: '/settings',     label: '設定',           icon: '⚙️' },
];

interface Props {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: Props) {
  return (
    <aside className="w-56 h-full bg-white border-r border-gray-200 flex flex-col">
      <div className="px-4 py-5 border-b border-gray-200">
        <h1 className="text-lg font-bold text-gray-800">💰 家計簿</h1>
      </div>
      <nav className="flex-1 py-4 space-y-1 px-2">
        {links.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              }`
            }
          >
            <span>{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
