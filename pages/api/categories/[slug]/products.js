import { supabaseAdmin } from '../../../../lib/supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { slug } = req.query;

  // First get category
  const { data: category, error: catError } = await supabaseAdmin
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();

  if (catError || !category) {
    return res.status(404).json({ error: 'Category not found' });
  }

  const { data: products, error } = await supabaseAdmin
    .from('products')
    .select('id, title, description, type, price_inr, price_usd, thumbnail_url, active, created_at')
    .eq('category_id', category.id)
    .eq('active', true)
    .order('created_at', { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ category, products });
}
