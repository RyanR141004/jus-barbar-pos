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
import { useRole } from '@/components/shared/RoleProvider';

const allNavItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'kasir'] },
  { href: '/pos', label: 'Kasir (POS)', icon: ShoppingCart, roles: ['admin', 'kasir'] },
  { href: '/produk', label: 'Manajemen Produk', icon: Package, roles: ['admin'] },
  { href: '/laporan', label: 'Laporan', icon: BarChart3, roles: ['admin'] },
];

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const { role } = useRole();

  // Filter nav items berdasarkan role user
  const navItems = allNavItems.filter(
    (item) => role && item.roles.includes(role)
  );

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
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {role === 'admin' ? 'Admin Panel' : 'Point of Sale'}
            </p>
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
        <div className="text-center">
          {role && (
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                role === 'admin'
                  ? 'bg-orange-500/10 text-orange-400'
                  : 'bg-blue-500/10 text-blue-400'
              }`}
            >
              {role === 'admin' ? '👑 Admin' : '🧑‍💼 Kasir'}
            </span>
          )}
          <p className="text-xs mt-2" style={{ color: 'var(--text-dim)' }}>v1.0.0</p>
        </div>
      </div>
    </aside>
  );
}
