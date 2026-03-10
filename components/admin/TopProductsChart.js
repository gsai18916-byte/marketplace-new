import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-obsidian-800 border border-white/10 rounded p-3 shadow-xl">
        <p className="font-body text-xs text-ash-400 mb-1 truncate max-w-[160px]">{label}</p>
        <p className="font-mono text-sm text-gold-400">
          ₹{payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export default function TopProductsChart({ data }) {
  return (
    <div className="card p-5">
      <div className="mb-6">
        <p className="label text-ash-500">Top Products</p>
        <p className="font-display text-xl text-ash-100 font-light mt-0.5">By Revenue</p>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }} layout="vertical">
          <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" horizontal={false}/>
          <XAxis
            type="number"
            tick={{ fill: '#636369', fontSize: 11, fontFamily: 'JetBrains Mono' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v}`}
          />
          <YAxis
            type="category"
            dataKey="title"
            tick={{ fill: '#98989e', fontSize: 11, fontFamily: 'DM Sans' }}
            axisLine={false}
            tickLine={false}
            width={100}
            tickFormatter={(v) => v.length > 14 ? v.slice(0, 14) + '…' : v}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }}/>
          <Bar dataKey="revenue" radius={[0, 3, 3, 0]}>
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={index === 0 ? '#f59e0b' : `rgba(245,158,11,${0.6 - index * 0.1})`}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
