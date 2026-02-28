import type { Metadata } from 'next';
import { Sora, DM_Sans } from 'next/font/google';
import './globals.css';
import ReactQueryProvider from '@/providers/QueryProvider';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Toaster } from 'sonner';
import { Providers } from '@/providers/SessionProvider';

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Afrozon AutoGlobal - Import Verified US Vehicles to Nigeria',
  description:
    'Afrozon AutoGlobal is your trusted partner for importing verified vehicles from the United States to Nigeria. We handle sourcing, inspection, shipping, and delivery.',
  icons: {
    icon: '/logo_image.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sora.variable} ${dmSans.variable}`}>
      <body className={sora.className}>
        <Providers>
          <ReactQueryProvider>
            <Header />
            <main className="flex-1 min-h-0 bg-background">
              {children}
              <Toaster position='top-left' richColors />
            </main>
            <Footer />
          </ReactQueryProvider>
        </Providers>
      </body>
    </html>
  );
}
