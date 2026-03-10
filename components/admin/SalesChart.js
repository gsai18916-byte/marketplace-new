import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-obsidian-800 border border-white/10 rounded p-3 shadow-xl">
        <p className="font-mono text-xs text-ash-400 mb-1">{label}</p>
        <p className="font-mono text-sm text-gold-400">
          ₹{payload[0].value.toLocaleString()}
        </p>
        <p className="font-mono text-xs text-ash-500">
          {payload[0].payload.orders} orders
        </p>
      </div>
    );
  }
  return null;
};

export default function SalesChart({ data }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="label text-ash-500">Sales Overview</p>
          <p className="font-display text-xl text-ash-100 font-light mt-0.5">Last 30 Days</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="goldGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.8}/>
              <stop offset="100%" stopColor="#fbbf24" stopOpacity={1}/>
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" />
          <XAxis
            dataKey="date"
            tick={{ fill: '#636369', fontSize: 11, fontFamily: 'JetBrains Mono' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => {
              const d = new Date(v);
              return `${d.getDate()}/${d.getMonth() + 1}`;
            }}
          />
          <YAxis
            tick={{ fill: '#636369', fontSize: 11, fontFamily: 'JetBrains Mono' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="url(#goldGradient)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#f59e0b', strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
