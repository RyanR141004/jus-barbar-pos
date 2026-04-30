import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const days = Number(searchParams.get('days') ?? 7);
  const paymentMethod = searchParams.get('method'); // 'CASH', 'QRIS', or null (all)

  const supabase = await createClient();

  // Get transactions from the last N days
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (days - 1));
  startDate.setHours(0, 0, 0, 0);

  let query = supabase
    .from('transactions')
    .select('total_price, payment_method, created_at')
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: true });

  // Filter by payment method if specified
  if (paymentMethod === 'CASH' || paymentMethod === 'QRIS') {
    query = query.eq('payment_method', paymentMethod);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Group by date
  const grouped: Record<string, { total: number; count: number; cash: number; qris: number; cashCount: number; qrisCount: number }> = {};

  // Initialize all days with 0
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    const key = d.toISOString().split('T')[0];
    grouped[key] = { total: 0, count: 0, cash: 0, qris: 0, cashCount: 0, qrisCount: 0 };
  }

  // Fill with actual data
  (data ?? []).forEach((trx) => {
    const key = trx.created_at.split('T')[0];
    if (grouped[key]) {
      grouped[key].total += trx.total_price;
      grouped[key].count += 1;
      if (trx.payment_method === 'CASH') {
        grouped[key].cash += trx.total_price;
        grouped[key].cashCount += 1;
      } else if (trx.payment_method === 'QRIS') {
        grouped[key].qris += trx.total_price;
        grouped[key].qrisCount += 1;
      }
    }
  });

  const result = Object.entries(grouped).map(([date, vals]) => ({
    date,
    ...vals,
  }));

  return NextResponse.json(result);
}
