// middleware.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Pass-through middleware that explicitly skips API, Next internals, Netlify internals, and common static files.
export function middleware(req: NextRequest) {
  const p = req.nextUrl.pathname;

  // Always skip for these prefixes/files
  if (
    p.startsWith('/api') ||
    p.startsWith('/_next') ||
    p.startsWith('/.netlify') ||
    p === '/favicon.ico' ||
    p === '/robots.txt' ||
    p === '/sitemap.xml'
  ) {
    return NextResponse.next();
  }

  // If you need auth/redirect logic for pages, add it **below** this line.
  return NextResponse.next();
}

// Only run on routes without a dot (avoids static assets) and lets the skip-list above short-circuit first.
export const config = {
  matcher: ['/((?!.*\\.).*)'],
};
