'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type AppTheme =
  | 'rhizan-dark'
  | 'midnight-navy'
  | 'cyber-violet'
  | 'emerald-forest'
  | 'warm-amber'
  | 'monochrome'
  | 'clean-light';

export type AppFont =
  | 'inter'
  | 'outfit'
  | 'plus-jakarta'
  | 'roboto'
  | 'jetbrains-mono';

export interface ThemeOption {
  id: AppTheme;
  name: string;
  tagline: string;
  accentColor: string;
  bgHex: string;
  cardHex: string;
  isDark: boolean;
}

export interface FontOption {
  id: AppFont;
  name: string;
  family: string;
  category: string;
  description: string;
  previewFontClass: string;
}

export const THEMES_LIST: ThemeOption[] = [
  {
    id: 'rhizan-dark',
    name: 'Rhizan Dark (Default)',
    tagline: 'Sleek obsidian charcoal with signature emerald teal accents',
    accentColor: '#0d9488',
    bgHex: '#0a0a0a',
    cardHex: '#161616',
    isDark: true,
  },
  {
    id: 'midnight-navy',
    name: 'Midnight Navy',
    tagline: 'Deep abyssal navy blue with electric cyan accents',
    accentColor: '#0284c7',
    bgHex: '#060b14',
    cardHex: '#0e1b30',
    isDark: true,
  },
  {
    id: 'cyber-violet',
    name: 'Cyberpunk Violet',
    tagline: 'Deep dark violet galaxy with vibrant neon purple accents',
    accentColor: '#9333ea',
    bgHex: '#0b0714',
    cardHex: '#18102e',
    isDark: true,
  },
  {
    id: 'emerald-forest',
    name: 'Emerald Forest',
    tagline: 'Deep pine obsidian with energetic natural emerald accents',
    accentColor: '#059669',
    bgHex: '#040d08',
    cardHex: '#0d2015',
    isDark: true,
  },
  {
    id: 'warm-amber',
    name: 'Sunset Amber',
    tagline: 'Deep roasted espresso with warm golden amber tones',
    accentColor: '#d97706',
    bgHex: '#0e0906',
    cardHex: '#201710',
    isDark: true,
  },
  {
    id: 'monochrome',
    name: 'Pure Obsidian',
    tagline: 'Minimalist true black with clean monochrome silver highlights',
    accentColor: '#e5e5e5',
    bgHex: '#000000',
    cardHex: '#141414',
    isDark: true,
  },
  {
    id: 'clean-light',
    name: 'Clean Light Slate',
    tagline: 'High-clarity light theme with crisp borders and deep teal accents',
    accentColor: '#0f766e',
    bgHex: '#f8fafc',
    cardHex: '#ffffff',
    isDark: false,
  },
];

export const FONTS_LIST: FontOption[] = [
  {
    id: 'inter',
    name: 'Inter',
    family: 'Inter, sans-serif',
    category: 'Neo-grotesque Sans',
    description: 'Clean, crisp, ultra-legible typography designed for computer screens',
    previewFontClass: 'font-sans',
  },
  {
    id: 'outfit',
    name: 'Outfit',
    family: 'Outfit, sans-serif',
    category: 'Geometric Display',
    description: 'Modern, balanced geometric brand typography with friendly curves',
    previewFontClass: 'font-outfit',
  },
  {
    id: 'plus-jakarta',
    name: 'Plus Jakarta Sans',
    family: 'Plus Jakarta Sans, sans-serif',
    category: 'Modern Contemporary',
    description: 'Sophisticated, premium tech typography tailored for enterprise software',
    previewFontClass: 'font-jakarta',
  },
  {
    id: 'roboto',
    name: 'Roboto',
    family: 'Roboto, sans-serif',
    category: 'Universal Sans',
    description: 'Google standard mechanical skeleton with friendly open curves',
    previewFontClass: 'font-roboto',
  },
  {
    id: 'jetbrains-mono',
    name: 'JetBrains Mono',
    family: 'JetBrains Mono, monospace',
    category: 'Developer Monospace',
    description: 'Precision engineering aesthetic optimized for data density and code',
    previewFontClass: 'font-mono',
  },
];

interface ThemeContextType {
  theme: AppTheme;
  font: AppFont;
  setTheme: (theme: AppTheme) => void;
  setFont: (font: AppFont) => void;
  themesList: ThemeOption[];
  fontsList: FontOption[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'rhizan_app_theme';
const FONT_STORAGE_KEY = 'rhizan_app_font';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<AppTheme>('rhizan-dark');
  const [font, setFontState] = useState<AppFont>('inter');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Read from localStorage on mount
    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as AppTheme | null;
      const savedFont = localStorage.getItem(FONT_STORAGE_KEY) as AppFont | null;

      if (savedTheme && THEMES_LIST.some((t) => t.id === savedTheme)) {
        setThemeState(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
      } else {
        document.documentElement.setAttribute('data-theme', 'rhizan-dark');
      }

      if (savedFont && FONTS_LIST.some((f) => f.id === savedFont)) {
        setFontState(savedFont);
        document.documentElement.setAttribute('data-font', savedFont);
      } else {
        document.documentElement.setAttribute('data-font', 'inter');
      }
    } catch (e) {
      console.error('Failed to load theme preference from localStorage', e);
    }
    setMounted(true);
  }, []);

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
      if (newTheme === 'clean-light') {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      } else {
        document.documentElement.classList.remove('light');
        document.documentElement.classList.add('dark');
      }
    } catch (e) {
      console.error('Failed to save theme to localStorage', e);
    }
  };

  const setFont = (newFont: AppFont) => {
    setFontState(newFont);
    try {
      localStorage.setItem(FONT_STORAGE_KEY, newFont);
      document.documentElement.setAttribute('data-font', newFont);
    } catch (e) {
      console.error('Failed to save font to localStorage', e);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        font,
        setTheme,
        setFont,
        themesList: THEMES_LIST,
        fontsList: FONTS_LIST,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
