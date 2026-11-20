'use client';

import React from 'react';
import Image from 'next/image';
import { WifiOff, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function OfflinePage() {
  const handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen w-full bg-[var(--background)] text-[var(--foreground)] flex flex-col items-center justify-center p-6 selection:bg-teal-500/20">
      <div className="max-w-md w-full bg-[var(--surface-card)] border border-[var(--border)] rounded-2xl p-8 shadow-xl flex flex-col items-center text-center relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Brand Icon */}
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-2xl bg-white p-3 flex items-center justify-center shadow-lg shadow-teal-500/10 border border-[#e2e8f0]">
            <Image
              src="/logo_minimal.png"
              alt="RHIZAN Logo"
              width={48}
              height={48}
              className="object-contain"
              priority
            />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-md">
            <WifiOff className="w-3.5 h-3.5" />
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl font-heading font-bold text-[var(--foreground)] tracking-tight mb-2">
          You are currently offline
        </h1>

        <p className="text-sm text-[var(--muted)] leading-relaxed mb-6">
          RHIZAN Hub could not establish an internet connection. Once your connection returns, you can resume managing tasks, tracking time, and updating projects.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          <button
            type="button"
            onClick={handleReload}
            className="w-full sm:flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 active:scale-[0.98] text-white font-medium text-xs shadow-md shadow-teal-700/20 transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>

          <Link
            href="/"
            className="w-full sm:flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] hover:bg-[var(--border)] text-xs font-medium text-[var(--foreground)] transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go Home</span>
          </Link>
        </div>

        <div className="mt-6 pt-4 border-t border-[var(--border)] w-full flex items-center justify-center gap-2 text-[11px] text-[var(--muted)]">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span>RHIZAN PWA Offline Mode active</span>
        </div>
      </div>
    </div>
  );
}
