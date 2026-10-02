'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg max-h-[92vh] flex flex-col bg-[#121212] border border-[#262626] rounded-2xl shadow-2xl p-4 sm:p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-[#222222] shrink-0">
          <h3 className="font-heading text-sm sm:text-base font-bold text-white truncate pr-2">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-[#1f1f1f] transition shrink-0"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content Container */}
        <div className="mt-4 flex-1 overflow-y-auto pr-0.5 custom-scrollbar">{children}</div>
      </div>
    </div>
  );
};
