'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';

export interface CustomSelectOption {
  value: string | number | undefined | null;
  label: string;
  sublabel?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  group?: string;
}

export interface CustomSelectProps {
  value: string | number | undefined | null;
  onChange: (value: any) => void;
  options: CustomSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  dropdownClassName?: string;
  searchable?: boolean;
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  required?: boolean;
  id?: string;
  name?: string;
  align?: 'left' | 'right';
  title?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  disabled = false,
  className = '',
  dropdownClassName = '',
  searchable,
  icon,
  size = 'md',
  id,
  name,
  align = 'left',
  title,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [openUpwards, setOpenUpwards] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Automatically enable search if there are more than 7 options unless explicitly specified
  const isSearchable = searchable !== undefined ? searchable : options.length > 7;

  // Selected Option finding
  const selectedOption = useMemo(() => {
    return options.find((opt) => String(opt.value ?? '') === String(value ?? ''));
  }, [options, value]);

  // Close when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isOpen]);

  // Detect available space below vs above to open upwards if near bottom
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      // If less than 240px below and more space above, open upwards
      if (spaceBelow < 250 && spaceAbove > spaceBelow) {
        setOpenUpwards(true);
      } else {
        setOpenUpwards(false);
      }

      if (isSearchable && searchInputRef.current) {
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
    }
  }, [isOpen, isSearchable]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchQuery('');
      triggerRef.current?.focus();
    } else if (e.key === 'Enter' || e.key === ' ') {
      if (!isOpen) {
        e.preventDefault();
        setIsOpen(true);
      }
    } else if (e.key === 'ArrowDown') {
      if (!isOpen) {
        e.preventDefault();
        setIsOpen(true);
      }
    }
  };

  // Filter options by search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const q = searchQuery.toLowerCase().trim();
    return options.filter((opt) => {
      const matchLabel = opt.label.toLowerCase().includes(q);
      const matchSublabel = opt.sublabel?.toLowerCase().includes(q);
      const matchGroup = opt.group?.toLowerCase().includes(q);
      return matchLabel || matchSublabel || matchGroup;
    });
  }, [options, searchQuery]);

  // Group filtered options if any option has a group
  const groupedOptions = useMemo(() => {
    const hasGroups = filteredOptions.some((opt) => !!opt.group);
    if (!hasGroups) return null;

    const groups: { [key: string]: CustomSelectOption[] } = {};
    filteredOptions.forEach((opt) => {
      const gName = opt.group || '';
      if (!groups[gName]) groups[gName] = [];
      groups[gName].push(opt);
    });
    return groups;
  }, [filteredOptions]);

  // Size specific styles
  const sizeStyles = {
    sm: 'text-[11px] py-1.5 px-2.5 rounded-lg gap-1.5',
    md: 'text-xs py-2 px-3 rounded-xl gap-2',
    lg: 'text-xs sm:text-sm py-2.5 px-3.5 rounded-xl gap-2.5',
  }[size];

  return (
    <div
      ref={containerRef}
      className="relative w-full text-left inline-block"
      onKeyDown={handleKeyDown}
      title={title}
    >
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        id={id}
        name={name}
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setIsOpen((prev) => !prev);
            if (isOpen) setSearchQuery('');
          }
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full flex items-center justify-between border transition-all select-none outline-none font-medium ${sizeStyles} ${
          disabled
            ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-[#141414] border-slate-200 dark:border-[#222222] text-slate-400 dark:text-neutral-500'
            : isOpen
            ? 'border-teal-500/80 bg-white dark:bg-[#161616] text-slate-900 dark:text-white shadow-lg shadow-teal-500/10 ring-1 ring-teal-500/30'
            : 'border-slate-200 dark:border-[#262626] bg-white dark:bg-[#141414] hover:bg-slate-50 dark:hover:bg-[#181818] hover:border-slate-300 dark:hover:border-[#333333] text-slate-700 dark:text-neutral-200 cursor-pointer'
        } ${className}`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {icon && <span className="shrink-0 text-teal-600 dark:text-teal-400">{icon}</span>}
          {selectedOption?.icon && <span className="shrink-0">{selectedOption.icon}</span>}

          <span className={`truncate text-left block ${!selectedOption ? 'text-slate-400 dark:text-neutral-500' : 'text-slate-800 dark:text-neutral-100'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>

          {selectedOption?.sublabel && (
            <span className="text-[10px] text-slate-400 dark:text-neutral-400 font-normal truncate hidden sm:inline">
              ({selectedOption.sublabel})
            </span>
          )}
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 dark:text-neutral-400 shrink-0 transition-transform duration-200 ml-1.5 ${
            isOpen ? 'rotate-180 text-teal-600 dark:text-teal-400' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu Popup */}
      {isOpen && (
        <div
          role="listbox"
          tabIndex={-1}
          className={`absolute z-50 w-full min-w-[200px] bg-white dark:bg-[#141414] border border-slate-200 dark:border-[#2a2a2a] rounded-2xl shadow-2xl p-1.5 backdrop-blur-xl animate-fade-in ${
            openUpwards ? 'bottom-full mb-1.5 origin-bottom' : 'top-full mt-1.5 origin-top'
          } ${align === 'right' ? 'right-0' : 'left-0'} ${dropdownClassName}`}
          style={{ maxHeight: '280px' }}
        >
          {/* Search input inside dropdown if enabled */}
          {isSearchable && (
            <div className="p-1 pb-1.5 border-b border-slate-100 dark:border-[#222222] mb-1">
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-500 absolute left-2.5 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search options..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setIsOpen(false);
                    }
                  }}
                  className="w-full bg-slate-50 dark:bg-[#1c1c1c] border border-slate-200 dark:border-[#2e2e2e] focus:border-teal-500 rounded-xl pl-8 pr-7 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 outline-none transition"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 p-0.5 text-slate-400 hover:text-slate-700 dark:text-neutral-400 dark:hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="overflow-y-auto max-h-[220px] space-y-0.5 no-scrollbar py-0.5">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-400 dark:text-neutral-500">
                No matching options found
              </div>
            ) : groupedOptions ? (
              Object.entries(groupedOptions).map(([groupName, groupOpts]) => (
                <div key={groupName} className="space-y-0.5">
                  {groupName && (
                    <div className="px-2.5 py-1 text-[10px] font-bold text-slate-500 dark:text-neutral-500 uppercase tracking-wider bg-slate-100/70 dark:bg-[#101010]/50 rounded-md mt-1">
                      {groupName}
                    </div>
                  )}
                  {groupOpts.map((opt, optIdx) => {
                    const isSelected = String(opt.value ?? '') === String(value ?? '');
                    return (
                      <button
                        key={`${String(opt.value ?? '')}-${optIdx}`}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        disabled={opt.disabled}
                        onClick={() => {
                          if (!opt.disabled) {
                            onChange(opt.value);
                            setIsOpen(false);
                            setSearchQuery('');
                            triggerRef.current?.focus();
                          }
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition text-left cursor-pointer select-none ${
                          opt.disabled
                            ? 'opacity-30 cursor-not-allowed text-slate-400 dark:text-neutral-500'
                            : isSelected
                            ? 'bg-teal-500/10 text-teal-700 dark:text-teal-300 font-semibold border border-teal-500/30'
                            : 'text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-[#1f1f1f] hover:text-slate-900 dark:hover:text-white border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                          <span className="truncate">{opt.label}</span>
                          {opt.sublabel && (
                            <span className="text-[10px] text-slate-400 dark:text-neutral-400 font-normal truncate">
                              • {opt.sublabel}
                            </span>
                          )}
                        </div>

                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ))
            ) : (
              filteredOptions.map((opt, optIdx) => {
                const isSelected = String(opt.value ?? '') === String(value ?? '');
                return (
                  <button
                    key={`${String(opt.value ?? '')}-${optIdx}`}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    disabled={opt.disabled}
                    onClick={() => {
                      if (!opt.disabled) {
                        onChange(opt.value);
                        setIsOpen(false);
                        setSearchQuery('');
                        triggerRef.current?.focus();
                      }
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition text-left cursor-pointer select-none ${
                      opt.disabled
                        ? 'opacity-30 cursor-not-allowed text-slate-400 dark:text-neutral-500'
                        : isSelected
                        ? 'bg-teal-500/10 text-teal-700 dark:text-teal-300 font-semibold border border-teal-500/30'
                        : 'text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-[#1f1f1f] hover:text-slate-900 dark:hover:text-white border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                      <span className="truncate">{opt.label}</span>
                      {opt.sublabel && (
                        <span className="text-[10px] text-slate-400 dark:text-neutral-400 font-normal truncate">
                          • {opt.sublabel}
                        </span>
                      )}
                    </div>

                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0 ml-2" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
