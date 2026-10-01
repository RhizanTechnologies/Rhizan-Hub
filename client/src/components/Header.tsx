'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Clock, Plus, LogOut, ChevronDown, UserCheck } from 'lucide-react';
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
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

        {/* User Status Avatar & Dropdown */}
        <div className="relative pl-3 border-l border-[#222222]" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-[#181818] transition text-left"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-inner">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-medium text-white leading-none flex items-center gap-1">
                <span>{user?.name || 'Member'}</span>
                <ChevronDown className="w-3 h-3 text-neutral-400" />
              </div>
              <div className="text-[10px] text-teal-400 font-medium flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
                Active
              </div>
            </div>
          </button>

          {/* Profile Dropdown Menu */}
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#141414] border border-[#262626] shadow-2xl py-2 z-50 text-xs animate-fade-in">
              <div className="px-3.5 py-2 border-b border-[#222222]">
                <div className="font-semibold text-white truncate">{user?.name}</div>
                <div className="text-[11px] text-neutral-400 truncate">{user?.email}</div>
                <div className="mt-1.5 inline-block text-[10px] font-medium px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  {user?.role || 'MEMBER'}
                </div>
              </div>

              <div className="p-1">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-neutral-300 hover:text-rose-400 hover:bg-[#1c1c1c] transition text-left"
                >
                  <LogOut className="w-4 h-4 text-neutral-400" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
