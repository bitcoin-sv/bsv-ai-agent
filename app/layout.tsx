import type { Metadata, Viewport } from 'next';
import { Inter as FontSans } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/theme-provider';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Sidebar } from '@/components/sidebar';
import { Toaster } from '@/components/ui/sonner';
import { AppStateProvider } from '@/lib/utils/app-state';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

const title = 'BSV AI Agent';
const description =
  'The BSV AI Agent abstracts the complexity of blockchain transactions and empowers users to perform a wide array of on-chain activities using simple, intuitive prompts.';

export const metadata: Metadata = {
  metadataBase: new URL('https://bsv-ai.vercel.app/'),
  title,
  description,
  openGraph: {
    title,
    description,
  },
  twitter: {
    title,
    description,
    card: 'summary_large_image',
    creator: '@miiura',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn('font-sans antialiased', fontSans.variable)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppStateProvider>
            <Header />
            {children}
            <Sidebar />
            <Footer />
            <Toaster />
          </AppStateProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
