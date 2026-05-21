import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen text-gray-100">
      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-30 transition-transform duration-300 md:static md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar onClose={() => setOpen(false)} />
      </div>

      <div className="flex flex-col flex-1 min-w-0">
        <header className="flex items-center gap-3 px-4 py-3 glass border-b border-white/5 md:hidden">
          <button
            onClick={() => setOpen(true)}
            className="text-xl text-gray-300 hover:text-white leading-none transition-colors"
            aria-label="メニューを開く"
          >
            ☰
          </button>
          <h1 className="text-base font-semibold tracking-tight">
            <span className="text-gradient">家計簿</span>
          </h1>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
