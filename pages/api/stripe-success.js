import { stripe } from '../../lib/stripe';
import { supabaseAdmin } from '../../lib/supabaseAdmin';
import { createDownloadToken } from '../../lib/downloadToken';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { session_id, order_id } = req.query;

  if (!session_id || !order_id) {
    return res.redirect('/');
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== 'paid') {
      return res.redirect(`/?payment_failed=1`);
    }

    // Update order to completed
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .update({
        status: 'completed',
        payment_id: session.payment_intent,
      })
      .eq('id', order_id)
      .select()
      .single();

    if (orderError || !order) {
      throw new Error('Order not found');
    }

    // Create download token
    const tokenData = await createDownloadToken(order.id);

    return res.redirect(`/download/${tokenData.token}`);
  } catch (err) {
    console.error('Stripe success error:', err);
    return res.redirect('/?payment_error=1');
  }
}
