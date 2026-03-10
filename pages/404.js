import Layout from '../components/Layout';
import Link from 'next/link';

export default function NotFound() {
  return (
    <Layout title="404 — Luminance">
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
        <p className="font-mono text-gold-500/40 text-8xl font-medium mb-4">404</p>
        <h1 className="font-display text-3xl text-ash-100 font-light mb-3">Page not found</h1>
        <p className="font-body text-ash-500 text-sm mb-8">This page doesn't exist or has been moved.</p>
        <Link href="/" className="btn-primary">Return Home</Link>
      </div>
    </Layout>
  );
}
