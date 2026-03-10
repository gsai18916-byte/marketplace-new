import Layout from '../../components/Layout';
import ProductCard from '../../components/ProductCard';
import { supabaseAdmin } from '../../lib/supabaseAdmin';
import Link from 'next/link';

export default function PromptCategoryPage({ category, products }) {
  if (!category) return null;

  return (
    <Layout title={`${category.name} Prompts — Luminance`}>
      <div className="max-w-7xl mx-auto px-6 py-16">
        <nav className="flex items-center gap-2 mb-10 text-xs font-body text-ash-500">
          <Link href="/" className="hover:text-ash-300 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/prompts" className="hover:text-ash-300 transition-colors">Prompts</Link>
          <span>/</span>
          <span className="text-ash-300">{category.name}</span>
        </nav>

        <div className="mb-12">
          <span className="badge badge-ash mb-3">AI Prompt</span>
          <h1 className="section-title">{category.name}</h1>
          <p className="section-subtitle mt-2">{products.length} product{products.length !== 1 ? 's' : ''} available</p>
        </div>

        {products.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-body text-ash-500 text-sm">No products in this collection yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

export async function getStaticPaths() {
  const { data } = await supabaseAdmin.from('categories').select('slug').eq('type', 'prompt');
  return {
    paths: (data || []).map((c) => ({ params: { category: c.slug } })),
    fallback: 'blocking',
  };
}

export async function getStaticProps({ params }) {
  const { data: category } = await supabaseAdmin
    .from('categories')
    .select('*')
    .eq('slug', params.category)
    .eq('type', 'prompt')
    .single();

  if (!category) return { notFound: true };

  const { data: products } = await supabaseAdmin
    .from('products')
    .select('id, title, description, type, price_inr, thumbnail_url, active')
    .eq('category_id', category.id)
    .eq('active', true)
    .order('created_at', { ascending: false });

  return {
    props: { category, products: products || [] },
    revalidate: 60,
  };
}
