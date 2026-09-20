'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Clock, Plus } from 'lucide-react';
import Link from 'next/link';

interface HeaderProps {
  title: string;
  subtitle?: string;
  actionButton?: {
    label: string;
    onClick: () => void;
  };
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  actionButton,
}) => {
  const { user } = useAuth();

  return (
    <header className="h-16 border-b border-[#222222] bg-[#0d0d0d]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      <div>
        <h1 className="font-heading text-base font-bold text-white tracking-tight flex items-center gap-2">
          {title}
        </h1>
        {subtitle && <p className="text-xs text-neutral-400">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Quick Log Time Link */}
        <Link
          href="/time"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#262626] bg-[#141414] hover:bg-[#1f1f1f] text-xs font-medium text-neutral-300 transition"
        >
          <Clock className="w-3.5 h-3.5 text-teal-400" />
          <span>Log Time</span>
        </Link>

        {/* Dynamic Action Button */}
        {actionButton && (
          <button
            onClick={actionButton.onClick}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-xs font-medium text-white shadow-md shadow-teal-900/30 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{actionButton.label}</span>
          </button>
        )}

        {/* User Status Avatar */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-[#222222]">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-inner">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-medium text-white leading-none">{user?.name}</div>
            <div className="text-[10px] text-teal-400 font-medium flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
              Active
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
