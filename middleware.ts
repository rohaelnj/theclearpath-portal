import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = new Set(['/', '/intake', '/plans', '/login']);

export const config = {
  matcher: ['/((?!_next|favicon\\.ico|robots\\.txt|sitemap\\.xml).*)'],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  if (PUBLIC_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/patient') || pathname.startsWith('/therapist') || pathname.startsWith('/admin')) {
    const token = parseAuthToken(request.cookies.get('auth_jwt')?.value);

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    if (pathname.startsWith('/patient')) {
      if (!token.surveyCompleted) {
        return NextResponse.redirect(new URL('/intake', request.url));
      }
      if (!token.planSelected) {
        return NextResponse.redirect(new URL('/plans', request.url));
      }
      if (token.role !== 'patient') {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }

    if (pathname.startsWith('/therapist') && token.role !== 'therapist') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    if (pathname.startsWith('/admin') && token.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
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
