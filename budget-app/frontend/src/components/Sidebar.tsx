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
    <aside className="w-60 h-full glass border-r border-white/5 flex flex-col">
      <div className="px-5 py-6 border-b border-white/5">
        <h1 className="text-xl font-bold tracking-tight">
          <span className="text-gradient">家計簿</span>
        </h1>
        <p className="text-[11px] text-gray-500 mt-0.5 tracking-wider uppercase">Personal Finance</p>
      </div>
      <nav className="flex-1 py-4 space-y-1 px-3">
        {links.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={onClose}
            className={({ isActive }) =>
              `relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/10 text-white border border-indigo-400/20 shadow-[0_0_20px_-8px_rgba(99,102,241,0.5)]'
                  : 'text-gray-400 hover:text-gray-100 hover:bg-white/5'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-gradient-to-b from-indigo-400 to-purple-400" />
                )}
                <span className="text-base">{icon}</span>
                <span className="font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="px-5 py-4 border-t border-white/5">
        <p className="text-[10px] text-gray-600 tracking-wider">v1.0 · AI Powered</p>
      </div>
    </aside>
  );
}
