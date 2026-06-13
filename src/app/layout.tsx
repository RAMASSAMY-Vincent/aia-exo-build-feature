import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  title: 'Analyse Google Reviews — AIA',
  description: 'Upload ton export Takeout et obtiens ta note moyenne.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={inter.variable}>
      <body className="bg-cloud-canvas text-ink-black antialiased">{children}</body>
    </html>
  );
}
