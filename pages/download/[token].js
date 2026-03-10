"use client";
import Layout from '../../components/Layout';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

function formatDate(iso) {
  return new Date(iso).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function DownloadPage() {
  const router = useRouter();
  const { token } = router.query;

  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [downloadDone, setDownloadDone] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/download-page?token=${token}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setInfo(d);
      })
      .catch(() => setError('Failed to load download info'))
      .finally(() => setLoading(false));
  }, [token]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch('/api/get-download-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Trigger download
      const a = document.createElement('a');
      a.href = data.downloadUrl;
      a.download = data.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setInfo((prev) => ({ ...prev, remainingDownloads: data.remainingDownloads }));
      setDownloadDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Layout title="Download — Luminance">
      <div className="max-w-xl mx-auto px-6 py-24">
        {loading && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 rounded-full border-2 border-gold-500/30 border-t-gold-500 animate-spin" />
            <p className="font-body text-ash-500 text-sm">Loading your download…</p>
          </div>
        )}

        {error && !loading && (
          <div className="card p-8 text-center">
            <div className="w-14 h-14 rounded-full border border-red-500/30 bg-red-500/5 flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-red-400">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h2 className="font-display text-xl text-ash-100 font-light mb-2">Invalid Link</h2>
            <p className="font-body text-ash-500 text-sm">{error}</p>
          </div>
        )}

        {info && !error && (
          <div className="card overflow-visible">
            {/* Header */}
            <div className="p-6 border-b border-white/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full border border-gold-500/30 bg-gold-500/10 flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-gold-400">
                    <path d="M9 2v10M5 8l4 4 4-4M3 14h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <p className="font-body text-xs text-ash-500">Your download is ready</p>
                  <h2 className="font-display text-lg text-ash-100 font-light">
                    {info.order?.product?.title}
                  </h2>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 divide-x divide-white/5 border-b border-white/5">
              <div className="p-4 text-center">
                <p className="font-mono text-2xl font-medium text-gold-400">{info.remainingDownloads}</p>
                <p className="font-body text-xs text-ash-500 mt-0.5">Downloads left</p>
              </div>
              <div className="p-4 text-center">
                <p className="font-mono text-sm font-medium text-ash-200">{formatDate(info.expiresAt)}</p>
                <p className="font-body text-xs text-ash-500 mt-0.5">Link expires</p>
              </div>
            </div>

            {/* Download button */}
            <div className="p-6">
              {info.isExpired ? (
                <div className="text-center">
                  <span className="badge badge-red mb-3">Link Expired</span>
                  <p className="font-body text-ash-500 text-sm">This download link has expired. Please contact support.</p>
                </div>
              ) : info.remainingDownloads <= 0 ? (
                <div className="text-center">
                  <span className="badge badge-red mb-3">No Downloads Left</span>
                  <p className="font-body text-ash-500 text-sm">You&apos;ve reached the maximum downloads for this link.</p>
                </div>
              ) : (
                <>
                  <button
                    className="btn-primary w-full justify-center"
                    onClick={handleDownload}
                    disabled={downloading}
                  >
                    {downloading ? (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-obsidian-950/30 border-t-obsidian-950 animate-spin" />
                        Preparing download…
                      </>
                    ) : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M8 2v8M4 7l4 4 4-4M2 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Download Now
                      </>
                    )}
                  </button>
                  {downloadDone && (
                    <p className="font-body text-green-400 text-xs text-center mt-3">
                      ✓ Download started — {info.remainingDownloads} download{info.remainingDownloads !== 1 ? 's' : ''} remaining
                    </p>
                  )}
                </>
              )}

              <p className="font-body text-ash-600 text-xs text-center mt-4">
                Keep this link safe • Sent to {info.order?.customerEmail}
              </p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
