import { createClient } from '@/lib/supabase/server';
import { formatRupiah } from '@/lib/utils';
import {
  TrendingUp,
  ShoppingBag,
  ArrowRight,
  ShoppingCart,
} from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';
import EditableGreeting from '@/components/shared/EditableGreeting';

export const metadata: Metadata = {
  title: 'Dashboard',
};

export default async function DashboardPage() {
  const supabase = await createClient();

  // Fetch current user and role
  const { data: { user } } = await supabase.auth.getUser();
  let userRole = 'kasir';
  let userName = '';
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, full_name')
      .eq('id', user.id)
      .single();
    userRole = profile?.role ?? 'kasir';
    userName = profile?.full_name ?? '';
  }

  // Today's date range (WIB timezone)
  const today = new Date();
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  // Fetch today's transactions
  const { data: todayTransactions } = await supabase
    .from('transactions')
    .select('total_price')
    .gte('created_at', startOfDay.toISOString())
    .lte('created_at', endOfDay.toISOString());

  const todayRevenue =
    todayTransactions?.reduce((sum, t) => sum + t.total_price, 0) ?? 0;
  const todayCount = todayTransactions?.length ?? 0;

  // Fetch recent transactions
  const { data: recentTransactions } = await supabase
    .from('transactions')
    .select('id, total_price, payment_method, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  const greeting = userRole === 'admin'
    ? `Selamat Datang Bos Opin 👋`
    : `Selamat Datang${userName ? `, ${userName}` : ''} 👋`;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Greeting */}
      <div>
        <EditableGreeting initialName={userName || 'Bos Opin'} role={userRole} />
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          {today.toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Revenue */}
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Omzet Hari Ini</span>
            <div className="w-9 h-9 bg-orange-500/10 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-orange-400" />
            </div>
          </div>
          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{formatRupiah(todayRevenue)}</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{todayCount} transaksi selesai</p>
        </div>

        {/* Transactions */}
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Total Transaksi</span>
            <div className="w-9 h-9 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{todayCount}</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Transaksi hari ini</p>
        </div>

      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Quick actions */}
        <div className="card p-5">
          <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Aksi Cepat</h3>
          <div className="space-y-3">
            <Link
              href="/pos"
              id="btn-goto-pos"
              className="flex items-center justify-between p-4 bg-orange-500 hover:bg-orange-600 rounded-xl transition-all group glow-orange"
            >
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-5 h-5 text-white" />
                <div>
                  <p className="font-semibold text-white text-sm">Buka Kasir</p>
                  <p className="text-orange-200 text-xs">Mulai transaksi</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
            </Link>
            {userRole === 'admin' && (
              <Link
                href="/laporan"
                id="btn-goto-laporan"
                className="flex items-center justify-between p-4 rounded-xl transition-all group"
                style={{ backgroundColor: 'var(--bg-hover)' }}
              >
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
                  <div>
                    <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Lihat Laporan</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Tren & statistik</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" style={{ color: 'var(--text-muted)' }} />
              </Link>
            )}
          </div>
        </div>

      </div>
      {/* Recent transactions */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Transaksi Terakhir</h3>
          {userRole === 'admin' ? (
            <Link href="/laporan" className="text-orange-400 hover:text-orange-300 text-xs font-medium">
              Lihat semua →
            </Link>
          ) : null}
        </div>
        {!recentTransactions || recentTransactions.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingBag className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">Belum ada transaksi hari ini</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-main)' }}>
                  <th className="text-left py-2 px-3 font-medium">ID</th>
                  <th className="text-left py-2 px-3 font-medium">Waktu</th>
                  <th className="text-left py-2 px-3 font-medium">Metode</th>
                  <th className="text-right py-2 px-3 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((trx) => (
                  <tr
                    key={trx.id}
                    className="transition-colors"
                    style={{ borderBottom: '1px solid var(--border-light)' }}
                  >
                    <td className="py-3 px-3 font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                      #{trx.id.slice(0, 8)}
                    </td>
                    <td className="py-3 px-3" style={{ color: 'var(--text-secondary)' }}>
                      {new Date(trx.created_at).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={
                          trx.payment_method === 'CASH'
                            ? 'badge-success'
                            : 'badge-warning'
                        }
                      >
                        {trx.payment_method === 'CASH' ? 'Tunai' : 'QRIS'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {formatRupiah(trx.total_price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
