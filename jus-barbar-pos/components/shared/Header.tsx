'use client';

import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LogOut, Menu, Sun, Moon } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '@/components/shared/ThemeProvider';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/pos': 'Kasir (POS)',
  '/produk': 'Manajemen Produk',
  '/laporan': 'Laporan Penjualan',
};

interface HeaderProps {
  onMenuOpen?: () => void;
}

export default function Header({ onMenuOpen }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [loggingOut, setLoggingOut] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const title =
    Object.entries(pageTitles).find(([path]) =>
      path === '/' ? pathname === '/' : pathname.startsWith(path)
    )?.[1] ?? 'Dashboard';

  const handleLogout = async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <header
      className="h-16 backdrop-blur-sm flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30"
      style={{
        backgroundColor: 'var(--bg-header)',
        borderBottom: '1px solid var(--border-main)',
      }}
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuOpen}
          className="transition-colors lg:hidden"
          style={{ color: 'var(--text-muted)' }}
          aria-label="Buka menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>{title}</h1>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <button
          id="btn-toggle-theme"
          onClick={toggleTheme}
          className="flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg transition-all duration-200"
          style={{
            color: 'var(--text-muted)',
            backgroundColor: 'transparent',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
            e.currentTarget.style.color = theme === 'dark' ? '#fbbf24' : '#6366f1';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--text-muted)';
          }}
          title={theme === 'dark' ? 'Mode Siang' : 'Mode Malam'}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">
            {theme === 'dark' ? 'Siang' : 'Malam'}
          </span>
        </button>

        {/* Logout */}
        <button
          id="btn-logout"
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#f87171';
            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-muted)';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Keluar</span>
        </button>
      </div>
    </header>
  );
}
