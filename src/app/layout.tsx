import type { Metadata } from 'next';
import './globals.css';
import ReactQueryProvider from '@/providers/QueryProvider';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Toaster } from 'sonner';
import { Providers } from '@/providers/SessionProvider';

export const metadata: Metadata = {
  title: 'Afrozon AutoGlobal - Import Verified US Vehicles to Nigeria',
  description:
    'Afrozon AutoGlobal is your trusted partner for importing verified vehicles from the United States to Nigeria. We handle sourcing, inspection, shipping, and delivery.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <ReactQueryProvider>
            <Header />
            <main className="flex-1 overflow-y-auto bg-background">
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
