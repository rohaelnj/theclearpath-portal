// app/layout.tsx
import './globals.css';
import Link from 'next/link';
import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { BRAND } from '@/lib/brand';

export const metadata: Metadata = {
  title: 'The Clear Path',
  description: 'Therapy rooted in the UAE with licensed experts, private portal, and culturally aware care.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#DED4C8',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const year = new Date().getFullYear();

  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-[#1F4142] antialiased">
        <div className="flex min-h-screen flex-col">
          <main className="flex-1">{children}</main>
          <footer className="border-t border-[#1F4142]/10 bg-white/90">
            <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-6 py-6 text-sm text-[#1F4142]/80 md:flex-row">
              <div className="text-center md:text-left">
                © {year} {BRAND.name}. All rights reserved.
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link className="transition hover:text-[#1F4142]" href="/legal/refund-and-cancellation-policy">
                  Refund & Cancellation
                </Link>
                <Link className="transition hover:text-[#1F4142]" href="/legal/privacy-policy">
                  Privacy Policy
                </Link>
                <a className="transition hover:text-[#1F4142]" href={`mailto:${BRAND.supportEmail}`}>
                  support@theclearpath.ae
                </a>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
