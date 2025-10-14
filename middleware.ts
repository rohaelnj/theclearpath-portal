import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSessionLite } from './src/lib/auth-edge';

const PUBLIC_PATHS = new Set([
  '/',
  '/login',
  '/signup',
  '/verify-email',
  '/verify-email/sent',
  '/legal/privacy-policy',
  '/legal/refund-and-cancellation-policy',
  '/privacy-policy',
]);

export const config = {
  matcher: ['/((?!_next|favicon.ico|robots.txt|sitemap.xml|api/health|api/ping).*)'],
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/_next') || pathname.startsWith('/static')) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  if (PUBLIC_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/legal/')) {
    return NextResponse.next();
  }

  const user = await getSessionLite(req);

  if (!user) {
    const url = new URL('/login', req.nextUrl);
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  const { surveyCompleted = false, planSelected = false, subscriptionActive = false } = user;

  if (!surveyCompleted && pathname !== '/intake') {
    return NextResponse.redirect(new URL('/intake', req.nextUrl));
  }

  if (surveyCompleted && !planSelected && pathname !== '/plans') {
    return NextResponse.redirect(new URL('/plans', req.nextUrl));
  }

  if (surveyCompleted && planSelected && !subscriptionActive && !pathname.startsWith('/success') && pathname !== '/plans') {
    return NextResponse.redirect(new URL('/plans', req.nextUrl));
  }

  return NextResponse.next();
}
