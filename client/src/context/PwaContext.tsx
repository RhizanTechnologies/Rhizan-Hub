'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { Download, WifiOff, RefreshCw, X, CheckCircle2 } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface PwaContextType {
  isInstallable: boolean;
  isInstalled: boolean;
  isOffline: boolean;
  hasUpdate: boolean;
  installPwa: () => Promise<boolean>;
  applyUpdate: () => void;
  dismissInstallPrompt: () => void;
}

const PwaContext = createContext<PwaContextType>({
  isInstallable: false,
  isInstalled: false,
  isOffline: false,
  hasUpdate: false,
  installPwa: async () => false,
  applyUpdate: () => {},
  dismissInstallPrompt: () => {},
});

export const PwaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [hasUpdate, setHasUpdate] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  // Check standalone mode on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      // @ts-expect-error iOS Safari standalone check
      window.navigator.standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
    }

    setIsOffline(!window.navigator.onLine);

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Register Service Worker
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');

        // Check if there is already a waiting worker
        if (registration.waiting) {
          setWaitingWorker(registration.waiting);
          setHasUpdate(true);
        }

        // Listen for updates found
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setWaitingWorker(newWorker);
              setHasUpdate(true);
            }
          });
        });
      } catch (err) {
        console.warn('[PWA] Service worker registration error:', err);
      }
    };

    registerSW();

    // Listen for controller changes
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  }, []);

  // Listen for beforeinstallprompt
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);

      // Check if user previously dismissed prompt in this session
      const dismissed = sessionStorage.getItem('rhizan_pwa_install_dismissed');
      if (!dismissed) {
        setShowInstallBanner(true);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      setShowInstallBanner(false);
      setInstalledSuccess(true);
      setTimeout(() => setInstalledSuccess(false), 5000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installPwa = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) return false;

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstallable(false);
        setDeferredPrompt(null);
        setShowInstallBanner(false);
        return true;
      }
    } catch (err) {
      console.warn('[PWA] Install prompt error:', err);
    }
    return false;
  }, [deferredPrompt]);

  const dismissInstallPrompt = useCallback(() => {
    setShowInstallBanner(false);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('rhizan_pwa_install_dismissed', 'true');
    }
  }, []);

  const applyUpdate = useCallback(() => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
  }, [waitingWorker]);

  return (
    <PwaContext.Provider
      value={{
        isInstallable,
        isInstalled,
        isOffline,
        hasUpdate,
        installPwa,
        applyUpdate,
        dismissInstallPrompt,
      }}
    >
      {children}

      {/* Floating Offline Status Notification */}
      {isOffline && (
        <aside
          aria-label="Offline status notification"
          className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-medium text-xs shadow-xl shadow-amber-500/20 border border-amber-400 animate-in slide-in-from-bottom duration-300"
        >
          <WifiOff className="w-4 h-4 shrink-0 text-slate-950" />
          <span>Offline mode &bull; cached view active</span>
        </aside>
      )}

      {/* New Version Update Toast */}
      {hasUpdate && (
        <aside
          aria-label="App update available"
          className="fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#141414] text-white border border-[#2a2a2a] shadow-2xl animate-in slide-in-from-bottom duration-300 text-xs"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
            <span className="font-medium text-neutral-200">A new version is ready</span>
          </div>
          <button
            type="button"
            onClick={applyUpdate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-medium text-xs transition cursor-pointer shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reload</span>
          </button>
        </aside>
      )}

      {/* Success Notification on Install */}
      {installedSuccess && (
        <aside
          aria-label="App installed confirmation"
          className="fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-emerald-600 text-white text-xs font-medium shadow-2xl animate-in fade-in duration-300"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-100" />
          <span>RHIZAN Hub installed as desktop/mobile app!</span>
        </aside>
      )}

      {/* Sleek Bottom/Side Install Banner Prompt */}
      {showInstallBanner && !isInstalled && isInstallable && (
        <aside
          aria-label="Install RHIZAN Hub app prompt"
          className="fixed bottom-5 right-5 z-50 max-w-sm w-[calc(100vw-2.5rem)] rounded-2xl bg-[var(--surface-card)] border border-[var(--border)] shadow-2xl p-4 flex flex-col gap-3 animate-in slide-in-from-bottom-5 duration-300"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white p-1.5 flex items-center justify-center shadow-md border border-[#e2e8f0] shrink-0">
                <Image
                  src="/logo_minimal.png"
                  alt="RHIZAN Hub"
                  width={28}
                  height={28}
                  className="object-contain"
                />
              </div>
              <div className="min-w-0">
                <h4 className="font-heading font-semibold text-xs text-[var(--foreground)] truncate">
                  Install RHIZAN Hub
                </h4>
                <p className="text-[11px] text-[var(--muted)] line-clamp-1">
                  Fast access, works offline &amp; native desktop/mobile experience.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={dismissInstallPrompt}
              className="p-1 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-elevated)] transition shrink-0 cursor-pointer"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={installPwa}
              className="flex-1 flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-medium text-xs shadow-md shadow-teal-700/20 active:scale-[0.98] transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install App</span>
            </button>
            <button
              type="button"
              onClick={dismissInstallPrompt}
              className="px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] hover:bg-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] text-xs font-medium transition cursor-pointer"
            >
              Not now
            </button>
          </div>
        </aside>
      )}
    </PwaContext.Provider>
  );
};

export const usePwa = () => useContext(PwaContext);
