// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  // Hotfix: remove CSP headers set anywhere upstream
  res.headers.delete('content-security-policy');
  res.headers.delete('content-security-policy-report-only');
  res.headers.set('x-csp-from', 'middleware-temp-strip');
  return res;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
