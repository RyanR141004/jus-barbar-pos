import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const days = Number(searchParams.get('days') ?? 7);

  const supabase = await createClient();

  // Get transactions from the last N days
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (days - 1));
  startDate.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('transactions')
    .select('total_price, created_at')
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Group by date
  const grouped: Record<string, { total: number; count: number }> = {};

  // Initialize all days with 0
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    const key = d.toISOString().split('T')[0];
    grouped[key] = { total: 0, count: 0 };
  }

  // Fill with actual data
  (data ?? []).forEach((trx) => {
    const key = trx.created_at.split('T')[0];
    if (grouped[key]) {
      grouped[key].total += trx.total_price;
      grouped[key].count += 1;
    }
  });

  const result = Object.entries(grouped).map(([date, { total, count }]) => ({
    date,
    total,
    count,
  }));

  return NextResponse.json(result);
}
