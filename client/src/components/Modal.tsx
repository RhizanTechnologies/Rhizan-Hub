'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className={`relative w-full ${maxWidth} max-h-[92vh] sm:max-h-[88vh] flex flex-col bg-[#121212] border-t sm:border border-[#262626] rounded-t-3xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 pb-[calc(2rem+env(safe-area-inset-bottom,0px))] sm:pb-6 overflow-hidden`}>
        {/* Mobile drag handle indicator */}
        <div className="w-12 h-1 rounded-full bg-neutral-700 mx-auto mb-2.5 sm:hidden shrink-0" />
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-[#222222] shrink-0">
          <h3 className="font-heading text-sm sm:text-base font-bold text-white truncate pr-2">{title}</h3>
          <button
            onClick={onClose}
            className="min-w-[36px] min-h-[36px] p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-[#1f1f1f] transition shrink-0 flex items-center justify-center"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content Container with Generous Bottom Padding */}
        <div className="mt-4 flex-1 overflow-y-auto pr-1 pb-6 sm:pb-3 custom-scrollbar">{children}</div>
      </div>
    </div>
  );
};
