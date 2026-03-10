import { getTokenInfo } from '../../lib/downloadToken';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  try {
    const data = await getTokenInfo(token);

    const now = new Date();
    const expires = new Date(data.expires_at);
    const isExpired = expires < now;

    return res.status(200).json({
      token: data.token,
      remainingDownloads: data.remaining_downloads,
      expiresAt: data.expires_at,
      isExpired,
      order: {
        id: data.orders?.id,
        currency: data.orders?.currency,
        amount: data.orders?.amount,
        customerEmail: data.orders?.customer_email,
        product: data.orders?.products,
      },
    });
  } catch (err) {
    return res.status(404).json({ error: err.message });
  }
}
