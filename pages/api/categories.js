import { supabaseAdmin } from '../../lib/supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type } = req.query;

  let query = supabaseAdmin
    .from('categories')
    .select('*')
    .order('created_at', { ascending: false });

  if (type && ['wallpaper', 'prompt'].includes(type)) {
    query = query.eq('type', type);
  }

  const { data, error } = await query;

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ categories: data });
}
