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
    <html lang="en" className="bg-surface text-[17px] md:text-[18px]">
      <head suppressHydrationWarning>
        <meta
          name="description"
          content="Licensed UAE therapists. Confidential video sessions. Flexible scheduling with Clear Path."
        />
      </head>
      <body className="bg-surface font-sans text-neutral-900 antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 rounded bg-primary px-3 py-2 text-white"
        >
          Skip to content
        </a>
        <Header />
        <main id="main" role="main" className="min-h-screen flex flex-col">
          {children}
        </main>
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
