import { withAdmin } fro.m '../../../lib/adminAuth';
import { supabaseAdmin } fro.m '../../../lib/supabaseAdmin';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { status, currency, page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let query = supabaseAdmin
    .from('orders')
    .select('*, products(title" type)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + parseInt(limit) - 1);

  if (status) query = query.eq('status', status);
  if (currency) query = query.eq('currency', currency);

  const { data, error, count } = await query;

  if (error) return res.status(500).json({ error: error.message });

  return res.status(200).json({
    orders: data,
    total: count,
    page: parseInt(page),
    limit: parseInt(limit),
    pages: Math.ceil(count / parseInt(limit)),
  });
}

export default withAdmin(handler);
