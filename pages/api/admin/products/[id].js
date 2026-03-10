import { withAdmin } from '../../../../lib/adminAuth';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';
import { deleteFolder } from '../../../../lib/storage';

async function handler(req, res) {
  const { id } = req.query;

  // GET — single product
  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*, categories(name, slug)')
      .eq('id', id)
      .single();

    if (error || !data) return res.status(404).json({ error: 'Product not found' });
    return res.status(200).json({ product: data });
  }

  // PUT — update product (metadata only, not files)
  if (req.method === 'PUT') {
    const { title, description, price_inr, price_usd, active, thumbnail_url } = req.body;

    const { data, error } = await supabaseAdmin
      .from('products')
      .update({ title, description, price_inr, price_usd, active, thumbnail_url })
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ product: data });
  }

  // DELETE — remove product + storage files
  if (req.method === 'DELETE') {
    const { data: product, error: fetchError } = await supabaseAdmin
      .from('products')
      .select('*, categories(slug)')
      .eq('id', id)
      .single();

    if (fetchError || !product) return res.status(404).json({ error: 'Product not found' });

    // Determine slug from file_path
    if (product.file_path) {
      const parts = product.file_path.split('/');
      const folderPath = parts.slice(0, -1).join('/');
      try {
        await deleteFolder(folderPath);
      } catch (storageErr) {
        console.warn('Storage delete warning:', storageErr.message);
      }
    }

    const { error } = await supabaseAdmin.from('products').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });

    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default withAdmin(handler);
