"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import Head from 'next/head';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push('/admin/dashboard');
    });
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Check is_admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', data.user.id)
      .single();

        if (profileError) {
                console.error('Profile fetch error:', profileError);
                await supabase.auth.signOut();
                setError('Error fetching profile. Please try again.');
                setLoading(false);
                return;
              }

    if !profile || (!profile?.is_admin) {
      await supabase.auth.signOut();
      setError('Access denied. Admin privileges required.');
      setLoading(false);
      return;
    }

    router.push('/admin/dashboard');
  };

  return (
    <>
      <Head><title>Admin Login — Luminance</title></Head>
      <div className="min-h-screen bg-obsidian-950 flex items-center justify-center px-6 bg-grid-pattern">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded border border-gold-500/30 flex items-center justify-center bg-gold-500/5">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1L13 4.5V9.5L7 13L1 9.5V4.5L7 1Z" stroke="#f59e0b" strokeWidth="1.5" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="font-display text-xl text-ash-200 font-light">Luminance</span>
            </div>
            <h1 className="font-display text-2xl text-ash-100 font-light">Admin Panel</h1>
            <p className="font-body text-ash-500 text-sm mt-1">Sign in to manage your store</p>
          </div>

          <form onSubmit={handleLogin} className="card p-6 space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                className="input"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded p-3">
                <p className="font-body text-red-400 text-xs">{error}</p>
              </div>
            )}

            <button type="submit" className="btn-primary w-full justify-center" disabled={loading}>
              {loading ? (
                <><div className="w-4 h-4 rounded-full border-2 border-obsidian-950/30 border-t-obsidian-950 animate-spin" /> Signing in…</>
              ) : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
