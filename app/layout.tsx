import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Script from 'next/script';
import './globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

export const metadata: Metadata = {
  metadataBase: new URL('https://portal.theclearpath.ae'),
  title: 'The Clear Path — Discreet Online Therapy in Dubai & GCC',
  description:
    'Confidential, flexible, and affordable online therapy in Dubai and across the GCC. Licensed UAE therapists. Start your clear path.',
  keywords: [
    'online therapy dubai',
    'online counseling dubai',
    'therapist dubai',
    'psychologist dubai',
    'online therapy uae',
    'teletherapy uae',
    'couples therapy dubai',
    'anxiety therapy dubai',
    'depression therapy dubai',
    'cbt therapy dubai',
    'arabic therapist dubai',
    'affordable therapy dubai',
    'best therapist in dubai',
    'female therapist dubai',
    'teen therapy dubai',
    'virtual therapy dubai',
    'confidential therapy dubai',
    'marriage counseling dubai',
    'adhd assessment dubai online',
  ],
  alternates: { canonical: 'https://portal.theclearpath.ae' },
  openGraph: {
    title: 'The Clear Path — Discreet Online Therapy',
    description: 'Licensed UAE therapists. Confidential, flexible, online.',
    url: 'https://portal.theclearpath.ae',
    siteName: 'The Clear Path',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const gaId = process.env.NEXT_PUBLIC_GA4_ID;

  return (
    <html lang="en">
      <body className="bg-[#EDE6DC] text-[#1F4142] antialiased">
        <Header />
        <main className="mx-auto max-w-6xl px-4 py-8 md:py-12">{children}</main>
        <Footer />
        {gaId ? (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
            <Script
              id="ga4-init"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', '${gaId}', { anonymize_ip: true });`,
              }}
            />
          </>
        ) : null}
      </body>
    </html>
  );
}
