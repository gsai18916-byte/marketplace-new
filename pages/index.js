import Layout from '../components/Layout';
import CategoryCard from '../components/CategoryCard';
import ProductCard from '../components/ProductCard';
import { supabaseAdmin } from '../lib/supabaseAdmin';
import Link from 'next/link';

export default function Home({ wallpaperCategories, promptCategories, featuredProducts }) {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative min-h-[88vh] flex flex-col items-center justify-center overflow-hidden px-6">
        {/* Background grid */}
        <div className="absolute inset-0 bg-grid-pattern opacity-100 pointer-events-none" />
        {/* Radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,rgba(245,158,11,0.06),transparent)] pointer-events-none" />

        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gold-500/20 bg-gold-500/5 mb-8 animate-fade-up">
            <div className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse" />
            <span className="font-mono text-gold-400 text-xs tracking-widest uppercase">Premium Digital Assets</span>
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-light text-ash-100 leading-[1.05] animate-fade-up delay-100">
            Elevate Every<br />
            <em className="text-gradient-gold not-italic">Pixel & Prompt</em>
          </h1>

          <p className="font-body text-ash-400 text-lg mt-6 max-w-xl mx-auto leading-relaxed animate-fade-up delay-200">
            Curated wallpapers and AI prompts for creators who refuse mediocrity.
            Download once, use forever.
          </p>

          <div className="flex items-center justify-center gap-4 mt-10 animate-fade-up delay-300">
            <Link href="/wallpapers" className="btn-primary">
              Browse Wallpapers
            </Link>
            <Link href="/prompts" className="btn-secondary">
              Explore Prompts
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <div className="w-px h-10 bg-gradient-to-b from-transparent to-gold-500/60" />
          <span className="font-mono text-[10px] tracking-widest uppercase text-ash-500">Scroll</span>
        </div>
      </section>

      {/* Wallpaper Categories */}
      {wallpaperCategories.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="label text-gold-500/60 mb-1">Collection</p>
              <h2 className="section-title">Wallpapers</h2>
            </div>
            <Link href="/wallpapers" className="btn-ghost text-sm">
              View all
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-ash-500">
                <path d="M2 7H12M9 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {wallpaperCategories.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        </section>
      )}

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="divider" />
      </div>

      {/* Prompt Categories */}
      {promptCategories.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="label text-ash-500/60 mb-1">Collection</p>
              <h2 className="section-title">AI Prompts</h2>
            </div>
            <Link href="/prompts" className="btn-ghost text-sm">
              View all
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-ash-500">
                <path d="M2 7H12M9 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {promptCategories.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-16">
          <div className="mb-8">
            <p className="label text-gold-500/60 mb-1">Handpicked</p>
            <h2 className="section-title">Featured</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Value props */}
      <section className="border-t border-white/5 bg-obsidian-900/50">
        <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: '↓', title: 'Instant Download', body: 'Pay once and get a secure download link valid for 48 hours with up to 5 downloads.' },
            { icon: '⬡', title: 'Premium Quality', body: 'Every wallpaper is crafted at 4K resolution. Every prompt is tested across major AI models.' },
            { icon: '∞', title: 'Lifetime License', body: 'Purchase once, use forever. Personal and commercial use included in every download.' },
          ].map((item) => (
            <div key={item.title} className="flex gap-4">
              <div className="w-10 h-10 rounded border border-white/10 flex items-center justify-center text-gold-500 text-lg font-display flex-shrink-0 mt-0.5">
                {item.icon}
              </div>
              <div>
                <h3 className="font-body font-semibold text-ash-100 text-sm mb-1">{item.title}</h3>
                <p className="font-body text-ash-500 text-sm leading-relaxed">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
}

export async function getStaticProps() {
  const [wallpapers, prompts, products] = await Promise.all([
    supabaseAdmin.from('categories').select('*').eq('type', 'wallpaper').order('created_at', { ascending: false }).limit(6),
    supabaseAdmin.from('categories').select('*').eq('type', 'prompt').order('created_at', { ascending: false }).limit(6),
    supabaseAdmin.from('products').select('id, title, type, price_inr, thumbnail_url, active').eq('active', true).order('created_at', { ascending: false }).limit(8),
  ]);

  return {
    props: {
      wallpaperCategories: wallpapers.data || [],
      promptCategories: prompts.data || [],
      featuredProducts: products.data || [],
    },
    revalidate: 60,
  };
}
