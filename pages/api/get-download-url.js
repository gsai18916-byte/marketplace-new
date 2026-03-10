import { consumeDownloadToken } from '../../lib/downloadToken';
import { getSignedUrl } from '../../lib/storage';
import { supabaseAdmin } from '../../lib/supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  const ip =
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.socket?.remoteAddress ||
    null;

  try {
    const tokenData = await consumeDownloadToken(token, ip);

    const orderId = tokenData.order_id;

    // Get the product file_path via order
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('product_id, products(file_path, title)')
      .eq('id', orderId)
      .single();

    if (error || !order) throw new Error('Order not found');

    const filePath = order.products?.file_path;
    if (!filePath) throw new Error('File not found for this product');

    // Generate a short-lived signed URL (10 minutes)
    const signedUrl = await getSignedUrl(filePath, 600);

    return res.status(200).json({
      downloadUrl: signedUrl,
      fileName: `${order.products.title}.zip`,
      remainingDownloads: tokenData.remaining_downloads - 1,
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}
