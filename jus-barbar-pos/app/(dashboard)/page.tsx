import { createClient } from '@/lib/supabase/server';
import { formatRupiah } from '@/lib/utils';
import {
  TrendingUp,
  ShoppingBag,
  AlertTriangle,
  ArrowRight,
  ShoppingCart,
} from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard',
};

export default async function DashboardPage() {
  const supabase = await createClient();

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

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Greeting */}
      <div>
        <h2 className="text-2xl font-bold text-white">
          Selamat Datang 👋
        </h2>
        <p className="text-slate-400 text-sm mt-1">
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
            <span className="text-slate-400 text-sm font-medium">Omzet Hari Ini</span>
            <div className="w-9 h-9 bg-orange-500/10 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-orange-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{formatRupiah(todayRevenue)}</p>
          <p className="text-slate-500 text-xs">{todayCount} transaksi selesai</p>
        </div>

        {/* Transactions */}
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm font-medium">Total Transaksi</span>
            <div className="w-9 h-9 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{todayCount}</p>
          <p className="text-slate-500 text-xs">Transaksi hari ini</p>
        </div>

      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Quick actions */}
        <div className="card p-5">
          <h3 className="font-semibold text-white mb-4">Aksi Cepat</h3>
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
            <Link
              href="/laporan"
              id="btn-goto-laporan"
              className="flex items-center justify-between p-4 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all group"
            >
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-slate-300" />
                <div>
                  <p className="font-semibold text-white text-sm">Lihat Laporan</p>
                  <p className="text-slate-400 text-xs">Tren & statistik</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

      </div>
      {/* Recent transactions */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">Transaksi Terakhir</h3>
          <Link href="/laporan" className="text-orange-400 hover:text-orange-300 text-xs font-medium">
            Lihat semua →
          </Link>
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
                <tr className="text-slate-500 border-b border-slate-800">
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
                    className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-3 px-3 text-slate-400 font-mono text-xs">
                      #{trx.id.slice(0, 8)}
                    </td>
                    <td className="py-3 px-3 text-slate-300">
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
                    <td className="py-3 px-3 text-right font-semibold text-white">
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
