import { razorpay } from '../../lib/razorpay';
import { supabaseAdmin } from '../../lib/supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { productId, customerEmail, customerName } = req.body;

  if (!productId || !customerEmail) {
    return res.status(400).json({ error: 'productId and customerEmail are required' });
  }

  // Fetch product
  const { data: product, error: productError } = await supabaseAdmin
    .from('products')
    .select('id, title, price_inr, active')
    .eq('id', productId)
    .single();

  if (productError || !product || !product.active) {
    return res.status(404).json({ error: 'Product not found or unavailable' });
  }

  try {
    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: product.price_inr,
      currency: 'INR',
      notes: {
        productId: product.id,
        customerEmail,
        customerName: customerName || '',
      },
    });

    // Store pending order in DB
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        product_id: product.id,
        amount: product.price_inr,
        currency: 'INR',
        payment_id: razorpayOrder.id,
        customer_email: customerEmail,
        customer_name: customerName || null,
        status: 'pending',
      })
      .select()
      .single();

    if (orderError) throw orderError;

    return res.status(200).json({
      orderId: razorpayOrder.id,
      amount: product.price_inr,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID,
      productTitle: product.title,
      internalOrderId: order.id,
    });
  } catch (err) {
    console.error('Create order error:', err);
    return res.status(500).json({ error: err.message || 'Failed to create order' });
  }
}
