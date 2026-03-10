import { withAdmin } from '../../../../lib/adminAuth';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { data: orders, error } = await supabaseAdmin
    .from('orders')
    .select('*, products(title, type)')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) return res.status(500).json({ error: error.message });

  return res.status(200).json({ orders });
}

export default withAdmin(handler);
