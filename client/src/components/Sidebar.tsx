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
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSidebar } from '@/context/SidebarContext';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Clients', href: '/clients', icon: Building2 },
  { name: 'Outreach & Leads', href: '/approaches', icon: Compass },
  { name: 'Team', href: '/team', icon: Users },
  { name: 'Time Tracking', href: '/time', icon: Clock },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { isOpen, close } = useSidebar();

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Brand Header with Real Rhizan Tech Logo */}
      <div className="p-4 border-b border-[#222222] flex items-center justify-between">
        <Link href="/" onClick={close} className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-white p-1.5 flex items-center justify-center shadow-md shadow-teal-900/20 transition-transform group-hover:scale-105">
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
              <span className="font-heading font-bold text-sm tracking-wider text-white">RHIZAN</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20">
                HUB
              </span>
            </div>
            <p className="text-[10px] text-neutral-400">Internal Operations</p>
          </div>
        </Link>

        {/* Mobile Close Button */}
        <button
          onClick={close}
          className="lg:hidden p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-[#1a1a1a] transition"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
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
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-900/30'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#181818]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-neutral-400 group-hover:text-neutral-200'
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
            className="flex items-center justify-between py-2 text-[11px] text-neutral-500 hover:text-teal-400 transition"
          >
            <span>Public Portfolio</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </nav>

      {/* Internal Team Switcher */}
      <div className="p-3.5 border-t border-[#222222] bg-[#121212]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-medium text-neutral-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-teal-400" /> Active Profile
          </span>
          {user?.role === 'ADMIN' && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center gap-0.5 font-medium">
              <ShieldCheck className="w-2.5 h-2.5" /> Admin
            </span>
          )}
        </div>

        <div className="p-2.5 rounded-xl bg-[#181818] border border-[#262626] mb-2">
          <div className="text-xs font-semibold text-white">{user?.name || 'Rhizan Member'}</div>
          <div className="text-[11px] text-neutral-400 truncate">{user?.title || user?.email || 'Operations'}</div>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={() => {
            close();
            logout();
          }}
          className="w-full py-1.5 px-3 rounded-lg bg-[#161616] hover:bg-[#202020] text-neutral-400 hover:text-rose-400 border border-[#262626] text-[11px] font-medium flex items-center justify-center gap-1.5 transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>

        {/* Footer System Status */}
        <div className="mt-3 pt-2.5 border-t border-[#1f1f1f] flex items-center justify-between text-[10px] text-neutral-500">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
            v1.0.0 • Systems Active
          </span>
          <span>© 2026 Rhizan</span>
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
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-40 lg:hidden transition-opacity animate-fade-in"
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer Slide-out */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0d0d0d] text-neutral-200 border-r border-[#222222] flex flex-col h-screen select-none lg:hidden transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0 shadow-2xl shadow-black/90' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-64 bg-[#0d0d0d] text-neutral-200 border-r border-[#222222] flex-col h-screen sticky top-0 select-none shrink-0">
        {sidebarContent}
      </aside>
    </>
  );
};
