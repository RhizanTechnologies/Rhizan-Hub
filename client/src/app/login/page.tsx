'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPreFilled, setIsPreFilled] = useState(false);

  // Pre-fill email and temporary password if redirected from invitation email or copy link, or display error
  useEffect(() => {
    const emailParam = searchParams.get('email');
    const tempParam =
      searchParams.get('temp') ||
      searchParams.get('code') ||
      searchParams.get('password');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setError(errorParam);
    }
    if (emailParam) {
      setEmail(emailParam);
    }
    if (tempParam) {
      setPassword(tempParam);
    }
    if (emailParam || tempParam) {
      setIsPreFilled(true);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both your email address and password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const user = await login(email, password);

      if (user.mustChangePassword) {
        router.push('/change-password');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[var(--background)] text-[var(--foreground)] relative overflow-hidden select-none">
      {/* Background ambient lighting effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-teal-500/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Main Brand Card */}
        <div className="bg-white/95 dark:bg-[#111111]/90 backdrop-blur-xl border border-slate-200 dark:border-[#222222] rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-2xl dark:shadow-black/80">
          {/* Header Brand Info */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-900 p-2.5 flex items-center justify-center shadow-lg shadow-teal-500/15 border border-slate-100 dark:border-neutral-800 mb-4 transition-transform hover:scale-105">
              <Image
                src="/logo_minimal.png"
                alt="RHIZAN Logo"
                width={36}
                height={36}
                className="object-contain"
                priority
              />
            </div>

            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-heading font-extrabold text-xl tracking-wider text-slate-900 dark:text-white">RHIZAN</span>
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                HUB
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-neutral-400 font-medium">Internal Operations & Team Management</p>
          </div>

          {/* Invitation auto-fill notice */}
          {isPreFilled && (
            <div className="mb-5 p-3.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-700 dark:text-teal-300 text-xs flex items-center gap-2.5 animate-fade-in">
              <Sparkles className="w-4 h-4 text-teal-500 shrink-0" />
              <span>
                Your temporary invitation credentials have been automatically filled! Click <strong>Sign In</strong> below to continue.
              </span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2.5 animate-shake">
              <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 dark:text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@rhizan.com"
                  required
                  autoFocus={!isPreFilled}
                  className="w-full bg-slate-50 dark:bg-[#171717] border border-slate-200 dark:border-[#2a2a2a] focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 dark:text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password or temporary code"
                  required
                  className="w-full bg-slate-50 dark:bg-[#171717] border border-slate-200 dark:border-[#2a2a2a] focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 outline-none transition font-mono tracking-wide"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-neutral-500 dark:hover:text-neutral-300 transition"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-semibold text-xs shadow-lg shadow-teal-900/30 flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to RHIZAN</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <div className="text-center mt-6 text-[11px] text-neutral-500">
          RHIZAN Technologies • Internal Workspace Portal
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-[#080808]">
          <div className="w-8 h-8 border-2 border-teal-500/30 border-t-teal-400 rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
