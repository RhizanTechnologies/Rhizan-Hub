'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { useTheme, THEMES_LIST, FONTS_LIST, AppTheme, AppFont } from '@/context/ThemeContext';
import {
  Palette,
  Type,
  Check,
  Sparkles,
  RotateCcw,
  Sun,
  Moon,
  Laptop,
  CheckCircle2,
  Sliders,
  FolderKanban,
  Clock,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const { theme, setTheme, font, setFont, themesList, fontsList } = useTheme();
  const [sampleText, setSampleText] = useState('Rhizan Operations Platform 2026 • 48h Weekly Sprints');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleSelectTheme = (tId: AppTheme) => {
    setTheme(tId);
    const chosen = themesList.find((t) => t.id === tId);
    showToast(`🎨 Theme changed to "${chosen?.name}"`);
  };

  const handleSelectFont = (fId: AppFont) => {
    setFont(fId);
    const chosen = fontsList.find((f) => f.id === fId);
    showToast(`🔤 Font changed to "${chosen?.name}"`);
  };

  const handleResetDefaults = () => {
    setTheme('rhizan-dark');
    setFont('inter');
    showToast('✨ Appearance reset to Rhizan Dark & Inter');
  };

  const currentTheme = themesList.find((t) => t.id === theme) || themesList[0];
  const currentFont = fontsList.find((f) => f.id === font) || fontsList[0];

  return (
    <div className="flex-1 flex flex-col min-w-0 pb-16">
      <Header
        title="Settings & Appearance"
        subtitle="Customize theme colors, fonts, and visual experience across Rhizan Hub"
      />

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-2xl bg-neutral-900 border border-neutral-700 text-white text-xs font-semibold shadow-2xl animate-in fade-in slide-in-from-bottom-3 duration-200 flex items-center gap-2">
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Top Control Bar with Quick Reset */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-3xl bg-[#111111] border border-[#222222]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Personalized Workspace</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 font-bold">
                  Active
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Preferences are automatically saved to your browser and sync across all pages
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-3.5 py-2 rounded-xl bg-[#181818] hover:bg-[#222222] text-neutral-300 hover:text-white border border-[#282828] text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Defaults</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 1: THEME PICKER                                                   */}
        {/* ========================================================================= */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#222222]">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-teal-400" />
              <h3 className="font-heading text-base font-bold text-white">Color Themes</h3>
              <span className="text-xs text-neutral-400 font-normal">({themesList.length} options)</span>
            </div>
            <div className="text-xs text-neutral-400">
              Active: <strong className="text-white">{currentTheme.name}</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {themesList.map((t) => {
              const isSelected = theme === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleSelectTheme(t.id)}
                  className={`text-left p-4 rounded-2xl border transition-all duration-200 relative group flex flex-col justify-between h-44 ${
                    isSelected
                      ? 'border-teal-400 ring-2 ring-teal-500/30 shadow-xl'
                      : 'border-[#262626] hover:border-[#383838]'
                  }`}
                  style={{
                    backgroundColor: t.bgHex,
                  }}
                >
                  {/* Selected Badge */}
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-teal-500 text-white flex items-center justify-center shadow-md">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}

                  {/* Header */}
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: t.accentColor }}
                      />
                      <span
                        className={`text-xs font-bold truncate ${
                          t.isDark ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        {t.name}
                      </span>
                    </div>

                    <p
                      className={`text-[11px] leading-relaxed line-clamp-2 ${
                        t.isDark ? 'text-neutral-400' : 'text-slate-600'
                      }`}
                    >
                      {t.tagline}
                    </p>
                  </div>

                  {/* Mock Card Preview */}
                  <div
                    className="p-2.5 rounded-xl border space-y-1.5"
                    style={{
                      backgroundColor: t.cardHex,
                      borderColor: t.isDark ? '#2e2e2e' : '#e2e8f0',
                    }}
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className={t.isDark ? 'text-neutral-400' : 'text-slate-600'}>Preview Card</span>
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: t.accentColor }}
                      />
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-black/20 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ backgroundColor: t.accentColor, width: '65%' }}
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 2: FONT SELECTOR                                                  */}
        {/* ========================================================================= */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#222222]">
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4 text-teal-400" />
              <h3 className="font-heading text-base font-bold text-white">Typography & Fonts</h3>
              <span className="text-xs text-neutral-400 font-normal">({fontsList.length} fonts)</span>
            </div>
            <div className="text-xs text-neutral-400">
              Active: <strong className="text-white">{currentFont.name}</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fontsList.map((f) => {
              const isSelected = font === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => handleSelectFont(f.id)}
                  className={`text-left p-4 rounded-2xl bg-[#141414] border transition-all duration-200 relative group flex flex-col justify-between ${
                    isSelected
                      ? 'border-teal-400 ring-2 ring-teal-500/30 shadow-xl'
                      : 'border-[#262626] hover:border-[#383838]'
                  }`}
                >
                  {/* Selected Badge */}
                  {isSelected && (
                    <div className="absolute top-3.5 right-3.5 w-6 h-6 rounded-full bg-teal-500 text-white flex items-center justify-center shadow-md">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}

                  <div className="space-y-1 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{f.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1e1e1e] text-neutral-400 border border-[#2a2a2a]">
                        {f.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      {f.description}
                    </p>
                  </div>

                  {/* Font Specimen Box */}
                  <div className="p-3 rounded-xl bg-[#0e0e0e] border border-[#242424] space-y-1">
                    <span className="text-[10px] text-neutral-500 font-mono block uppercase">
                      Specimen Preview:
                    </span>
                    <div className="text-xs font-semibold text-neutral-200 truncate">
                      {sampleText}
                    </div>
                    <div className="text-[11px] text-neutral-400">
                      0123456789 • ABCDEFGHIJKLMNOPQRSTUVWXYZ
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 3: LIVE PLAYGROUND PREVIEW                                        */}
        {/* ========================================================================= */}
        <div className="bg-[#111111] border border-[#222222] rounded-3xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#222222]">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <h3 className="font-heading text-sm sm:text-base font-bold text-white">
                Live Component Preview
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-lg border border-teal-500/20">
              {currentTheme.name} • {currentFont.name}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Live Interactive Typography Input */}
            <div className="p-4 rounded-2xl bg-[#161616] border border-[#262626] space-y-2">
              <span className="text-xs font-bold text-white block">Test Typography String:</span>
              <input
                type="text"
                value={sampleText}
                onChange={(e) => setSampleText(e.target.value)}
                placeholder="Type custom text to preview font..."
                className="w-full px-3 py-2 bg-[#101010] border border-[#2a2a2a] rounded-xl text-xs text-white focus:border-teal-500 outline-none transition"
              />
              <p className="text-[10px] text-neutral-500">
                Type here to see how your chosen font renders custom text
              </p>
            </div>

            {/* Card 2: Mock KPI Metric */}
            <div className="p-4 rounded-2xl bg-[#161616] border border-[#262626] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400">Weekly Team Capacity</span>
                <Clock className="w-4 h-4 text-teal-400" />
              </div>
              <div className="my-2">
                <span className="text-xl font-bold text-white">48h Target</span>
                <div className="w-full bg-[#111111] h-2 rounded-full overflow-hidden mt-1.5 border border-[#282828]">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ backgroundColor: currentTheme.accentColor, width: '75%' }}
                  />
                </div>
              </div>
              <span className="text-[10px] text-neutral-400">6 working days × 8h per day</span>
            </div>

            {/* Card 3: Mock Quick Action Button */}
            <div className="p-4 rounded-2xl bg-[#161616] border border-[#262626] flex flex-col justify-between space-y-3">
              <div>
                <span className="text-xs font-bold text-white block">Interactive Buttons</span>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Styled with your active theme's primary accent
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  style={{ backgroundColor: currentTheme.accentColor }}
                  className="px-4 py-2 rounded-xl text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Primary Action</span>
                </button>
                <Link
                  href="/"
                  className="px-3.5 py-2 rounded-xl bg-[#181818] hover:bg-[#202020] text-neutral-300 text-xs font-semibold border border-[#282828] flex items-center gap-1 transition"
                >
                  <span>Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
