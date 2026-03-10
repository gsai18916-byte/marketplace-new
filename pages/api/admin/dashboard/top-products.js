import { withAdmin } from '../../../../lib/adminAuth';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { data: orders, error } = await supabaseAdmin
    .from('orders')
    .select('product_id, amount, currency, products(title)')
    .eq('status', 'completed');

  if (error) return res.status(500).json({ error: error.message });

  const byProduct = {};
  for (const order of orders || []) {
    const pid = order.product_id;
    if (!byProduct[pid]) {
      byProduct[pid] = {
        id: pid,
        title: order.products?.title || 'Unknown',
        revenue: 0,
        count: 0,
      };
    }
    const revenueInr =
      order.currency === 'INR' ? order.amount : order.amount * 83;
    byProduct[pid].revenue += revenueInr;
    byProduct[pid].count += 1;
  }

  const sorted = Object.values(byProduct)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return res.status(200).json({ topProducts: sorted });
}

export default withAdmin(handler);
