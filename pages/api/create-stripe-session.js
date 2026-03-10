import { stripe } from '../../lib/stripe';
import { supabaseAdmin } from '../../lib/supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { productId, customerEmail, customerName } = req.body;

  if (!productId || !customerEmail) {
    return res.status(400).json({ error: 'productId and customerEmail are required' });
  }

  const { data: product, error: productError } = await supabaseAdmin
    .from('products')
    .select('id, title, price_usd, price_inr, thumbnail_url, active')
    .eq('id', productId)
    .single();

  if (productError || !product || !product.active) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const priceUsd = product.price_usd || Math.round(product.price_inr / 83); // fallback conversion

  try {
    // Create pending order first
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        product_id: product.id,
        amount: priceUsd,
        currency: 'USD',
        payment_id: 'stripe_pending',
        customer_email: customerEmail,
        customer_name: customerName || null,
        status: 'pending',
      })
      .select()
      .single();

    if (orderError) throw orderError;

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `https://${req.headers.host}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: customerEmail,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: product.title,
              images: product.thumbnail_url ? [product.thumbnail_url] : [],
            },
            unit_amount: priceUsd,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/api/stripe-success?session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`,
      cancel_url: `${baseUrl}/product/${productId}?cancelled=1`,
      metadata: {
        orderId: order.id,
        productId: product.id,
      },
    });

    // Update order with Stripe session ID
    await supabaseAdmin
      .from('orders')
      .update({ payment_id: session.id })
      .eq('id', order.id);

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe session error:', err);
    return res.status(500).json({ error: err.message });
  }
}
