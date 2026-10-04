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
      <div className="min-h-screen w-full bg-[var(--background)] text-[var(--foreground)] flex flex-col items-center justify-center">
        <div className="relative flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white p-2.5 flex items-center justify-center shadow-xl shadow-teal-500/10 border border-[#e2e8f0] animate-pulse">
            <Image
              src="/logo_minimal.png"
              alt="RHIZAN Logo"
              width={40}
              height={40}
              className="object-contain"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping"></span>
            <span className="text-xs font-heading font-medium tracking-wider text-neutral-400 uppercase">
              Loading RHIZAN Hub...
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Unauthenticated user
  if (!token || !user) {
    if (pathname === '/login') {
      return (
        <main className="min-h-screen w-full bg-[var(--background)] text-[var(--foreground)] flex flex-col">
          {children}
        </main>
      );
    }

    // Redirecting to login, do not mount protected children
    return (
      <div className="min-h-screen w-full bg-[var(--background)] text-[var(--foreground)] flex flex-col items-center justify-center">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping"></span>
          <span className="text-xs font-heading font-medium tracking-wider text-neutral-400 uppercase">
            Redirecting to login...
          </span>
        </div>
      </div>
    );
  }

  // Logged in user must change password
  if (user.mustChangePassword) {
    if (pathname === '/change-password') {
      return (
        <main className="min-h-screen w-full bg-[var(--background)] text-[var(--foreground)] flex flex-col">
          {children}
        </main>
      );
    }

    return (
      <div className="min-h-screen w-full bg-[var(--background)] text-[var(--foreground)] flex flex-col items-center justify-center">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping"></span>
          <span className="text-xs font-heading font-medium tracking-wider text-neutral-400 uppercase">
            Redirecting to password setup...
          </span>
        </div>
      </div>
    );
  }

  // Authenticated workspace
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[var(--background)] text-[var(--foreground)]">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-[var(--background)] text-[var(--foreground)]">
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
};
