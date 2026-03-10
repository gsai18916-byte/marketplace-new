"use client";
import Layout from '../../components/Layout';
import { supabaseAdmin } from '../../lib/supabaseAdmin';
import { getSignedUrl } from '../../lib/storage';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

function formatINR(paise) {
  return `₹${(paise / 100).toFixed(0)}`;
}
function formatUSD(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

function BuyModal({ product, onClose }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleBuy = async () => {
    if (!email) return setError('Email is required');
    setLoading(true);
    setError('');

    try {
      if (currency === 'INR') {
        const res = await fetch('/api/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: product.id, customerEmail: email, customerName: name }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        const options = {
          key: data.keyId,
          amount: data.amount,
          currency: 'INR',
          name: 'Luminance',
          description: data.productTitle,
          order_id: data.orderId,
          handler: async (response) => {
            const verifyRes = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                internalOrderId: data.internalOrderId,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyRes.ok) {
              window.location.href = `/download/${verifyData.token}`;
            } else {
              setError(verifyData.error || 'Payment verification failed');
            }
          },
          prefill: { email, name },
          theme: { color: '#f59e0b' },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        const res = await fetch('/api/create-stripe-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: product.id, customerEmail: email, customerName: name }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="card w-full max-w-md p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-xl text-ash-100 font-light">Complete Purchase</h3>
          <button onClick={onClose} className="text-ash-500 hover:text-ash-200 transition-colors">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
        </div>

        <div className="bg-obsidian-700 rounded p-3 mb-6 flex items-center justify-between">
          <span className="font-body text-sm text-ash-200 truncate pr-3">{product.title}</span>
          <span className="font-mono text-sm text-gold-400 flex-shrink-0">
            {currency === 'INR' ? formatINR(product.price_inr) : formatUSD(product.price_usd || Math.round(product.price_inr / 83))}
          </span>
        </div>

        {/* Currency toggle */}
        <div className="flex gap-2 mb-4">
          {['INR', 'USD'].map((c) => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              className={`flex-1 py-2 rounded text-xs font-mono font-medium border transition-all ${
                currency === c
                  ? 'border-gold-500/50 bg-gold-500/10 text-gold-400'
                  : 'border-white/10 text-ash-500 hover:text-ash-200'
              }`}
            >
              {c === 'INR' ? '₹ Razorpay' : '$ Stripe'}
            </button>
          ))}
        </div>

        <div className="space-y-3 mb-5">
          <div>
            <label className="label">Email *</label>
            <input className="input" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="label">Name (optional)</label>
            <input className="input" type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
        </div>

        {error && <p className="text-red-400 text-xs font-body mb-4">{error}</p>}

        <button className="btn-primary w-full justify-center" onClick={handleBuy} disabled={loading}>
          {loading ? 'Processing…' : `Pay ${currency === 'INR' ? formatINR(product.price_inr) : formatUSD(product.price_usd || Math.round(product.price_inr / 83))}`}
        </button>

        <p className="font-body text-ash-500 text-xs text-center mt-3">
          Secure payment • Instant download link • 5 downloads
        </p>
      </div>
    </div>
  );
}

export default function ProductPage({ product }) {
  const [activeImage, setActiveImage] = useState(0);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);

  if (!product) return null;

  const isWallpaper = product.type === 'wallpaper';
  const images = isWallpaper
    ? [
        { label: 'Desktop', url: product.images?.desktop },
        { label: 'Mobile', url: product.images?.mobile },
        { label: 'Mockup D', url: product.images?.mockup_d },
        { label: 'Mockup M', url: product.images?.mockup_m },
      ].filter((i) => i.url)
    : [];

  return (
    <Layout title={`${product.title} — Luminance`}>
      {showBuyModal && (
        <>
          <script src="https://checkout.razorpay.com/v1/checkout.js" />
          <BuyModal product={product} onClose={() => setShowBuyModal(false)} />
        </>
      )}

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 mb-10 text-xs font-body text-ash-500">
          <Link href="/" className="hover:text-ash-300 transition-colors">Home</Link>
          <span>/</span>
          <Link href={`/${product.type === 'wallpaper' ? 'wallpapers' : 'prompts'}`} className="hover:text-ash-300 transition-colors capitalize">{product.type}s</Link>
          <span>/</span>
          <span className="text-ash-300">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left: Images */}
          <div>
            {isWallpaper && images.length > 0 ? (
              <div>
                {/* Main image */}
                <div className="aspect-[16/10] relative rounded-lg overflow-hidden bg-obsidian-800 mb-3">
                  <Image
                    src={images[activeImage].url}
                    alt={images[activeImage].label}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
                {/* Thumbnails */}
                <div className="flex gap-2">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`flex-1 aspect-[16/10] relative rounded overflow-hidden border-2 transition-all ${
                        activeImage === i ? 'border-gold-500' : 'border-transparent opacity-50 hover:opacity-80'
                      }`}
                    >
                      <Image src={img.url} alt={img.label} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              // Prompt: before/after
              <div>
                <div className="grid grid-cols-2 gap-3">
                  {product.images?.before && (
                    <div>
                      <p className="label text-center mb-2">Before</p>
                      <div className="aspect-square relative rounded-lg overflow-hidden bg-obsidian-800">
                        <Image src={product.images.before} alt="Before" fill className="object-cover" />
                      </div>
                    </div>
                  )}
                  {product.images?.after && (
                    <div>
                      <p className="label text-center mb-2">After</p>
                      <div className="aspect-square relative rounded-lg overflow-hidden bg-obsidian-800">
                        <Image src={product.images.after} alt="After" fill className="object-cover" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right: Info */}
          <div className="lg:sticky lg:top-24">
            <span className={`badge mb-4 ${product.type === 'wallpaper' ? 'badge-gold' : 'badge-ash'}`}>
              {product.type === 'wallpaper' ? 'Wallpaper Pack' : 'AI Prompt'}
            </span>
            <h1 className="font-display text-4xl font-light text-ash-100 leading-tight mb-4">{product.title}</h1>

            {product.description && (
              <p className="font-body text-ash-400 text-sm leading-relaxed mb-6">{product.description}</p>
            )}

            {/* Prompt reveal */}
            {!isWallpaper && product.images?.prompt_text && (
              <div className="card p-4 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="label">Prompt Preview</p>
                  <button onClick={() => setShowPrompt(!showPrompt)} className="text-gold-400 text-xs font-body hover:text-gold-300">
                    {showPrompt ? 'Hide' : 'Reveal'} →
                  </button>
                </div>
                {showPrompt ? (
                  <p className="font-mono text-xs text-ash-300 leading-relaxed">{product.images.prompt_text}</p>
                ) : (
                  <div className="h-16 flex items-center justify-center">
                    <p className="text-ash-600 text-xs font-body">Purchase to unlock the full prompt</p>
                  </div>
                )}
              </div>
            )}

            {/* Includes */}
            <div className="mb-6">
              <p className="label mb-3">Includes</p>
              <ul className="space-y-2">
                {isWallpaper ? (
                  ['Desktop wallpaper (4K)', 'Mobile wallpaper', 'Desktop mockup', 'Mobile mockup', 'ZIP archive'].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm font-body text-ash-400">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-gold-500 flex-shrink-0">
                        <path d="M2 7l3.5 3.5L12 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {item}
                    </li>
                  ))
                ) : (
                  ['Before image', 'After image', 'Prompt text file', 'ZIP archive'].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm font-body text-ash-400">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-gold-500 flex-shrink-0">
                        <path d="M2 7l3.5 3.5L12 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {item}
                    </li>
                  ))
                )}
              </ul>
            </div>

            {/* Price & Buy */}
            <div className="divider pt-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="font-mono text-3xl text-gold-400 font-medium">{formatINR(product.price_inr)}</p>
                  {product.price_usd && (
                    <p className="font-mono text-sm text-ash-500 mt-0.5">{formatUSD(product.price_usd)} USD</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-body text-xs text-ash-500">5 downloads</p>
                  <p className="font-body text-xs text-ash-500">48h validity</p>
                </div>
              </div>
              <button className="btn-primary w-full justify-center text-base" onClick={() => setShowBuyModal(true)}>
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export async function getStaticPaths() {
  const { data } = await supabaseAdmin.from('products').select('id').eq('active', true);
  return {
    paths: (data || []).map((p) => ({ params: { id: p.id } })),
    fallback: 'blocking',
  };
}

export async function getStaticProps({ params }) {
  const { data: product, error } = await supabaseAdmin
    .from('products')
    .select('*, categories(name, slug, type)')
    .eq('id', params.id)
    .single();

  if (error || !product || !product.active) return { notFound: true };

  // Generate signed URLs for images
  if (product.images) {
    const signedImages = {};
    for (const [key, path] of Object.entries(product.images)) {
      if (path && key !== 'prompt_text') {
        try {
          const { createClient } = require('@supabase/supabase-js');
          const admin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY,
            { auth: { persistSession: false } }
          );
          const { data: signedData } = await admin.storage.from('products').createSignedUrl(path, 3600);
          signedImages[key] = signedData?.signedUrl || null;
        } catch {
          signedImages[key] = null;
        }
      } else {
        signedImages[key] = path;
      }
    }
    product.images = signedImages;
  }

  return {
    props: { product },
    revalidate: 300,
  };
}
