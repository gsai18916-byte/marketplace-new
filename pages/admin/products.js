"use client";
import AdminLayout from '../../components/AdminLayout';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';

async function getToken() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token;
}

async function adminFetch(url, options = {}) {
  const token = await getToken();
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
  return res.json();
}

function StatusBadge({ active }) {
  return active
    ? <span className="badge badge-green">Active</span>
    : <span className="badge badge-ash">Inactive</span>;
}

const EMPTY_FORM = {
  title: '', description: '', category_id: '', type: 'wallpaper',
  price_inr: '', price_usd: '', active: true, thumbnail_url: '',
  slug: '', prompt_text: '',
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileRefs = { desktop: useRef(), mobile: useRef(), mockup_d: useRef(), mockup_m: useRef(), before: useRef(), after: useRef() };

  const loadData = async () => {
    const params = new URLSearchParams();
    if (filterType) params.set('type', filterType);
    if (filterCat) params.set('category_id', filterCat);
    const [prods, cats] = await Promise.all([
      adminFetch(`/api/admin/products?${params}`),
      adminFetch('/api/admin/categories'),
    ]);
    setProducts(prods.products || []);
    setCategories(cats.categories || []);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [filterType, filterCat]);

  const handleTitleChange = (title) => {
    const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    setForm((f) => ({ ...f, title, slug: editId ? f.slug : slug }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      if (editId) {
        const token = await getToken();
        const res = await fetch(`/api/admin/products/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            title: form.title, description: form.description,
            price_inr: parseInt(form.price_inr), price_usd: parseInt(form.price_usd || 0),
            active: form.active, thumbnail_url: form.thumbnail_url,
          }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setSuccess('Product updated');
      } else {
        const token = await getToken();
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => {
          if (v !== undefined && v !== null) fd.append(k, v);
        });

        // Append files
        const fileFields = form.type === 'wallpaper'
          ? ['desktop', 'mobile', 'mockup_d', 'mockup_m']
          : ['before', 'after'];

        for (const field of fileFields) {
          const file = fileRefs[field]?.current?.files?.[0];
          if (file) fd.append(field, file);
        }

        const res = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setSuccess('Product created');
      }
      setForm(EMPTY_FORM);
      setEditId(null);
      setShowForm(false);
      loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product and all its files?')) return;
    const token = await getToken();
    const res = await fetch(`/api/admin/products/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.error) { setError(data.error); return; }
    setSuccess('Product deleted');
    loadData();
  };

  const handleEdit = (p) => {
    setForm({
      title: p.title, description: p.description || '',
      category_id: p.category_id, type: p.type,
      price_inr: p.price_inr, price_usd: p.price_usd || '',
      active: p.active, thumbnail_url: p.thumbnail_url || '',
      slug: '', prompt_text: '',
    });
    setEditId(p.id);
    setShowForm(true);
  };

  const filteredCats = categories.filter((c) => !form.type || c.type === form.type);

  return (
    <AdminLayout title="Products">
      {(error || success) && (
        <div className={`mb-4 p-3 rounded text-sm font-body ${error ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-green-500/10 border border-green-500/20 text-green-400'}`}>
          {error || success}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl text-ash-100 font-light">Products</h2>
          <p className="font-body text-ash-500 text-sm mt-0.5">{products.length} products</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="input py-2 w-36 text-xs" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="">All Types</option>
            <option value="wallpaper">Wallpaper</option>
            <option value="prompt">Prompt</option>
          </select>
          <button className="btn-primary text-xs" onClick={() => { setShowForm(!showForm); setForm(EMPTY_FORM); setEditId(null); }}>
            {showForm && !editId ? 'Cancel' : '+ Add Product'}
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card p-6 mb-6">
          <h3 className="font-body text-sm font-medium text-ash-200 mb-5">{editId ? 'Edit Product' : 'New Product'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Title</label>
                <input className="input" value={form.title} onChange={(e) => handleTitleChange(e.target.value)} required />
              </div>
              {!editId && (
                <div>
                  <label className="label">Slug</label>
                  <input className="input" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} required />
                </div>
              )}
              <div>
                <label className="label">Type</label>
                <select className="input" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value, category_id: '' }))} disabled={!!editId}>
                  <option value="wallpaper">Wallpaper</option>
                  <option value="prompt">Prompt</option>
                </select>
              </div>
              <div>
                <label className="label">Category</label>
                <select className="input" value={form.category_id} onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))} required>
                  <option value="">Select category…</option>
                  {filteredCats.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Price (INR, paise)</label>
                <input className="input" type="number" value={form.price_inr} onChange={(e) => setForm((f) => ({ ...f, price_inr: e.target.value }))} required placeholder="e.g. 1900" />
              </div>
              <div>
                <label className="label">Price (USD, cents)</label>
                <input className="input" type="number" value={form.price_usd} onChange={(e) => setForm((f) => ({ ...f, price_usd: e.target.value }))} placeholder="e.g. 249" />
              </div>
              <div className="md:col-span-2">
                <label className="label">Thumbnail URL</label>
                <input className="input" value={form.thumbnail_url} onChange={(e) => setForm((f) => ({ ...f, thumbnail_url: e.target.value }))} placeholder="https://..." />
              </div>
              <div className="md:col-span-2">
                <label className="label">Description</label>
                <textarea className="input resize-none" rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
              </div>

              {/* File uploads - only for new product */}
              {!editId && form.type === 'wallpaper' && (
                <>
                  {[['desktop', 'Desktop Image'], ['mobile', 'Mobile Image'], ['mockup_d', 'Mockup Desktop'], ['mockup_m', 'Mockup Mobile']].map(([field, label]) => (
                    <div key={field}>
                      <label className="label">{label}</label>
                      <input ref={fileRefs[field]} type="file" accept="image/*" className="input text-ash-400 file:mr-3 file:btn-primary file:text-xs file:py-1 file:px-3" />
                    </div>
                  ))}
                </>
              )}

              {!editId && form.type === 'prompt' && (
                <>
                  {[['before', 'Before Image'], ['after', 'After Image']].map(([field, label]) => (
                    <div key={field}>
                      <label className="label">{label}</label>
                      <input ref={fileRefs[field]} type="file" accept="image/*" className="input text-ash-400" />
                    </div>
                  ))}
                  <div className="md:col-span-2">
                    <label className="label">Prompt Text</label>
                    <textarea className="input font-mono text-xs resize-none" rows={5} value={form.prompt_text} onChange={(e) => setForm((f) => ({ ...f, prompt_text: e.target.value }))} placeholder="Enter the full prompt text…" />
                  </div>
                </>
              )}

              <div className="md:col-span-2 flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} className="w-4 h-4 accent-gold-500" />
                  <span className="font-body text-sm text-ash-300">Active (visible to customers)</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Saving…' : editId ? 'Update Product' : 'Create Product'}
              </button>
              <button type="button" className="btn-secondary" onClick={() => { setShowForm(false); setEditId(null); setForm(EMPTY_FORM); }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 border-gold-500/30 border-t-gold-500 animate-spin" />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {['Title', 'Category', 'Type', 'Price (INR)', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left label text-ash-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-5 py-3 font-body text-ash-200 max-w-[200px] truncate">{p.title}</td>
                  <td className="px-5 py-3 font-body text-ash-400 text-xs">{p.categories?.name}</td>
                  <td className="px-5 py-3"><span className={`badge text-[10px] ${p.type === 'wallpaper' ? 'badge-gold' : 'badge-ash'}`}>{p.type}</span></td>
                  <td className="px-5 py-3 font-mono text-gold-400">₹{(p.price_inr / 100).toFixed(0)}</td>
                  <td className="px-5 py-3"><StatusBadge active={p.active} /></td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(p)} className="btn-ghost text-xs px-2 py-1 text-ash-400">Edit</button>
                      <button onClick={() => handleDelete(p.id)} className="btn-ghost text-xs px-2 py-1 text-red-500/70 hover:text-red-400">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-ash-600 font-body text-sm">No products yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
