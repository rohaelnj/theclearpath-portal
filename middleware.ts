import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getUserFromCookie } from '@/lib/auth-server';
import type { PortalUser } from '@/lib/auth';

const PUBLIC_PATHS = [
  '/',
  '/login',
  '/verify-email',
  '/forgot-password',
  '/reset-password',
  '/legal',
  '/pricing',
  '/health',
  '/success',
  '/robots.txt',
  '/sitemap.xml',
  '/favicon.ico',
];

function isPublic(path: string): boolean {
  if (path.startsWith('/api') || path.startsWith('/_next') || path.startsWith('/static')) return true;
  return PUBLIC_PATHS.some((entry) => path === entry || path.startsWith(`${entry}/`));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  let user: PortalUser | null = null;

  if (pathname === '/signup') {
    user = await getUserFromCookie(req.cookies, req.nextUrl.origin);
    if (!user) {
      return NextResponse.next();
    }

    if (!user.surveyCompleted) {
      return NextResponse.redirect(new URL('/intake', req.nextUrl));
    }
    if (user.surveyCompleted && !user.planSelected) {
      return NextResponse.redirect(new URL('/plans', req.nextUrl));
    }
    return NextResponse.redirect(new URL('/portal', req.nextUrl));
  }

  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  user = user ?? (await getUserFromCookie(req.cookies, req.nextUrl.origin));

  if (!user) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  const { surveyCompleted = false, planSelected = false, subscriptionActive = false } = user;

  if (!surveyCompleted && pathname !== '/intake') {
    return NextResponse.redirect(new URL('/intake', req.nextUrl));
  }

  if (surveyCompleted && !planSelected && pathname !== '/plans') {
    return NextResponse.redirect(new URL('/plans', req.nextUrl));
  }

  const isCheckoutPath = pathname.startsWith('/checkout');
  if (planSelected && !subscriptionActive && !isCheckoutPath && pathname !== '/plans') {
    return NextResponse.redirect(new URL('/plans', req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)'],
};
