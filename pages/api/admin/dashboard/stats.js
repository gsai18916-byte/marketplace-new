import { withAdmin } from '../../../../lib/adminAuth';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const startOfMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [totalOrders, todayOrders, weekOrders, monthOrders, inrRevenue, usdRevenue] =
    await Promise.all([
      supabaseAdmin.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
      supabaseAdmin.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'completed').gte('created_at', startOfToday),
      supabaseAdmin.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'completed').gte('created_at', startOfWeek),
      supabaseAdmin.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'completed').gte('created_at', startOfMonth),
      supabaseAdmin.from('orders').select('amount').eq('status', 'completed').eq('currency', 'INR'),
      supabaseAdmin.from('orders').select('amount').eq('status', 'completed').eq('currency', 'USD'),
    ]);

  const totalInr = (inrRevenue.data || []).reduce((s, o) => s + o.amount, 0);
  const totalUsd = (usdRevenue.data || []).reduce((s, o) => s + o.amount, 0);

  return res.status(200).json({
    totalOrders: totalOrders.count || 0,
    todayOrders: todayOrders.count || 0,
    weekOrders: weekOrders.count || 0,
    monthOrders: monthOrders.count || 0,
    totalRevenueInr: totalInr,
    totalRevenueUsd: totalUsd,
  });
}

export default withAdmin(handler);
