import { NavLink } from 'react-router-dom';

const links = [
  { to: '/',             label: 'AIアシスタント', icon: '🤖' },
  { to: '/dashboard',    label: 'ダッシュボード', icon: '🏠' },
  { to: '/transactions', label: '取引',           icon: '📝' },
  { to: '/planning',     label: '収支計画',       icon: '📋' },
  { to: '/categories',   label: 'カテゴリ',       icon: '🏷️' },
  { to: '/budgets',      label: '予算',           icon: '🎯' },
  { to: '/reports',      label: 'レポート',       icon: '📊' },
  { to: '/settings',     label: '設定',           icon: '⚙️' },
];

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  return (
    <aside className="w-60 h-full flex flex-col" style={{ background: 'rgba(13,11,9,0.98)', borderRight: '1px solid var(--gold-border)' }}>
      {/* Logo */}
      <div className="px-5 py-6" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid var(--gold-border)' }}>
            <span className="text-base">📒</span>
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-gradient-gold">家計簿</h1>
            <p className="text-[10px] tracking-widest uppercase" style={{ color: '#666055' }}>Smart Finance</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-0.5 px-3">
        {links.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={onClose}
            className={({ isActive }) =>
              `relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                isActive
                  ? 'text-[#c9a84c] font-medium'
                  : 'text-[#7a6f5e] hover:text-[#e8e4da] hover:bg-white/3'
              }`
            }
            style={({ isActive }) => isActive ? { background: 'var(--gold-subtle)', border: '1px solid var(--gold-border)' } : { border: '1px solid transparent' }}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-0.5 rounded-r-full" style={{ background: 'var(--gold)', boxShadow: '0 0 8px var(--gold-glow)' }} />
                )}
                <span className="text-base">{icon}</span>
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-5 py-4" style={{ borderTop: '1px solid var(--border)' }}>
        <p className="text-[10px] tracking-wider" style={{ color: '#4a4035' }}>Powered by Claude AI</p>
      </div>
    </aside>
  );
}
