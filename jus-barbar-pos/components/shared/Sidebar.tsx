'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  BarChart3,
  GlassWater,
  X,
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/pos', label: 'Kasir (POS)', icon: ShoppingCart },
  { href: '/produk', label: 'Manajemen Produk', icon: Package },
  { href: '/laporan', label: 'Laporan', icon: BarChart3 },
];

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className="flex flex-col h-full"
      style={{ backgroundColor: 'var(--bg-sidebar)', borderRight: '1px solid var(--border-main)' }}
    >
      {/* Logo */}
      <div
        className="flex items-center justify-between p-5"
        style={{ borderBottom: '1px solid var(--border-main)' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30 flex-shrink-0">
            <GlassWater className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-sm leading-tight" style={{ color: 'var(--text-primary)' }}>Jus Bar Bar</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Point of Sale</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="transition-colors lg:hidden"
            style={{ color: 'var(--text-muted)' }}
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={isActive ? 'nav-item-active' : 'nav-item'}
              style={isActive ? { color: '#f97316' } : {}}
            >
              <Icon
                className="w-5 h-5 flex-shrink-0"
                style={isActive ? { color: '#f97316' } : {}}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4" style={{ borderTop: '1px solid var(--border-main)' }}>
        <p className="text-xs text-center" style={{ color: 'var(--text-dim)' }}>v1.0.0</p>
      </div>
    </aside>
  );
}
