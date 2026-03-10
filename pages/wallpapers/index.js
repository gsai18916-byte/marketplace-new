import Layout from '../../components/Layout';
import CategoryCard from '../../components/CategoryCard';
import { supabaseAdmin } from '../../lib/supabaseAdmin';

export default function WallpapersPage({ categories }) {
  return (
    <Layout title="Wallpapers — Luminance" description="Browse premium digital wallpaper collections.">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-12">
          <p className="label text-gold-500/60 mb-2">Collections</p>
          <h1 className="section-title">Wallpapers</h1>
          <p className="section-subtitle mt-3 max-w-md">
            Curated wallpaper packs in 4K resolution — desktop, mobile, and mockup variants included.
          </p>
        </div>

        {categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center mb-4">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="text-ash-500">
                <rect x="4" y="4" width="20" height="20" rx="3" stroke="currentColor" strokeWidth="1.5"/>
                <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M4 19l6-6 4 4 4-6 6 8" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="font-body text-ash-500 text-sm">No wallpaper collections yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

export async function getStaticProps() {
  const { data } = await supabaseAdmin
    .from('categories')
    .select('*')
    .eq('type', 'wallpaper')
    .order('created_at', { ascending: false });

  return {
    props: { categories: data || [] },
    revalidate: 60,
  };
}
