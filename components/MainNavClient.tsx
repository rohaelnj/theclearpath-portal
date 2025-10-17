'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { useState } from 'react';

type Props = { authed: boolean; role?: string | null };

export default function MainNavClient({ authed, role }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <header className="w-full border-b">
      <div className="mx-auto flex max-w-6xl items-center justify-between p-3">
        <Link href="/" className="font-semibold">
          TheClearPath
        </Link>

        <nav aria-label="Primary" className="hidden gap-6 md:flex">
          <Link href="/portal">Portal</Link>
          <Link href="/plans">Plans</Link>
          <a href="https://www.theclearpath.ae" target="_blank" rel="noopener noreferrer">
            Main site
          </a>
        </nav>

        <button
          className="md:hidden"
          aria-expanded={open}
          aria-controls="mnav"
          onClick={() => setOpen((v) => !v)}
        >
          Menu
        </button>

        <div className="hidden md:block">
          {authed ? (
            <Link href={role === 'therapist' ? ('/therapist' as Route) : ('/portal' as Route)}>Dashboard</Link>
          ) : (
            <Link href="/login">Sign in</Link>
          )}
        </div>
      </div>

      {open && (
        <div id="mnav" className="space-y-3 border-t p-3 md:hidden">
          <Link href="/portal">Portal</Link>
          <Link href="/plans">Plans</Link>
          <a href="https://www.theclearpath.ae" target="_blank" rel="noopener noreferrer">
            Main site
          </a>
          {authed ? (
            <Link href={role === 'therapist' ? ('/therapist' as Route) : ('/portal' as Route)}>Dashboard</Link>
          ) : (
            <Link href="/login">Sign in</Link>
          )}
        </div>
      )}
    </header>
  );
}
