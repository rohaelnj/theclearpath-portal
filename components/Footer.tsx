import type { ReactElement } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const year = new Date().getFullYear();

export default function Footer(): ReactElement {
  return (
    <footer className="mt-16 w-full border-t border-black/5 bg-surface2 text-base">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-6 px-6 py-16 text-lg">
        <Image src="/logo.png" alt="Clear Path" width={200} height={55} className="h-14 w-auto" priority />
        <nav
          aria-label="Footer navigation"
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-primary"
        >
          <a
            href="https://theclearpath.ae/about-us"
            target="_blank"
            rel="noopener noreferrer"
            className="transition hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            About
          </a>
          <a
            href="https://theclearpath.ae/services"
            target="_blank"
            rel="noopener noreferrer"
            className="transition hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Services
          </a>
          <a
            href="https://theclearpath.ae/blog"
            target="_blank"
            rel="noopener noreferrer"
            className="transition hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Blog
          </a>
          <Link
            href="/legal/privacy-policy"
            className="transition hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Privacy
          </Link>
          <a
            href="https://theclearpath.ae/contact-us"
            target="_blank"
            rel="noopener noreferrer"
            className="transition hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Contact
          </a>
        </nav>
        <p className="text-black/70">© {year} The Clear Path. All rights reserved.</p>
      </div>
    </footer>
  );
}
