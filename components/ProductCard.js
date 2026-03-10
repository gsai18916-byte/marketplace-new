import Link from 'next/link';
import Image from 'next/image';

function formatPrice(paise, currency = 'INR') {
  if (currency === 'INR') {
    return `₹${(paise / 100).toFixed(0)}`;
  }
  return `$${(paise / 100).toFixed(2)}`;
}

export default function ProductCard({ product }) {
  return (
    <Link href={`/product/${product.id}`} className="group block">
      <div className="card card-hover">
        {/* Thumbnail */}
        <div className="aspect-[3/2] relative overflow-hidden bg-obsidian-700">
          {product.thumbnail_url ? (
            <Image
              src={product.thumbnail_url}
              alt={product.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-obsidian-700 to-obsidian-600 flex items-center justify-center">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="text-white/10">
                <rect x="6" y="6" width="28" height="28" rx="3" stroke="currentColor" strokeWidth="1.5"/>
                <circle cx="15" cy="15" r="3.5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M6 28L14 20L19 25L25 17L34 28" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-obsidian-950/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <span className="btn-primary text-xs px-4 py-2">View Details</span>
          </div>

          {/* Type badge */}
          <div className="absolute top-2.5 left-2.5">
            <span className={`badge text-[10px] tracking-widest uppercase ${
              product.type === 'wallpaper' ? 'badge-gold' : 'badge-ash'
            }`}>
              {product.type}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-body text-sm font-medium text-ash-200 truncate group-hover:text-ash-100 transition-colors">
            {product.title}
          </h3>
          <div className="flex items-center justify-between mt-2">
            <span className="font-mono text-sm font-medium text-gold-400">
              {formatPrice(product.price_inr)}
            </span>
            {!product.active && (
              <span className="badge badge-ash text-[10px]">Inactive</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
