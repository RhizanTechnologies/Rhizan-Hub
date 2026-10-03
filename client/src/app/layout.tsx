import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { AppShell } from '@/components/AppShell';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

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
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem('rhizan_app_theme');
                if (t) document.documentElement.setAttribute('data-theme', t);
                var f = localStorage.getItem('rhizan_app_font');
                if (f) document.documentElement.setAttribute('data-font', f);
                if (t === 'clean-light') {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.classList.add('light');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${outfit.variable} bg-[#0a0a0a] text-neutral-100 min-h-screen antialiased`}
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
