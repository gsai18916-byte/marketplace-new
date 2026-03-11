import { withAdmin } from '../../../../lib/adminAuth';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';

async function handler(req, res) {
  // GET — list categories
  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ categories: data });
  }

  // POST — create category
  if (req.method === 'POST') {
    const { name, type, slug, thumbnail } = req.body;

    if (!name || !type || !slug) {
      return res.status(400).json({ error: 'name, type and slug are required' });
    }

    if (!(['wallpaper', 'prompt'].includes(type))) {
      return res.status(400).json({ error: 'type must be wallpaper or prompt' });
    }

    const { data: category, error } = await supabaseAdmin
      .from('categories')
      .insert({ name, type, slug, thumbnail: thumbnail || null })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    return res.status(201).json({ category });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default withAdmin(handler);
