import { verifyRazorpaySignature } from '../../lib/razorpay';
import { supabaseAdmin } from '../../lib/supabaseAdmin';
import { createDownloadToken } from '../../lib/downloadToken';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, internalOrderId } = req.body;

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !internalOrderId) {
    return res.status(400).json({ error: 'Missing payment verification fields' });
  }

  // Verify signature
  const isValid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);

  if (!isValid) {
    // Mark order as failed
    await supabaseAdmin
      .from('orders')
      .update({ status: 'failed' })
      .eq('id', internalOrderId);

    return res.status(400).json({ error: 'Invalid payment signature' });
  }

  // Update order as completed
  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .update({
      status: 'completed',
      payment_id: razorpayPaymentId,
    })
    .eq('id', internalOrderId)
    .select()
    .single();

  if (orderError || !order) {
    return res.status(500).json({ error: 'Failed to update order' });
  }

  // Create download token
  try {
    const tokenData = await createDownloadToken(order.id);
    return res.status(200).json({ token: tokenData.token });
  } catch (err) {
    console.error('Token creation error:', err);
    return res.status(500).json({ error: 'Payment verified but failed to create download token' });
  }
}
