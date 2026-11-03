'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  HelpCircle,
  X,
} from 'lucide-react';

export type AlertType = 'info' | 'success' | 'warning' | 'error' | 'confirm';

export interface AlertOptions {
  title?: string;
  type?: AlertType;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface AlertState extends AlertOptions {
  isOpen: boolean;
  message: string;
}

interface AlertContextValue {
  showAlert: (message: string, options?: AlertOptions) => void;
  showConfirm: (
    message: string,
    onConfirm: () => void,
    options?: Omit<AlertOptions, 'onConfirm' | 'type'>
  ) => void;
  closeAlert: () => void;
}

const AlertContext = createContext<AlertContextValue>({
  showAlert: () => {},
  showConfirm: () => {},
  closeAlert: () => {},
});

export const useAlert = () => useContext(AlertContext);

const TYPE_CONFIG = {
  error: {
    icon: AlertCircle,
    color: 'text-rose-400',
    bg: 'bg-rose-500/10 border-rose-500/20',
    badge: 'border-rose-500/30 text-rose-300 bg-rose-500/10',
    defaultTitle: 'Action Failed',
    buttonClass: 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950/40',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
    badge: 'border-amber-500/30 text-amber-300 bg-amber-500/10',
    defaultTitle: 'Attention',
    buttonClass: 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-950/40',
  },
  success: {
    icon: CheckCircle2,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    badge: 'border-emerald-500/30 text-emerald-300 bg-emerald-500/10',
    defaultTitle: 'Success',
    buttonClass: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/40',
  },
  info: {
    icon: Info,
    color: 'text-teal-400',
    bg: 'bg-teal-500/10 border-teal-500/20',
    badge: 'border-teal-500/30 text-teal-300 bg-teal-500/10',
    defaultTitle: 'Notification',
    buttonClass: 'bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-950/40',
  },
  confirm: {
    icon: HelpCircle,
    color: 'text-teal-400',
    bg: 'bg-teal-500/10 border-teal-500/20',
    badge: 'border-teal-500/30 text-teal-300 bg-teal-500/10',
    defaultTitle: 'Confirmation Required',
    buttonClass: 'bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-950/40',
  },
};

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AlertState>({
    isOpen: false,
    message: '',
    type: 'info',
  });

  const closeAlert = useCallback(() => {
    setState((prev) => {
      if (prev.onCancel) {
        try {
          prev.onCancel();
        } catch (e) {
          console.error(e);
        }
      }
      return { ...prev, isOpen: false };
    });
  }, []);

  const handleConfirm = useCallback(() => {
    const cb = state.onConfirm;
    setState((prev) => ({ ...prev, isOpen: false }));
    if (cb) {
      try {
        cb();
      } catch (e) {
        console.error(e);
      }
    }
  }, [state.onConfirm]);

  const showAlert = useCallback((message: string, options?: AlertOptions) => {
    let type = options?.type;
    let title = options?.title;

    if (!type) {
      const lower = (message || '').toLowerCase();
      if (lower.includes('failed') || lower.includes('error') || lower.includes('could not') || lower.includes('cannot')) {
        type = 'error';
      } else if (lower.includes('please') || lower.includes('warning') || lower.includes('required') || lower.includes('select a')) {
        type = 'warning';
      } else if (lower.includes('success') || lower.includes('saved') || lower.includes('synchronized') || lower.includes('updated')) {
        type = 'success';
      } else {
        type = 'info';
      }
    }

    if (!title) {
      title = TYPE_CONFIG[type]?.defaultTitle || 'Notification';
    }

    setState({
      isOpen: true,
      message,
      type,
      title,
      confirmText: options?.confirmText || 'OK',
      cancelText: options?.cancelText,
      isDestructive: options?.isDestructive || false,
      onConfirm: options?.onConfirm,
      onCancel: options?.onCancel,
    });
  }, []);

  const showConfirm = useCallback(
    (
      message: string,
      onConfirm: () => void,
      options?: Omit<AlertOptions, 'onConfirm' | 'type'>
    ) => {
      setState({
        isOpen: true,
        message,
        type: 'confirm',
        title: options?.title || 'Are you sure?',
        confirmText: options?.confirmText || (options?.isDestructive ? 'Delete' : 'Confirm'),
        cancelText: options?.cancelText || 'Cancel',
        isDestructive: options?.isDestructive ?? true,
        onConfirm,
        onCancel: options?.onCancel,
      });
    },
    []
  );

  // Intercept window.alert globally on the client side
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const originalAlert = window.alert;

    window.alert = (msg?: any) => {
      showAlert(String(msg ?? ''));
    };

    return () => {
      window.alert = originalAlert;
    };
  }, [showAlert]);

  // Handle ESC and body scrolling
  useEffect(() => {
    if (!state.isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeAlert();
      } else if (e.key === 'Enter') {
        handleConfirm();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [state.isOpen, closeAlert, handleConfirm]);

  const config = TYPE_CONFIG[state.type || 'info'];
  const IconComponent =
    state.type === 'confirm' && state.isDestructive
      ? AlertTriangle
      : config.icon;

  const confirmBtnStyle =
    state.type === 'confirm' && state.isDestructive
      ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950/40'
      : config.buttonClass;

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm, closeAlert }}>
      {children}

      {/* GLOBAL POPUP MODAL */}
      {state.isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={closeAlert}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm sm:max-w-md bg-[#131313] border border-[#262626] rounded-3xl sm:rounded-2xl shadow-2xl p-5 sm:p-6 overflow-hidden animate-scale-in text-white space-y-4"
          >
            {/* Mobile Drag Indicator */}
            <div className="w-10 h-1 rounded-full bg-neutral-700 mx-auto -mt-1 mb-1 sm:hidden" />

            {/* Header with Type Icon & Title */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center border shrink-0 ${
                    state.type === 'confirm' && state.isDestructive
                      ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                      : config.bg + ' ' + config.color
                  }`}
                >
                  <IconComponent className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-sm sm:text-base text-white tracking-tight">
                    {state.title}
                  </h3>
                  <span
                    className={`inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border mt-0.5 ${
                      state.type === 'confirm' && state.isDestructive
                        ? 'border-rose-500/30 text-rose-300 bg-rose-500/10'
                        : config.badge
                    }`}
                  >
                    {state.type === 'confirm'
                      ? state.isDestructive
                        ? 'Warning'
                        : 'Confirm'
                      : state.type}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={closeAlert}
                className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-[#202020] transition shrink-0"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Message Body */}
            <div className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-h-60 overflow-y-auto custom-scrollbar pr-1 bg-[#181818] p-3.5 rounded-2xl border border-[#232323]">
              {state.message}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-1">
              {state.type === 'confirm' ? (
                <>
                  <button
                    type="button"
                    onClick={closeAlert}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#202020] hover:bg-[#282828] active:bg-[#303030] text-neutral-300 hover:text-white text-xs font-semibold border border-[#2e2e2e] transition"
                  >
                    {state.cancelText || 'Cancel'}
                  </button>
                  <button
                    type="button"
                    autoFocus
                    onClick={handleConfirm}
                    className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-semibold transition ${confirmBtnStyle}`}
                  >
                    {state.confirmText || (state.isDestructive ? 'Delete' : 'Confirm')}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  autoFocus
                  onClick={handleConfirm}
                  className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-semibold transition ${confirmBtnStyle}`}
                >
                  {state.confirmText || 'Got it'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </AlertContext.Provider>
  );
};
