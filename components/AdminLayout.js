"use client";
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import Head from 'next/head';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/></svg>
  )},
  { href: '/admin/categories', label: 'Categories', icon: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M2 8h8M2 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
  )},
  { href: '/admin/products', label: 'Products', icon: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/><circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5"/></svg>
  )},
  { href: '/admin/orders', label: 'Orders', icon: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 3h12v10H2zM5 3V1M11 3V1M2 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
  )},
];

export default function AdminLayout({ children, title = 'Admin' }) {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  const isActive = (href) => router.pathname === href;

  return (
    <>
      <Head>
        <title>{title} — Luminance Admin</title>
      </Head>

      <div className="min-h-screen flex bg-obsidian-950">
        {/* Sidebar */}
        <aside className="w-56 border-r border-white/5 bg-obsidian-900 fixed inset-y-0 left-0 flex flex-col z-30">
          {/* Logo */}
          <div className="h-16 flex items-center px-5 border-b border-white/5">
            <Link href="/admin/dashboard" className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded border border-gold-500/30 flex items-center justify-center bg-gold-500/5">
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1L13 4.5V9.5L7 13L1 9.5V4.5L7 1Z" stroke="#f59e0b" strokeWidth="1.5" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="font-display text-base text-ash-200 font-light">Admin</span>
            </Link>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto">
            <div className="space-y-0.5">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm font-body font-medium transition-all duration-150 ${
                    isActive(item.href)
                      ? 'bg-gold-500/10 text-gold-400 border border-gold-500/20'
                      : 'text-ash-400 hover:text-ash-100 hover:bg-white/5'
                  }`}
                >
                  <span className={isActive(item.href) ? 'text-gold-400' : 'text-ash-500'}>
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>

          {/* Bottom actions */}
          <div className="px-3 py-4 border-t border-white/5 space-y-1">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-3 px-3 py-2 rounded text-xs font-body text-ash-500 hover:text-ash-300 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1a6 6 0 100 12A6 6 0 007 1z" stroke="currentColor" strokeWidth="1.5"/><path d="M9.5 7H1M5 4l-3 3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              View Store
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded text-xs font-body text-ash-500 hover:text-red-400 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 2H2v10h3M9.5 4.5L13 7l-3.5 2.5M13 7H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 ml-56">
          <header className="h-16 border-b border-white/5 bg-obsidian-950/80 backdrop-blur-xl sticky top-0 z-20 flex items-center px-8">
            <h1 className="font-body text-sm font-medium text-ash-300">{title}</h1>
          </header>
          <main className="p-8">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
