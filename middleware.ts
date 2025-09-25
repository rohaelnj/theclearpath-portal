import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const p = req.nextUrl.pathname;
  if (
    p.startsWith('/api') ||
    p.startsWith('/_next') ||
    p.startsWith('/.netlify') ||
    p.endsWith('.ico') ||
    p.endsWith('.png') ||
    p.endsWith('.jpg') ||
    p.endsWith('.svg') ||
    p.endsWith('.txt') ||
    p.endsWith('.xml')
  ) {
    return; // pass-through
  }

  // Existing middleware logic (none currently)
  return;
}

export const config = {
  matcher: ['/((?!.*\\.).*)'],
};
