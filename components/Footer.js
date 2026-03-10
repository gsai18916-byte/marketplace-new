import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-obsidian-950 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <Link href="/" className="flex items-center gap-3 group mb-3">
              <div className="w-6 h-6 rounded border border-gold-500/30 flex items-center justify-center bg-gold-500/5">
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1L13 4.5V9.5L7 13L1 9.5V4.5L7 1Z" stroke="#f59e0b" strokeWidth="1.5" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="font-display text-lg text-ash-200 font-light">Luminance</span>
            </Link>
            <p className="font-body text-ash-500 text-sm max-w-xs">
              Premium digital wallpapers &amp; AI prompts, crafted for discerning creators.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-8 sm:gap-16 text-sm">
            <div>
              <p className="label mb-3">Products</p>
              <div className="flex flex-col gap-2">
                <Link href="/wallpapers" className="text-ash-400 hover:text-ash-100 transition-colors">Wallpapers</Link>
                <Link href="/prompts" className="text-ash-400 hover:text-ash-100 transition-colors">Prompts</Link>
              </div>
            </div>
            <div>
              <p className="label mb-3">Legal</p>
              <div className="flex flex-col gap-2">
                <Link href="/privacy" className="text-ash-400 hover:text-ash-100 transition-colors">Privacy Policy</Link>
                <Link href="/terms" className="text-ash-400 hover:text-ash-100 transition-colors">Terms of Use</Link>
                <Link href="/refunds" className="text-ash-400 hover:text-ash-100 transition-colors">Refund Policy</Link>
              </div>
            </div>
          </div>
        </div>

        <div className="divider mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-body text-ash-500 text-xs">
            © {new Date().getFullYear()} Luminance. All rights reserved.
          </p>
          <p className="font-body text-ash-500 text-xs">
            Payments secured by Razorpay &amp; Stripe
          </p>
        </div>
      </div>
    </footer>
  );
}
