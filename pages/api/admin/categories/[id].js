import { withAdmin } from '../../../../lib/adminAuth';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';

async function handler(req, res) {
  const { id } = req.query;

  // PUT — update
  if (req.method === 'PUT') {
    const { name, thumbnail } = req.body;

    const { data, error } = await supabaseAdmin
      .from('categories')
      .update({ name, thumbnail })
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ category: data });
  }

  // DELETE — only if no products
  if (req.method === 'DELETE') {
    const { count, error: countError } = await supabaseAdmin
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', id);

    if (countError) return res.status(500).json({ error: countError.message });
    if (count > 0) {
      return res.status(400).json({ error: 'Cannot delete category with existing products' });
    }

    const { error } = await supabaseAdmin.from('categories').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });

    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default withAdmin(handler);
