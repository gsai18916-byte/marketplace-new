export default function StatsCard({ label, value, sub, trend, icon }) {
  const trendUp = typeof trend === 'number' ? trend >= 0 : null;

  return (
    <div className="card p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <p className="label text-ash-500">{label}</p>
        {icon && (
          <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-ash-400">
            {icon}
          </div>
        )}
      </div>

      <div>
        <p className="font-display text-3xl font-light text-ash-100">{value}</p>
        {sub && (
          <p className="font-body text-xs text-ash-500 mt-1">{sub}</p>
        )}
      </div>

      {trend != null && (
        <div className={`flex items-center gap-1 text-xs font-mono ${trendUp ? 'text-green-400' : 'text-red-400'}`}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            {trendUp ? (
              <path d="M6 10V2M2 6l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            ) : (
              <path d="M6 2v8M2 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            )}
          </svg>
          {Math.abs(trend)}% vs last period
        </div>
      )}
    </div>
  );
}
