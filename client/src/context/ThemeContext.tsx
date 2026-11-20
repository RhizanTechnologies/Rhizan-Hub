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
  surfaceHex: string;
  borderHex: string;
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
    id: 'clean-light',
    name: 'Clean Light Slate',
    tagline: 'High-clarity, luminous workspace with crisp cards, soft slate borders, and jewel emerald accents',
    accentColor: '#0d9488',
    bgHex: '#f8fafc',
    cardHex: '#ffffff',
    surfaceHex: '#ffffff',
    borderHex: '#e2e8f0',
    isDark: false,
  },
  {
    id: 'rhizan-dark',
    name: 'Rhizan Dark (Soft Slate)',
    tagline: 'Signature modern dark slate with reduced glare and luminous emerald teal accents',
    accentColor: '#14b8a6',
    bgHex: '#0b0f17',
    cardHex: '#151d2a',
    surfaceHex: '#101724',
    borderHex: '#222e42',
    isDark: true,
  },
  {
    id: 'midnight-navy',
    name: 'Midnight Navy',
    tagline: 'Deep oceanic abyssal navy blue with electric sapphire & glacier cyan highlights',
    accentColor: '#0ea5e9',
    bgHex: '#060b14',
    cardHex: '#0f1c34',
    surfaceHex: '#0a1222',
    borderHex: '#1b3258',
    isDark: true,
  },
  {
    id: 'cyber-violet',
    name: 'Cyberpunk Violet',
    tagline: 'Cosmic midnight amethyst void with vibrant neon violet & radiant lavender glow',
    accentColor: '#a855f7',
    bgHex: '#0b0616',
    cardHex: '#1a1032',
    surfaceHex: '#120a22',
    borderHex: '#34205e',
    isDark: true,
  },
  {
    id: 'emerald-forest',
    name: 'Emerald Forest',
    tagline: 'Botanical pine obsidian with radiant mint jade & alpine emerald accents',
    accentColor: '#10b981',
    bgHex: '#050f09',
    cardHex: '#0e2619',
    surfaceHex: '#091910',
    borderHex: '#1c4b32',
    isDark: true,
  },
  {
    id: 'warm-amber',
    name: 'Sunset Amber',
    tagline: 'Deep roasted espresso bronze with incandescent honey gold & warm amber tones',
    accentColor: '#f59e0b',
    bgHex: '#0d0906',
    cardHex: '#1f1610',
    surfaceHex: '#150f0a',
    borderHex: '#3e2c20',
    isDark: true,
  },
  {
    id: 'monochrome',
    name: 'Pure Obsidian',
    tagline: 'Minimalist titanium carbon with precision diamond silver contrasts',
    accentColor: '#f4f4f5',
    bgHex: '#09090b',
    cardHex: '#17171c',
    surfaceHex: '#101013',
    borderHex: '#2d2d36',
    isDark: true,
  },
];

export const FONTS_LIST: FontOption[] = [
  {
    id: 'inter',
    name: 'Inter (Light & Crisp)',
    family: 'Inter, sans-serif',
    category: 'Neo-grotesque Sans',
    description: 'Clean, thin, ultra-legible typography designed for complex data, dashboards, and long reading',
    previewFontClass: 'font-sans',
  },
  {
    id: 'plus-jakarta',
    name: 'Plus Jakarta Sans (Airy)',
    family: 'Plus Jakarta Sans, sans-serif',
    category: 'Modern Contemporary',
    description: 'Sophisticated, light, premium tech typography tailored for enterprise software',
    previewFontClass: 'font-jakarta',
  },
  {
    id: 'outfit',
    name: 'Outfit (Modern Display)',
    family: 'Outfit, sans-serif',
    category: 'Geometric Display',
    description: 'Modern, balanced geometric brand typography with friendly curves and clean structure',
    previewFontClass: 'font-outfit',
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
  isLight: boolean;
  setTheme: (theme: AppTheme) => void;
  setFont: (font: AppFont) => void;
  toggleColorMode: () => void;
  themesList: ThemeOption[];
  fontsList: FontOption[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'rhizan_app_theme';
const FONT_STORAGE_KEY = 'rhizan_app_font';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<AppTheme>('clean-light');
  const [font, setFontState] = useState<AppFont>('inter');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Read from localStorage on mount
    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as AppTheme | null;
      const savedFont = localStorage.getItem(FONT_STORAGE_KEY) as AppFont | null;

      const activeTheme = savedTheme && THEMES_LIST.some((t) => t.id === savedTheme) ? savedTheme : 'clean-light';
      setThemeState(activeTheme);
      document.documentElement.setAttribute('data-theme', activeTheme);
      if (activeTheme === 'clean-light') {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      } else {
        document.documentElement.classList.remove('light');
        document.documentElement.classList.add('dark');
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

  const toggleColorMode = () => {
    if (theme === 'clean-light') {
      setTheme('rhizan-dark');
    } else {
      setTheme('clean-light');
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
        isLight: theme === 'clean-light',
        setTheme,
        setFont,
        toggleColorMode,
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
