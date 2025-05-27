import Providers from '@/components/layout/providers';
import { Providers as NewProviders } from '@/providers';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { fontVariables } from '@/lib/font';
import ThemeProvider from '@/components/layout/ThemeToggle/theme-provider';
import { cn } from '@/lib/utils';
import type { Metadata, Viewport } from 'next';
import { cookies } from 'next/headers';
import NextTopLoader from 'nextjs-toploader';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import SessionContext from '@/context/ClientSideAuthContext';
import './globals.css';
import './theme.css';
import SessionWrapper from '@/context/SessionWrapper';
import { ActiveThemeProvider } from '@/components/active-theme';

const META_THEME_COLORS = {
  light: '#ffffff',
  dark: '#09090b'
};

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Chuolink Portal',
  description: 'Search, Discover, Apply'
};

export const viewport: Viewport = {
  themeColor: META_THEME_COLORS.light
};

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const activeThemeValue = cookieStore.get('active_theme')?.value;
  const isScaled = activeThemeValue?.endsWith('-scaled');

  return (
    <html lang='en' suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || ((!('theme' in localStorage) || localStorage.theme === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.querySelector('meta[name="theme-color"]').setAttribute('content', '${META_THEME_COLORS.dark}')
                }
              } catch (_) {}
            `
          }}
        />
      </head>
      <body
        className={cn(
          'bg-background overflow-hidden overscroll-none font-sans antialiased',
          activeThemeValue ? `theme-${activeThemeValue}` : '',
          isScaled ? 'theme-scaled' : '',
          fontVariables,
          inter.className
        )}
      >
        <NextTopLoader showSpinner={false} />
        <NuqsAdapter>
          <ThemeProvider
            attribute='class'
            defaultTheme='system'
            enableSystem
            disableTransitionOnChange
            enableColorScheme
          >
            <SessionContext>
              <SessionWrapper>
                <NewProviders>
                  <Toaster />
                  <ActiveThemeProvider>{children}</ActiveThemeProvider>
                </NewProviders>
              </SessionWrapper>
            </SessionContext>
          </ThemeProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
