import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { AppShell } from '@/components/AppShell';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});
const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'RHIZAN Hub | Operations Platform',
  description: 'Internal operations, tasks, projects, CRM pipeline, and time tracking for Rhizan Technologies.',
  icons: {
    icon: '/logo_minimal.png',
    apple: '/logo_minimal.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem('rhizan_app_theme') || 'clean-light';
                document.documentElement.setAttribute('data-theme', t);
                var f = localStorage.getItem('rhizan_app_font') || 'inter';
                document.documentElement.setAttribute('data-font', f);
                if (t === 'clean-light') {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.classList.add('light');
                } else {
                  document.documentElement.classList.remove('light');
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${outfit.variable} bg-[var(--background)] text-[var(--foreground)] min-h-screen antialiased font-normal selection:bg-teal-500/20`}
      >
        <AuthProvider>
          <ThemeProvider>
            <AppShell>
              {children}
            </AppShell>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
