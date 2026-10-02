'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { Sidebar } from '@/components/Sidebar';
import { SidebarProvider } from '@/context/SidebarContext';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isAuthRoute = pathname === '/login' || pathname === '/change-password';

  useEffect(() => {
    if (isLoading) return;

    // 1. Not logged in -> must be on /login
    if (!token || !user) {
      if (pathname !== '/login') {
        router.replace('/login');
      }
      return;
    }

    // 2. Logged in, but must change password
    if (user.mustChangePassword) {
      if (pathname !== '/change-password') {
        router.replace('/change-password');
      }
      return;
    }

    // 3. Logged in and password already changed -> cannot stay on auth routes
    if (isAuthRoute) {
      router.replace('/');
    }
  }, [isLoading, token, user, pathname, router, isAuthRoute]);

  // Loading state with Rhizan branding
  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-[#0a0a0a] flex flex-col items-center justify-center">
        <div className="relative flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white p-2.5 flex items-center justify-center shadow-2xl shadow-teal-500/20 animate-pulse">
            <Image
              src="/logo_minimal.png"
              alt="RHIZAN Logo"
              width={40}
              height={40}
              className="object-contain"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping"></span>
            <span className="text-xs font-heading font-medium tracking-wider text-neutral-400 uppercase">
              Loading RHIZAN Hub...
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Auth pages (login, change password) - full screen, no workspace sidebar
  if (isAuthRoute || !token || !user || user.mustChangePassword) {
    return (
      <main className="min-h-screen w-full bg-[#0a0a0a] text-neutral-100 flex flex-col">
        {children}
      </main>
    );
  }

  // Authenticated workspace
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#0a0a0a]">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-[#0a0a0a]">
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
};
