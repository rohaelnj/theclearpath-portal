import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = new Set(['/', '/intake', '/plans', '/login']);

export const config = {
  matcher: ['/((?!_next|favicon\\.ico|robots\\.txt|sitemap\\.xml).*)'],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const normalizedPath = pathname.endsWith('/') && pathname !== '/' ? pathname.slice(0, -1) : pathname;
  const originalDestination = `${request.nextUrl.pathname}${request.nextUrl.search}`;

  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  if (/\.[^/]+$/.test(normalizedPath)) {
    return NextResponse.next();
  }

  const token = parseAuthToken(request.cookies.get('auth_jwt')?.value);

  if (PUBLIC_PATHS.has(normalizedPath)) {
    if (token && normalizedPath === '/plans' && !token.surveyCompleted) {
      return redirectWithParam(request, '/intake', 'next', originalDestination);
    }
    return NextResponse.next();
  }

  if (!token) {
    return redirectWithParam(request, '/login', 'redirect', originalDestination);
  }

  if (normalizedPath.startsWith('/patient')) {
    if (!token.surveyCompleted) {
      return redirectWithParam(request, '/intake', 'next', originalDestination);
    }
    if (!token.planSelected) {
      return redirectWithParam(request, '/plans', 'next', originalDestination);
    }
    if (token.role !== 'patient') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  if (normalizedPath.startsWith('/therapist') && token.role !== 'therapist') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (normalizedPath.startsWith('/admin') && token.role !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

type AuthToken = {
  role?: string;
  surveyCompleted?: boolean;
  planSelected?: boolean;
} | null;

function parseAuthToken(raw?: string): AuthToken {
  if (!raw) return null;
  try {
    const value = raw.trim();
    const json = value.startsWith('{') ? value : atob(value);
    return JSON.parse(json) as AuthToken;
  } catch {
    return null;
  }
}

function redirectWithParam(request: NextRequest, pathname: string, param: 'redirect' | 'next', destination: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.searchParams.set(param, destination);
  return NextResponse.redirect(url);
}
