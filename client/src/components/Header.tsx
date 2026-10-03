'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSidebar } from '@/context/SidebarContext';
import { Clock, Plus, LogOut, ChevronDown, Menu, User as UserIcon, KeyRound } from 'lucide-react';
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
  const { toggle } = useSidebar();
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
    <header className="h-16 border-b border-[#222222] bg-[#0d0d0d]/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile Hamburger Menu Toggle */}
        <button
          onClick={toggle}
          type="button"
          className="lg:hidden p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-[#1a1a1a] border border-[#222222] transition shrink-0"
          aria-label="Open sidebar navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h1 className="font-heading text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2 truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[11px] sm:text-xs text-neutral-400 truncate hidden xs:block">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Quick Log Time Link */}
        <Link
          href="/time"
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-[#262626] bg-[#141414] hover:bg-[#1f1f1f] text-xs font-medium text-neutral-300 transition"
          title="Track & Log Time"
        >
          <Clock className="w-3.5 h-3.5 text-teal-400 shrink-0" />
          <span className="hidden sm:inline">Log Time</span>
        </Link>

        {/* Dynamic Action Button */}
        {actionButton && (
          <button
            onClick={actionButton.onClick}
            className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-xs font-medium text-white shadow-md shadow-teal-900/30 transition shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{actionButton.label}</span>
            <span className="sm:hidden">New</span>
          </button>
        )}

        {/* User Status Avatar & Dropdown */}
        <div className="relative pl-2 sm:pl-3 border-l border-[#222222]" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 sm:gap-2.5 p-1 rounded-xl hover:bg-[#181818] transition text-left"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-inner shrink-0">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="hidden md:block">
              <div className="text-xs font-medium text-white leading-none flex items-center gap-1">
                <span className="truncate max-w-[100px]">{user?.name || 'Member'}</span>
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

              <div className="p-1 space-y-0.5">
                {user?.id && (
                  <Link
                    href={`/team/${user.id}`}
                    onClick={() => setMenuOpen(false)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-neutral-300 hover:text-white hover:bg-[#1c1c1c] transition text-left"
                  >
                    <UserIcon className="w-4 h-4 text-neutral-400" />
                    <span>My Profile</span>
                  </Link>
                )}

                <Link
                  href="/change-password"
                  onClick={() => setMenuOpen(false)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-neutral-300 hover:text-white hover:bg-[#1c1c1c] transition text-left"
                >
                  <KeyRound className="w-4 h-4 text-neutral-400" />
                  <span>Change Password</span>
                </Link>

                <div className="h-px bg-[#222222] my-1" />

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
