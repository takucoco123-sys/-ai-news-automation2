import { Outlet, NavLink } from 'react-router-dom';
import Sidebar from './Sidebar';

const bottomTabs = [
  { to: '/',             label: 'AI',     icon: '🤖', end: true },
  { to: '/dashboard',    label: 'ホーム',  icon: '🏠' },
  { to: '/transactions', label: '取引',    icon: '📝' },
  { to: '/reports',      label: 'レポート', icon: '📊' },
  { to: '/settings',     label: '設定',    icon: '⚙️' },
];

export default function Layout() {
  return (
    <div className="flex h-screen text-[#e8e4da]">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Mobile top header */}
        <header className="flex items-center justify-center px-4 py-3 md:hidden" style={{ borderBottom: '1px solid var(--border)', background: 'rgba(13,11,9,0.85)', backdropFilter: 'blur(12px)' }}>
          <h1 className="text-base font-bold tracking-wider">
            <span className="text-gradient-gold">家計簿</span>
          </h1>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-8 pb-24 md:pb-8">
          <Outlet />
        </main>

        {/* Mobile bottom tab bar */}
        <nav className="fixed bottom-0 left-0 right-0 md:hidden z-40 flex" style={{ background: 'rgba(13,11,9,0.95)', borderTop: '1px solid var(--gold-border)', backdropFilter: 'blur(16px)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
          {bottomTabs.map(({ to, label, icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 text-[10px] transition-all ${
                  isActive ? 'text-[#c9a84c]' : 'text-[#666055]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`text-xl leading-none transition-all ${isActive ? 'scale-110' : ''}`}>{icon}</span>
                  <span className="font-medium">{label}</span>
                  {isActive && <span className="absolute bottom-0 h-0.5 w-8" style={{ background: 'var(--gold)', boxShadow: '0 0 8px var(--gold-glow)' }} />}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
