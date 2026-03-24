import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { buildAbsoluteUrl, siteConfig } from '@/lib/site/config';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: siteConfig.name,
  description: siteConfig.description,
  applicationName: siteConfig.name,
  openGraph: {
    siteName: siteConfig.name,
    locale: siteConfig.ogLocale,
    type: 'website',
    url: buildAbsoluteUrl('/'),
    title: siteConfig.name,
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.defaultOpenGraphImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: siteConfig.socialHandle,
    creator: siteConfig.socialHandle,
    images: [siteConfig.defaultOpenGraphImage],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang={siteConfig.htmlLang}>
      <body>
        <div className="site-shell">{children}</div>
      </body>
    </html>
  );
}
