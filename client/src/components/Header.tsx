'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSidebar } from '@/context/SidebarContext';
import { useTheme } from '@/context/ThemeContext';
import { usePwa } from '@/context/PwaContext';
import { useNotifications } from '@/context/NotificationContext';
import {
  Clock,
  Plus,
  Edit2,
  LogOut,
  ChevronDown,
  Menu,
  User as UserIcon,
  KeyRound,
  SlidersHorizontal,
  Sun,
  Moon,
  Download,
  Check,
  UserCog,
  Bell,
  BookOpen,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { EditProfileModal } from './EditProfileModal';

interface HeaderProps {
  title: string | React.ReactNode;
  subtitle?: string;
  actionButton?: {
    label: string;
    mobileLabel?: string;
    icon?: React.ReactNode;
    onClick: () => void;
  };
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  actionButton,
}) => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { toggle } = useSidebar();
  const { isLight, toggleColorMode } = useTheme();
  const { isInstallable, isInstalled, installPwa } = usePwa();
  const { unreadCount, toggleDrawer } = useNotifications();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
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
    <>
      <header className="min-h-16 border-b border-slate-200 dark:border-[#1e2a3c] bg-white/80 dark:bg-[#101724]/80 backdrop-blur-md px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 sticky top-0 z-30">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        {/* Mobile Hamburger Menu Toggle */}
        <button
          onClick={toggle}
          type="button"
          className="lg:hidden min-w-[38px] min-h-[38px] p-2 rounded-xl text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#151d2a] active:bg-slate-200 dark:active:bg-[#1a2436] border border-slate-200 dark:border-[#1e2a3c] transition shrink-0 flex items-center justify-center"
          aria-label="Open sidebar navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="font-heading text-xs sm:text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5 truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-neutral-400 truncate hidden md:block">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Quick Log Time Link (visible across app except when already on time page) */}
        {pathname !== '/time' && (
          <Link
            href="/time"
            className="hidden md:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#1e2a3c] bg-slate-50 dark:bg-[#151d2a] hover:bg-slate-100 dark:hover:bg-[#1a2436] text-xs font-medium text-slate-700 dark:text-neutral-300 transition"
            title="Track & Log Time"
          >
            <Clock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
            <span className="hidden sm:inline">Log Time</span>
          </Link>
        )}

        {/* Dynamic Action Button - Desktop/Tablet Header Only */}
        {actionButton && (() => {
          const isEdit = actionButton.label.toLowerCase().includes('edit');
          return (
            <button
              onClick={actionButton.onClick}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-xs font-semibold text-white shadow-md shadow-teal-900/30 transition shrink-0 cursor-pointer"
              title={actionButton.label}
            >
              {actionButton.icon ? (
                actionButton.icon
              ) : isEdit ? (
                <Edit2 className="w-3.5 h-3.5" />
              ) : (
                <Plus className="w-3.5 h-3.5" />
              )}
              <span>{actionButton.label}</span>
            </button>
          );
        })()}

        {/* Real-Time Notification Bell */}
        <button
          onClick={toggleDrawer}
          type="button"
          className="relative p-1.5 sm:p-2 rounded-xl border border-slate-200 dark:border-[#1e2a3c] bg-slate-50 dark:bg-[#151d2a] hover:bg-slate-100 dark:hover:bg-[#1a2436] text-slate-700 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white transition flex items-center justify-center shrink-0 shadow-sm"
          title={unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'Notifications'}
          aria-label="Toggle notifications center"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 bg-teal-500 text-black font-extrabold text-[9px] rounded-full flex items-center justify-center shadow-md animate-scale-in">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* 1-Click Quick Light/Dark Mode Switcher */}
        <button
          onClick={toggleColorMode}
          type="button"
          className="p-1.5 sm:p-2 rounded-xl border border-slate-200 dark:border-[#1e2a3c] bg-slate-50 dark:bg-[#151d2a] hover:bg-slate-100 dark:hover:bg-[#1a2436] text-slate-700 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white transition flex items-center justify-center shrink-0 shadow-sm"
          title={isLight ? 'Switch to Dark Mode (Soft Slate)' : 'Switch to Clean Light Mode'}
          aria-label="Toggle theme color"
        >
          {isLight ? (
            <Moon className="w-4 h-4 text-indigo-500" />
          ) : (
            <Sun className="w-4 h-4 text-amber-400" />
          )}
        </button>

        {/* PWA Install Button in Header */}
        {isInstallable && !isInstalled && (
          <button
            onClick={() => installPwa()}
            type="button"
            className="hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-teal-500/30 bg-teal-500/10 hover:bg-teal-500/20 text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 text-xs font-medium transition shrink-0 cursor-pointer shadow-sm animate-pulse"
            title="Install RHIZAN Hub app on this device"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Install App</span>
          </button>
        )}

        {/* User Status Avatar & Dropdown */}
        <div className="relative pl-1 sm:pl-2 border-l border-slate-200 dark:border-[#1e2a3c]" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 sm:gap-2.5 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-[#151d2a] transition text-left"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-inner shrink-0">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="hidden md:block">
              <div className="text-xs font-medium text-slate-800 dark:text-white leading-none flex items-center gap-1">
                <span className="truncate max-w-[100px]">{user?.name || 'Member'}</span>
                <ChevronDown className="w-3 h-3 text-slate-400 dark:text-neutral-400" />
              </div>
              <div className="text-[10px] text-teal-600 dark:text-teal-400 font-medium flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span>
                Active
              </div>
            </div>
          </button>

          {/* Profile Dropdown Menu */}
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-white dark:bg-[#151d2a] border border-slate-200 dark:border-[#222e42] shadow-2xl py-2 z-50 text-xs animate-fade-in">
              <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-[#1e2a3c]">
                <div className="font-semibold text-slate-900 dark:text-white truncate text-sm">{user?.name}</div>
                <div className="text-[11px] text-slate-500 dark:text-neutral-400 truncate">{user?.email}</div>
                <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    user?.role === 'CEO'
                      ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30'
                      : user?.role === 'CTO'
                      ? 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30'
                      : user?.role === 'COO'
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                      : user?.role === 'ADMIN'
                      ? 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/30'
                      : 'bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 border-slate-200 dark:border-neutral-700'
                  }`}>
                    {user?.role === 'CEO' ? '👑 CEO' : user?.role === 'CTO' ? '⚡ CTO' : user?.role === 'COO' ? '📊 COO' : user?.role === 'ADMIN' ? '🛡️ Admin' : '👤 Member'}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-neutral-400 truncate max-w-[130px]">• {user?.title || 'Team Member'}</span>
                </div>
              </div>

              <div className="p-1 space-y-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setIsEditProfileOpen(true);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-teal-700 dark:text-teal-300 hover:text-teal-800 dark:hover:text-teal-200 hover:bg-teal-500/10 font-semibold transition text-left"
                >
                  <UserCog className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>Edit Profile</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    toggleColorMode();
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#101724] transition text-left"
                >
                  <div className="flex items-center gap-2">
                    {isLight ? (
                      <Moon className="w-4 h-4 text-indigo-500" />
                    ) : (
                      <Sun className="w-4 h-4 text-amber-400" />
                    )}
                    <span>{isLight ? 'Dark Mode' : 'Light Mode'}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-teal-500/10 text-teal-600 dark:text-teal-400 font-mono">
                    {isLight ? 'Light Active' : 'Dark Active'}
                  </span>
                </button>

                {user?.id && (
                  <Link
                    href={`/team/${user.id}`}
                    onClick={() => setMenuOpen(false)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#101724] transition text-left"
                  >
                    <UserIcon className="w-4 h-4 text-slate-400 dark:text-neutral-400" />
                    <span>My Profile & Stats</span>
                  </Link>
                )}

                <Link
                  href="/settings"
                  onClick={() => setMenuOpen(false)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#101724] transition text-left"
                >
                  <SlidersHorizontal className="w-4 h-4 text-slate-400 dark:text-neutral-400" />
                  <span>Settings & Appearance</span>
                </Link>

                <Link
                  href="/docs"
                  onClick={() => setMenuOpen(false)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#101724] transition text-left"
                >
                  <BookOpen className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>Hub Documentation</span>
                </Link>

                <Link
                  href="/change-password"
                  onClick={() => setMenuOpen(false)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#101724] transition text-left"
                >
                  <KeyRound className="w-4 h-4 text-slate-400 dark:text-neutral-400" />
                  <span>Change Password</span>
                </Link>

                {isInstallable && !isInstalled && (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      installPwa();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 hover:bg-teal-500/10 border border-teal-500/20 transition text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Download className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      <span>Install App</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-700 dark:text-teal-300 font-semibold font-mono">
                      PWA
                    </span>
                  </button>
                )}

                {isInstalled && (
                  <div className="px-3 py-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-neutral-400">
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                      <span>App Installed</span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-neutral-800 text-teal-600 dark:text-teal-400 font-mono">
                      Standalone
                    </span>
                  </div>
                )}

                <div className="h-px bg-slate-100 dark:bg-[#1e2a3c] my-1" />

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 dark:text-neutral-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-[#101724] transition text-left"
                >
                  <LogOut className="w-4 h-4 text-slate-400 dark:text-neutral-400" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>

    {/* Mobile In-Body Action Ribbon (Displays primary page actions in the body on mobile) */}
    {(actionButton || (pathname !== '/time' && pathname !== '/login' && pathname !== '/change-password' && pathname !== '/docs' && pathname !== '/settings')) && (
      <div className="sm:hidden px-3.5 pt-3 pb-1 max-w-7xl mx-auto w-full flex items-center gap-2">
        {actionButton && (() => {
          const isEdit = actionButton.label.toLowerCase().includes('edit');
          return (
            <button
              type="button"
              onClick={actionButton.onClick}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white font-semibold text-xs shadow-md shadow-teal-900/30 transition cursor-pointer"
            >
              {actionButton.icon ? (
                actionButton.icon
              ) : isEdit ? (
                <Edit2 className="w-4 h-4" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              <span>{actionButton.label}</span>
            </button>
          );
        })()}

        {/* Quick Log Time on mobile if not already on /time */}
        {pathname !== '/time' && (
          <Link
            href="/time"
            className={`flex items-center justify-center gap-1.5 py-2.5 px-3.5 rounded-2xl border border-slate-200 dark:border-[#1e2a3c] bg-slate-50 dark:bg-[#151d2a] hover:bg-slate-100 dark:hover:bg-[#1a2436] active:bg-slate-200 dark:active:bg-[#1e2a3c] text-xs font-medium text-slate-700 dark:text-neutral-300 transition shrink-0 ${
              !actionButton ? 'flex-1' : ''
            }`}
            title="Track & Log Time"
          >
            <Clock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
            <span>Log Time</span>
          </Link>
        )}
      </div>
    )}

    <EditProfileModal
      isOpen={isEditProfileOpen}
      onClose={() => setIsEditProfileOpen(false)}
    />
    </>
  );
};
