"use client";
import AdminLayout from '../../components/AdminLayout';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

async function adminFetch(url, options = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session?.access_token}`,
      ...(options.headers || {}),
    },
  });
  return res.json();
}

const EMPTY_FORM = { name: '', type: 'wallpaper', slug: '', thumbnail: '' };

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);

  const loadCategories = async () => {
    const data = await adminFetch('/api/admin/categories');
    setCategories(data.categories || []);
    setLoading(false);
  };

  useEffect(() => { loadCategories(); }, []);

  const handleNameChange = (name) => {
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    setForm((f) => ({ ...f, name, slug: editId ? f.slug : slug }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      if (editId) {
        await adminFetch(`/api/admin/categories/${editId}`, {
          method: 'PUT',
          body: JSON.stringify({ name: form.name, thumbnail: form.thumbnail }),
        });
        setSuccess('Category updated');
      } else {
        await adminFetch('/api/admin/categories', {
          method: 'POST',
          body: JSON.stringify(form),
        });
        setSuccess('Category created');
      }
      setForm(EMPTY_FORM);
      setEditId(null);
      setShowForm(false);
      loadCategories();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (cat) => {
    setForm({ name: cat.name, type: cat.type, slug: cat.slug, thumbnail: cat.thumbnail || '' });
    setEditId(cat.id);
    setShowForm(true);
    setError('');
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category? This cannot be undone.')) return;
    const data = await adminFetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
    if (data.error) { setError(data.error); return; }
    setSuccess('Category deleted');
    loadCategories();
  };

  return (
    <AdminLayout title="Categories">
      {(error || success) && (
        <div className={`mb-4 p-3 rounded text-sm font-body ${error ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-green-500/10 border border-green-500/20 text-green-400'}`}>
          {error || success}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl text-ash-100 font-light">Categories</h2>
          <p className="font-body text-ash-500 text-sm mt-0.5">{categories.length} categories</p>
        </div>
        <button className="btn-primary" onClick={() => { setShowForm(!showForm); setForm(EMPTY_FORM); setEditId(null); }}>
          {showForm && !editId ? 'Cancel' : '+ Add Category'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card p-6 mb-6">
          <h3 className="font-body text-sm font-medium text-ash-200 mb-4">{editId ? 'Edit Category' : 'New Category'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Name</label>
              <input className="input" value={form.name} onChange={(e) => handleNameChange(e.target.value)} required placeholder="e.g. Cars" />
            </div>
            <div>
              <label className="label">Slug</label>
              <input className="input" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} required placeholder="e.g. cars" disabled={!!editId} />
            </div>
            <div>
              <label className="label">Type</label>
              <select className="input" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} disabled={!!editId}>
                <option value="wallpaper">Wallpaper</option>
                <option value="prompt">Prompt</option>
              </select>
            </div>
            <div>
              <label className="label">Thumbnail URL (optional)</label>
              <input className="input" value={form.thumbnail} onChange={(e) => setForm((f) => ({ ...f, thumbnail: e.target.value }))} placeholder="https://..." />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Saving…' : editId ? 'Update' : 'Create'}
              </button>
              <button type="button" className="btn-secondary" onClick={() => { setShowForm(false); setEditId(null); setForm(EMPTY_FORM); }}>
                Cancel
              </button>
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
                {['Name', 'Type', 'Slug', 'Actions'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left label text-ash-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3 font-body text-ash-200">{cat.name}</td>
                  <td className="px-5 py-3">
                    <span className={`badge text-[10px] ${cat.type === 'wallpaper' ? 'badge-gold' : 'badge-ash'}`}>{cat.type}</span>
                  </td>
                  <td className="px-5 py-3 font-mono text-ash-500 text-xs">{cat.slug}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(cat)} className="btn-ghost text-xs px-2 py-1 text-ash-400 hover:text-ash-100">Edit</button>
                      <button onClick={() => handleDelete(cat.id)} className="btn-ghost text-xs px-2 py-1 text-red-500/70 hover:text-red-400">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr><td colSpan={4} className="px-5 py-10 text-center text-ash-600 font-body text-sm">No categories yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
