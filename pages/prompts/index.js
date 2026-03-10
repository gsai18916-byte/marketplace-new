import Layout from '../../components/Layout';
import CategoryCard from '../../components/CategoryCard';
import { supabaseAdmin } from '../../lib/supabaseAdmin';

export default function PromptsPage({ categories }) {
  return (
    <Layout title="AI Prompts — Luminance" description="Browse premium AI prompt packs with before/after examples.">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="mb-12">
          <p className="label text-ash-500/60 mb-2">Collections</p>
          <h1 className="section-title">AI Prompts</h1>
          <p className="section-subtitle mt-3 max-w-md">
            Meticulously crafted prompts with before/after examples. Tested on Midjourney, DALL·E, and Stable Diffusion.
          </p>
        </div>

        {categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="font-body text-ash-500 text-sm">No prompt collections yet.</p>
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
    .eq('type', 'prompt')
    .order('created_at', { ascending: false });

  return {
    props: { categories: data || [] },
    revalidate: 60,
  };
}
