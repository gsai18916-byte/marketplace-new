import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { getSignedUrl } from '../../../lib/storage';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  const { data: product, error } = await supabaseAdmin
    .from('products')
    .select('*, categories(name, slug, type)')
    .eq('id', id)
    .eq('active', true)
    .single();

  if (error || !product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  // Generate signed URLs for images
  if (product.images) {
    const signedImages = {};
    for (const [key, path] of Object.entries(product.images)) {
      if (path && key !== 'prompt_text') {
        try {
          signedImages[key] = await getSignedUrl(path, 3600);
        } catch {
          signedImages[key] = null;
        }
      } else {
        signedImages[key] = path;
      }
    }
    product.images = signedImages;
  }

  return res.status(200).json({ product });
}
