import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import Sidebar from './Sidebar';

const bottomTabs = [
  { to: '/',             label: 'ホーム', icon: '🏠', end: true },
  { to: '/transactions', label: '取引',   icon: '📝' },
  { to: '/planning',     label: '計画',   icon: '📋' },
  { to: '/reports',      label: 'レポート', icon: '📊' },
  { to: '/settings',     label: '設定',   icon: '⚙️' },
];

export default function Layout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen text-[#e8e4da]">
      {/* Desktop sidebar */}
      <div className="hidden md:block flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile drawer overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile slide-out drawer */}
      <div
        className="fixed inset-y-0 left-0 z-50 md:hidden transition-transform duration-300"
        style={{
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          width: 240,
        }}
      >
        <Sidebar onClose={() => setOpen(false)} />
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Mobile top header */}
        <header
          className="flex items-center gap-3 px-4 py-3 md:hidden flex-shrink-0"
          style={{ borderBottom: '1px solid var(--gold-border)', background: 'rgba(13,11,9,0.9)', backdropFilter: 'blur(12px)' }}
        >
          <button
            onClick={() => setOpen(true)}
            className="text-xl leading-none transition-colors"
            style={{ color: '#c9a84c' }}
            aria-label="メニューを開く"
          >
            ☰
          </button>
          <h1 className="flex-1 text-center text-base font-bold tracking-wider">
            <span className="text-gradient-gold">家計簿</span>
          </h1>
          {/* placeholder to center title */}
          <span className="w-6" />
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-8 pb-24 md:pb-8">
          <Outlet />
        </main>

        {/* Mobile bottom tab bar (quick access) */}
        <nav
          className="fixed bottom-0 left-0 right-0 md:hidden z-30 flex"
          style={{
            background: 'rgba(13,11,9,0.97)',
            borderTop: '1px solid var(--gold-border)',
            backdropFilter: 'blur(16px)',
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}
        >
          {bottomTabs.map(({ to, label, icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `relative flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 text-[10px] transition-all ${
                  isActive ? 'text-[#c9a84c]' : 'text-[#666055]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`text-xl leading-none transition-transform ${isActive ? 'scale-110' : ''}`}>{icon}</span>
                  <span className="font-medium">{label}</span>
                  {isActive && (
                    <span
                      className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-b-full"
                      style={{ background: 'var(--gold)', boxShadow: '0 0 8px var(--gold-glow)' }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
