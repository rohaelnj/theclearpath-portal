import type { ReactElement } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const year = new Date().getFullYear();

export default function Footer(): ReactElement {
  return (
    <footer className="mt-16 w-full border-t border-black/5 bg-surface2">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-3 px-6 py-10">
        <Image src="/logo.png" alt="Clear Path" width={140} height={38} className="h-10 w-auto" priority />
        <div className="h-0.5 w-24 rounded-full bg-primary/70" />
        <p className="text-base text-black/70">© {year} The Clear Path.</p>
        <div className="flex gap-6 text-base">
          <Link href="/legal/privacy-policy" className="text-primary transition hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
            Privacy
          </Link>
          <Link href="/support" className="text-primary transition hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
