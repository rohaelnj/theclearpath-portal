'use client';

import type { ReactElement } from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type NavItem = {
  label: string;
  href: string;
  external?: boolean;
};

type MainNavProps = {
  authed: boolean;
  ctaHref: string;
  ctaLabel: string;
};

const EXTERNAL_MAIN_SITE = 'https://theclearpath.ae';

export default function MainNav({ authed, ctaHref, ctaLabel }: MainNavProps): ReactElement {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const links: NavItem[] = authed
    ? [
        { label: 'Portal home', href: '/portal' },
        { label: 'Plans', href: '/plans' },
        { label: 'Main site', href: EXTERNAL_MAIN_SITE, external: true },
      ]
    : [
        { label: 'Plans', href: '/plans' },
        { label: 'Intake', href: '/intake' },
        { label: 'Main site', href: EXTERNAL_MAIN_SITE, external: true },
      ];

  return (
    <div className="relative flex items-center gap-4">
      <nav aria-label="Primary" className="hidden items-center gap-6 text-base md:flex">
        {links.map((item) =>
          item.external ? (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary transition hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {item.label}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          ) : (
            <Link
              key={item.label}
              href={item.href}
              className="text-primary transition hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {item.label}
            </Link>
          ),
        )}
        <Link
          href={ctaHref}
          className="rounded-full bg-primary px-5 py-2 font-semibold text-white transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {ctaLabel}
        </Link>
      </nav>

      <button
        type="button"
        className="inline-flex items-center justify-center rounded-md bg-surface2 p-2 text-primary transition hover:bg-surface2/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:hidden"
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="sr-only">Toggle navigation</span>
        <svg
          aria-hidden="true"
          className="h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {open ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {open ? (
        <div
          id="mobile-nav"
          className="absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl border border-neutral-200 bg-white p-4 shadow-lg md:hidden"
        >
          <nav aria-label="Mobile primary navigation" className="flex flex-col gap-3 text-base">
            {links.map((item) =>
              item.external ? (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary transition hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  {item.label}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-primary transition hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  {item.label}
                </Link>
              ),
            )}
            <Link
              href={ctaHref}
              className="rounded-full bg-primary px-5 py-2 text-center font-semibold text-white transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {ctaLabel}
            </Link>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
