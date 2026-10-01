'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { KeyRound, Lock, Eye, EyeOff, CheckCircle2, ArrowRight, LogOut, ShieldAlert } from 'lucide-react';

export default function ChangePasswordPage() {
  const router = useRouter();
  const { user, changePassword, logout } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Password rules validation
  const hasMinLength = newPassword.length >= 6;
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const isDifferentFromCurrent = newPassword.length > 0 && newPassword !== currentPassword;
  const canSubmit = hasMinLength && passwordsMatch && currentPassword.length > 0 && !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    if (newPassword === currentPassword) {
      setError('Your new password must be different from your temporary password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await changePassword(currentPassword, newPassword);
      setSuccess(true);

      // Short delay to show success feedback before redirecting to the hub
      setTimeout(() => {
        router.push('/');
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to update password. Please check your current password.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#080808] relative overflow-hidden select-none">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-teal-500/10 rounded-full blur-[130px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-[#111111]/90 backdrop-blur-xl border border-[#222222] rounded-3xl p-8 shadow-2xl shadow-black/80">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center shadow-lg shadow-teal-900/20 mb-3">
              <KeyRound className="w-6 h-6 text-teal-400" />
            </div>

            <h1 className="font-heading font-bold text-lg text-white">
              Create Your New Password
            </h1>
            <p className="text-xs text-neutral-400 mt-1 max-w-sm">
              Welcome, <span className="text-white font-semibold">{user?.name || 'Teammate'}</span>! For your security, you must replace your temporary password with a permanent one.
            </p>
          </div>

          {/* Success Banner */}
          {success && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="font-semibold">Password updated successfully!</p>
                <p className="text-[11px] text-emerald-400/80 mt-0.5">Redirecting to your workspace...</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Current / Temporary Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter the password from your invitation"
                  required
                  autoFocus
                  disabled={loading || success}
                  className="w-full bg-[#171717] border border-[#2a2a2a] focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-neutral-500 outline-none transition disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition"
                  tabIndex={-1}
                >
                  {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                New Permanent Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Create a strong password (min 6 chars)"
                  required
                  disabled={loading || success}
                  className="w-full bg-[#171717] border border-[#2a2a2a] focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 outline-none transition disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type your new password"
                  required
                  disabled={loading || success}
                  className="w-full bg-[#171717] border border-[#2a2a2a] focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 outline-none transition disabled:opacity-50"
                />
              </div>
            </div>

            {/* Validation Checklist */}
            <div className="p-3 rounded-xl bg-[#171717] border border-[#262626] space-y-1.5 text-[11px]">
              <div className={`flex items-center gap-2 ${hasMinLength ? 'text-emerald-400' : 'text-neutral-500'}`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>At least 6 characters</span>
              </div>
              <div className={`flex items-center gap-2 ${passwordsMatch ? 'text-emerald-400' : 'text-neutral-500'}`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Passwords match</span>
              </div>
              {newPassword.length > 0 && currentPassword.length > 0 && (
                <div className={`flex items-center gap-2 ${isDifferentFromCurrent ? 'text-emerald-400' : 'text-rose-400'}`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Different from temporary password</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={!canSubmit || success}
              className="w-full mt-3 py-2.5 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-semibold text-xs shadow-lg shadow-teal-900/30 flex items-center justify-center gap-2 transition disabled:opacity-40 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Updating password...</span>
                </>
              ) : (
                <>
                  <span>Save Password & Enter RHIZAN Hub</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          {/* Sign Out Option */}
          <div className="mt-6 pt-4 border-t border-[#1e1e1e] flex items-center justify-between text-xs">
            <span className="text-neutral-500 text-[11px]">Signed in as {user?.email}</span>
            <button
              type="button"
              onClick={logout}
              className="text-neutral-400 hover:text-rose-400 transition flex items-center gap-1 text-[11px]"
            >
              <LogOut className="w-3 h-3" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
