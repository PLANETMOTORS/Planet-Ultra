import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { getSiteUrl } from '@/lib/seo/routes';

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: 'Planet Motors',
    template: '%s | Planet Motors',
  },
  description: 'Used vehicle inventory, VDP, and purchase journey for Planet Motors.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="site-shell">{children}</div>
      </body>
    </html>
  );
}
