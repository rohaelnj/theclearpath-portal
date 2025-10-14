'use client';

import Link from 'next/link';
import Logo from './Logo';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-[#EDE6DC]/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="h-7 w-auto" />
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          <Link href="/plans" className="hidden text-[#1F4142] transition hover:opacity-80 md:inline">
            Plans
          </Link>
          <Link href="/login" className="text-[#1F4142] transition hover:opacity-80">
            Log in
          </Link>
          <Link href="/signup" className="rounded-full bg-[#1F4142] px-4 py-2 font-medium text-white transition hover:opacity-90">
            Get started
          </Link>
        </nav>
      </div>
    </header>
  );
}
