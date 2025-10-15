import type { ReactElement } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Route } from 'next';

const year = new Date().getFullYear();

export default function Footer(): ReactElement {
  return (
    <footer className="mt-16 w-full border-t border-black/5 bg-surface2">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-6 px-6 py-16 text-lg">
        <Image src="/logo.png" alt="Clear Path" width={200} height={55} className="h-14 w-auto" priority />
        <p className="text-black/70">© {year} The Clear Path.</p>
        <div className="flex gap-8">
          <Link href="/legal/privacy-policy" className="text-primary transition hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
            Privacy
          </Link>
          <Link href={'/support' as Route} className="text-primary transition hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
