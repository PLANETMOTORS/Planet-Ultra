import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Planet Motors',
  description: 'Planet-Ultra starter',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
