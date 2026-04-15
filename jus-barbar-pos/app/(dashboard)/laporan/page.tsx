'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatRupiah, formatDateShort } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, ShoppingBag, Award, RefreshCw, Calendar } from 'lucide-react';
import type { DailySalesData } from '@/types/database.types';

type Period = '7' | '14' | '30';

// Custom recharts tooltip — typed properly to avoid 'any'
interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: { count: number } }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 shadow-xl">
        <p className="text-slate-400 text-xs mb-1">{label}</p>
        <p className="text-white font-bold">{formatRupiah(payload[0].value)}</p>
        <p className="text-slate-400 text-xs">{payload[0].payload.count} transaksi</p>
      </div>
    );
  }
  return null;
};

export default function LaporanPage() {
  const supabase = useMemo(() => createClient(), []);
  const [period, setPeriod] = useState<Period>('7');
  const [chartData, setChartData] = useState<DailySalesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [topProducts, setTopProducts] = useState<
    { name: string; total_qty: number; total_revenue: number }[]
  >([]);

  const fetchChartData = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/reports/daily?days=${period}`);
    const data: DailySalesData[] = await res.json();
    setChartData(
      data.map((d) => ({
        ...d,
        date: formatDateShort(d.date + 'T00:00:00'),
      }))
    );
    setLoading(false);
  }, [period]);

  const fetchTopProducts = useCallback(async () => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(period) + 1);
    startDate.setHours(0, 0, 0, 0);

    const { data } = await supabase
      .from('transaction_items')
      .select(`
        quantity,
        subtotal,
        products(name),
        transactions!inner(created_at)
      `)
      .gte('transactions.created_at', startDate.toISOString());

    if (!data) return;

    const grouped: Record<string, { total_qty: number; total_revenue: number }> = {};
    (data as unknown as Array<{
      quantity: number;
      subtotal: number;
      products: { name: string } | null;
    }>).forEach((item) => {
      const name = item.products?.name ?? 'Unknown';
      if (!grouped[name]) grouped[name] = { total_qty: 0, total_revenue: 0 };
      grouped[name].total_qty += item.quantity;
      grouped[name].total_revenue += item.subtotal;
    });

    const sorted = Object.entries(grouped)
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.total_qty - a.total_qty)
      .slice(0, 5);

    setTopProducts(sorted);
  }, [period, supabase]);

  useEffect(() => {
    fetchChartData();
    fetchTopProducts();
  }, [fetchChartData, fetchTopProducts]);

  // Summary stats
  const totalRevenue = chartData.reduce((sum, d) => sum + d.total, 0);
  const totalTransactions = chartData.reduce((sum, d) => sum + d.count, 0);
  const activeDays = chartData.filter((d) => d.total > 0).length;
  const avgPerDay = activeDays > 0 ? totalRevenue / activeDays : 0;

  const periodLabels: Record<Period, string> = {
    '7': '7 Hari Terakhir',
    '14': '14 Hari Terakhir',
    '30': '30 Hari Terakhir',
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Laporan Penjualan</h2>
          <p className="text-slate-400 text-sm mt-1">{periodLabels[period]}</p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-2 bg-slate-800 rounded-xl p-1">
          {(['7', '14', '30'] as Period[]).map((p) => (
            <button
              key={p}
              id={`filter-period-${p}`}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                period === p
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {p}H
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm">Total Omzet</span>
            <TrendingUp className="w-4 h-4 text-orange-400" />
          </div>
          <p className="text-xl font-bold text-white">{formatRupiah(totalRevenue)}</p>
          <p className="text-slate-500 text-xs">{periodLabels[period]}</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm">Total Transaksi</span>
            <ShoppingBag className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-xl font-bold text-white">{totalTransactions}</p>
          <p className="text-slate-500 text-xs">Transaksi selesai</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm">Rata-rata/Hari</span>
            <Calendar className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-xl font-bold text-white">{formatRupiah(avgPerDay)}</p>
          <p className="text-slate-500 text-xs">Hari aktif berjualan</p>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="card p-5">
        <h3 className="font-semibold text-white mb-5">Tren Omzet Harian</h3>
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <RefreshCw className="w-6 h-6 text-slate-500 animate-spin" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#64748b', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(249,115,22,0.05)' }} />
              <Bar
                dataKey="total"
                fill="#f97316"
                radius={[6, 6, 0, 0]}
                maxBarSize={48}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Top Products */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-5">
          <Award className="w-5 h-5 text-amber-400" />
          <h3 className="font-semibold text-white">Produk Terlaris</h3>
          <span className="text-slate-500 text-xs ml-1">({periodLabels[period]})</span>
        </div>

        {topProducts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500 text-sm">Belum ada data penjualan</p>
          </div>
        ) : (
          <div className="space-y-3">
            {topProducts.map((product, index) => {
              const maxQty = topProducts[0]?.total_qty ?? 1;
              const percentage = (product.total_qty / maxQty) * 100;

              return (
                <div key={product.name} className="flex items-center gap-4">
                  <span className="text-slate-600 font-bold text-sm w-5 flex-shrink-0">
                    #{index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-white text-sm font-medium truncate">
                        {product.name}
                      </span>
                      <span className="text-slate-400 text-xs ml-2 flex-shrink-0">
                        {product.total_qty} terjual
                      </span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-orange-400 font-semibold text-sm flex-shrink-0">
                    {formatRupiah(product.total_revenue)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
