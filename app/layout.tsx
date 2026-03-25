import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.planetmotors.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Planet Motors – Buy, Sell & Trade Vehicles Online',
    template: '%s | Planet Motors',
  },
  description:
    'Planet Motors is an OMVIC registered dealer in Ontario. Browse quality used vehicles, get a fast trade-in offer, and apply for financing online.',
  openGraph: {
    siteName: 'Planet Motors',
    type: 'website',
    locale: 'en_CA',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@planetmotors',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <div className="site-shell">{children}</div>
        </body>
      </html>
    </ClerkProvider>
  );
}
