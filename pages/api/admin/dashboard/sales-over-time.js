import { withAdmin } from '../../../../lib/adminAuth';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data: orders, error } = await supabaseAdmin
    .from('orders')
    .select('amount, currency, created_at')
    .eq('status', 'completed')
    .gte('created_at', start)
    .order('created_at', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });

  // Group by date
  const byDate = {};
  for (const order of orders || []) {
    const date = order.created_at.split('T')[0];
    if (!byDate[date]) byDate[date] = { date, revenue: 0, orders: 0 };
    // Normalize to INR for simplicity (1 USD ≈ 83 INR)
    const revenueInr =
      order.currency === 'INR' ? order.amount : order.amount * 83;
    byDate[date].revenue += revenueInr;
    byDate[date].orders += 1;
  }

  // Fill missing days with 0
  const result = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().split('T')[0];
    result.push(byDate[dateStr] || { date: dateStr, revenue: 0, orders: 0 });
  }

  return res.status(200).json({ salesData: result });
}

export default withAdmin(handler);
