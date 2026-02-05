import type { Metadata } from 'next';
import { Providers } from './providers';
import './globals.css';

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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
