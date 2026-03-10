import Link from 'next/link';
import Image from 'next/image';

export default function CategoryCard({ category }) {
  const href =
    category.type === 'wallpaper'
      ? `/wallpapers/${category.slug}`
      : `/prompts/${category.slug}`;

  return (
    <Link href={href} className="group block">
      <div className="card card-hover aspect-[4/3] relative overflow-hidden">
        {category.thumbnail ? (
          <Image
            src={category.thumbnail}
            alt={category.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-obsidian-700 to-obsidian-800 flex items-center justify-center">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="text-white/10">
              <rect x="8" y="8" width="32" height="32" rx="4" stroke="currentColor" strokeWidth="2"/>
              <circle cx="18" cy="18" r="4" stroke="currentColor" strokeWidth="2"/>
              <path d="M8 32L16 24L22 30L30 20L40 32" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
            </svg>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950/90 via-obsidian-950/20 to-transparent" />

        {/* Type badge */}
        <div className="absolute top-3 left-3">
          <span className={`badge text-[10px] tracking-widest uppercase ${
            category.type === 'wallpaper' ? 'badge-gold' : 'badge-ash'
          }`}>
            {category.type}
          </span>
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-display text-xl text-ash-100 font-light leading-tight group-hover:text-gold-300 transition-colors duration-300">
            {category.name}
          </h3>
          <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="font-body text-gold-400 text-xs tracking-wide">Explore</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-gold-400">
              <path d="M2 6H10M7 3L10 6L7 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
