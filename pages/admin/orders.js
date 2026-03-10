/* eslint-disable react/no-unescaped-entities */
"use client";
import AdminLayout from '../../components/AdminLayout';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

async function adminFetch(url) {
  const { data: { session } } = await supabase.auth.getSession();
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${session?.access_token}` },
  });
  return res.json();
}

function StatusBadge({ status }) {
  const map = { completed: 'badge-green', pending: 'badge-gold', failed: 'badge-red', refunded: 'badge-ash' };
  return <span className={`badge ${map[status] || 'badge-ash'}`}>{status}</span>;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [currencyFilter, setCurrencyFilter] = useState('');

  const loadOrders = async () => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 20 });
    if (statusFilter) params.set('status', statusFilter);
    if (currencyFilter) params.set('currency', currencyFilter);
    const data = await adminFetch(`/api/admin/orders?${params}`);
    setOrders(data.orders || []);
    setTotal(data.total || 0);
    setPages(data.pages || 1);
    setLoading(false);
  };

  useEffect(() => { loadOrders(); }, [page, statusFilter, currencyFilter]);

  const formatAmount = (amount, currency) => {
    if (currency === 'INR') return `₹${(amount / 100).toFixed(0)}`;
    return `$${(amount / 100).toFixed(2)}`;
  };

  return (
    <AdminLayout title="Orders">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl text-ash-100 font-light">Orders</h2>
          <p className="font-body text-ash-500 text-sm mt-0.5">{total} total orders</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="input py-2 w-36 text-xs" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
          <select className="input py-2 w-32 text-xs" value={currencyFilter} onChange={(e) => { setCurrencyFilter(e.target.value); setPage(1); }}>
            <option value="">All Currency</option>
            <option value="INR">INR</option>
            <option value="USD">USD</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 border-gold-500/30 border-t-gold-500 animate-spin" />
        </div>
      ) : (
        <>
          <div className="card overflow-hidden mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {['Order ID', 'Product', 'Customer', 'Amount', 'Status', 'Date'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left label text-ash-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-5 py-3 font-mono text-ash-500 text-xs">{order.id.slice(0, 8)}…</td>
                    <td className="px-5 py-3 font-body text-ash-200 max-w-[160px] truncate">{order.products?.title}</td>
                    <td className="px-5 py-3">
                      <div>
                        <p className="font-body text-ash-300 text-xs">{order.customer_email}</p>
                        {order.customer_name && <p className="font-body text-ash-500 text-xs">{order.customer_name}</p>}
                      </div>
                    </td>
                    <td className="px-5 py-3 font-mono text-gold-400">{formatAmount(order.amount, order.currency)}</td>
                    <td className="px-5 py-3"><StatusBadge status={order.status} /></td>
                    <td className="px-5 py-3 font-mono text-ash-500 text-xs">
                      {new Date(order.created_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr><td colSpan={6} className="px-5 py-10 text-center text-ash-600 font-body text-sm">No orders found</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-between">
              <p className="font-body text-ash-500 text-xs">Page {page} of {pages}</p>
              <div className="flex gap-2">
                <button className="btn-secondary text-xs px-3 py-1.5" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
                <button className="btn-secondary text-xs px-3 py-1.5" disabled={page >= pages} onClick={() => setPage(p => p + 1)}>Next →</button>
              </div>
            </div>
          )}
        </>
      )}
    </AdminLayout>
  );
}
