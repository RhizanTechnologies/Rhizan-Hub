'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CheckSquare,
  FolderKanban,
  Users,
  Building2,
  Clock,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  ExternalLink,
  LogOut,
  Compass,
  X,
  FileText,
  SlidersHorizontal,
  Download,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSidebar } from '@/context/SidebarContext';
import { usePwa } from '@/context/PwaContext';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Clients', href: '/clients', icon: Building2 },
  { name: 'Client Outreach', href: '/approaches', icon: Compass },
  { name: 'Team', href: '/team', icon: Users },
  { name: 'Time Tracking', href: '/time', icon: Clock },
  { name: 'Weekly Report', href: '/reports/weekly', icon: FileText },
  { name: 'Settings', href: '/settings', icon: SlidersHorizontal },
  { name: 'Documentation', href: '/docs', icon: BookOpen },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { isOpen, close } = useSidebar();
  const { isInstallable, isInstalled, installPwa } = usePwa();

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Brand Header with Real Rhizan Tech Logo */}
      <div className="p-4 border-b border-slate-200 dark:border-[#222222] flex items-center justify-between">
        <Link href="/" onClick={close} className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-white p-1.5 flex items-center justify-center shadow-md shadow-teal-900/10 border border-slate-100 dark:border-transparent transition-transform group-hover:scale-105">
            <Image
              src="/logo_minimal.png"
              alt="Rhizan Logo"
              width={28}
              height={28}
              className="object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-bold text-sm tracking-wider text-slate-900 dark:text-white">RHIZAN</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                HUB
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-neutral-400">Internal Operations</p>
          </div>
        </Link>

        {/* Mobile Close Button */}
        <button
          onClick={close}
          className="lg:hidden p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-[#1a1a1a] transition"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-semibold text-slate-400 dark:text-neutral-500 uppercase tracking-wider">
          Workspace
        </div>
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={close}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-900/30 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-neutral-400 dark:hover:text-neutral-200 dark:hover:bg-[#181818]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-800 dark:text-neutral-400 dark:group-hover:text-neutral-200'
                  }`}
                />
                <span>{item.name}</span>
              </div>
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-teal-200" />}
            </Link>
          );
        })}

        <div className="pt-4 px-3">
          <a
            href="https://www.rhizantech.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between py-2 text-[11px] text-slate-500 hover:text-teal-600 dark:text-neutral-500 dark:hover:text-teal-400 transition"
          >
            <span>Public Portfolio</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </nav>

      {/* Internal Team Switcher */}
      <div className="p-3.5 border-t border-slate-200 dark:border-[#222222] bg-slate-50 dark:bg-[#121212]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-medium text-slate-500 dark:text-neutral-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-teal-500 dark:text-teal-400" /> Active Profile
          </span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 font-bold border ${
            user?.role === 'CEO'
              ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30'
              : user?.role === 'CTO'
              ? 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30'
              : user?.role === 'COO'
              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
              : user?.role === 'ADMIN'
              ? 'bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/20'
              : 'bg-slate-200 dark:bg-neutral-800 text-slate-700 dark:text-neutral-400 border-slate-300 dark:border-neutral-700'
          }`}>
            {user?.role === 'CEO' ? '👑 CEO' : user?.role === 'CTO' ? '⚡ CTO' : user?.role === 'COO' ? '📊 COO' : user?.role === 'ADMIN' ? '🛡️ Admin' : '👤 Member'}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-white dark:bg-[#181818] border border-slate-200 dark:border-[#262626] mb-2 shadow-2xs">
          <div className="text-xs font-semibold text-slate-900 dark:text-white">{user?.name || 'Rhizan Member'}</div>
          <div className="text-[11px] text-slate-500 dark:text-neutral-400 truncate">{user?.title || user?.email || 'Operations'}</div>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={() => {
            close();
            logout();
          }}
          className="w-full py-1.5 px-3 rounded-lg bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 dark:bg-[#161616] dark:hover:bg-[#202020] dark:text-neutral-400 dark:hover:text-rose-400 dark:border-[#262626] text-[11px] font-medium flex items-center justify-center gap-1.5 transition cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>

        {/* PWA Install Button when available */}
        {isInstallable && !isInstalled && (
          <button
            type="button"
            onClick={() => {
              close();
              installPwa();
            }}
            className="w-full mt-2 py-1.5 px-3 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 border border-teal-500/20 text-[11px] font-medium flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install Desktop App</span>
          </button>
        )}

        {/* Footer System Status */}
        <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-[#1f1f1f] flex items-center justify-between text-[10px] text-slate-400 dark:text-neutral-500">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span>
            v1.0.0 &bull; {isInstalled ? 'PWA Native' : 'PWA Ready'}
          </span>
          <span>&copy; 2026 Rhizan</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {isOpen && (
        <div
          onClick={close}
          className="fixed inset-0 bg-slate-950/60 dark:bg-black/75 backdrop-blur-sm z-40 lg:hidden transition-opacity animate-fade-in"
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer Slide-out */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-[#0d0d0d] text-slate-800 dark:text-neutral-200 border-r border-slate-200 dark:border-[#222222] flex flex-col h-screen select-none lg:hidden transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0 shadow-2xl shadow-slate-900/20 dark:shadow-black/90' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Desktop Persistent Sidebar (Fixed) */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-[#0d0d0d] text-slate-800 dark:text-neutral-200 border-r border-slate-200 dark:border-[#222222] flex-col h-screen select-none">
        {sidebarContent}
      </aside>
    </>
  );
};
