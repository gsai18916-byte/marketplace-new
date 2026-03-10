"use client";
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  const links = [
    { href: '/wallpapers', label: 'Wallpapers' },
    { href: '/prompts', label: 'Prompts' },
  ];

  const isActive = (href) => router.pathname.startsWith(href);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-obsidian-950/80 backdrop-blur-xl">
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-7 h-7 rounded border border-gold-500/30 flex items-center justify-center bg-gold-500/5 group-hover:bg-gold-500/10 transition-colors">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L13 4.5V9.5L7 13L1 9.5V4.5L7 1Z" stroke="#f59e0b" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="font-display text-xl text-ash-100 font-light tracking-wide">
            Luminance
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`font-body text-sm font-medium tracking-wide transition-colors duration-200 ${
                isActive(link.href)
                  ? 'text-gold-400'
                  : 'text-ash-400 hover:text-ash-100'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden text-ash-400 hover:text-ash-100 transition-colors p-1"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            {menuOpen ? (
              <path d="M5 5L17 17M17 5L5 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            ) : (
              <>
                <path d="M3 6H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M3 11H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M3 16H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </>
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/5 bg-obsidian-900/95 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`font-body text-sm font-medium py-2 transition-colors ${
                  isActive(link.href) ? 'text-gold-400' : 'text-ash-300 hover:text-ash-100'
                }`}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
