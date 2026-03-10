"use client";
import AdminLayout from '../../components/AdminLayout';
import StatsCard from '../../components/admin/StatsCard';
import SalesChart from '../../components/admin/SalesChart';
import TopProductsChart from '../../components/admin/TopProductsChart';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

function StatusBadge({ status }) {
  const map = {
    completed: 'badge-green',
    pending: 'badge-gold',
    failed: 'badge-red',
    refunded: 'badge-ash',
  };
  return <span className={`badge ${map[status] || 'badge-ash'}`}>{status}</span>;
}

async function adminFetch(url) {
  const { data: { session } } = await supabase.auth.getSession();
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${session?.access_token}` },
  });
  return res.json();
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminFetch('/api/admin/dashboard/stats'),
      adminFetch('/api/admin/dashboard/sales-over-time'),
      adminFetch('/api/admin/dashboard/top-products'),
      adminFetch('/api/admin/dashboard/recent-orders'),
    ]).then(([s, so, tp, ro]) => {
      setStats(s);
      setSalesData(so.salesData || []);
      setTopProducts(tp.topProducts || []);
      setRecentOrders(ro.orders || []);
    }).finally(() => setLoading(false));
  }, []);

  const formatInr = (p) => `₹${((p || 0) / 100).toLocaleString('en-IN')}`;
  const formatUsd = (p) => `$${((p || 0) / 100).toFixed(2)}`;

  if (loading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="flex items-center justify-center py-32">
          <div className="w-8 h-8 rounded-full border-2 border-gold-500/30 border-t-gold-500 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Dashboard">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          label="Total Orders"
          value={stats?.totalOrders?.toLocaleString() || '0'}
          sub="All time"
          icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 3h12v10H2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M2 7h12" stroke="currentColor" strokeWidth="1.5"/></svg>}
        />
        <StatsCard
          label="Revenue (INR)"
          value={formatInr(stats?.totalRevenueInr)}
          sub="All time"
          icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/><path d="M5 8h6M8 5v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>}
        />
        <StatsCard
          label="Revenue (USD)"
          value={formatUsd(stats?.totalRevenueUsd)}
          sub="All time"
          icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/><path d="M8 4v8M6 5.5h3a1.5 1.5 0 010 3H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>}
        />
        <StatsCard
          label="This Month"
          value={stats?.monthOrders?.toLocaleString() || '0'}
          sub={`Today: ${stats?.todayOrders || 0}`}
          icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="11" rx="1" stroke="currentColor" strokeWidth="1.5"/><path d="M5 2v2M11 2v2M2 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <SalesChart data={salesData} />
        <TopProductsChart data={topProducts} />
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div className="p-5 border-b border-white/5">
          <p className="label text-ash-500">Recent Activity</p>
          <p className="font-display text-xl text-ash-100 font-light mt-0.5">Latest Orders</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {['Product', 'Customer', 'Amount', 'Status', 'Date'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left label text-ash-600 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3 font-body text-ash-200 max-w-[180px] truncate">{order.products?.title}</td>
                  <td className="px-5 py-3 font-body text-ash-400 max-w-[160px] truncate">{order.customer_email}</td>
                  <td className="px-5 py-3 font-mono text-gold-400">
                    {order.currency === 'INR' ? formatInr(order.amount) : formatUsd(order.amount)}
                  </td>
                  <td className="px-5 py-3"><StatusBadge status={order.status} /></td>
                  <td className="px-5 py-3 font-mono text-ash-500 text-xs">
                    {new Date(order.created_at).toLocaleDateString('en-IN')}
                  </td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-ash-600 font-body text-sm">No orders yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
