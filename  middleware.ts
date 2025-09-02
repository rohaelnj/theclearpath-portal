// middleware.ts  (place at repo root, beside next.config.ts)
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const defaultCsp = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "img-src 'self' data: blob: https:",
    "style-src 'self' 'unsafe-inline' https:",
    "font-src 'self' data: https:",
    "connect-src 'self' https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://*.googleapis.com https://*.gstatic.com https://firestore.googleapis.com https://firebasestorage.googleapis.com",
    "frame-ancestors 'self'",
    "frame-src 'self' https://*.firebaseapp.com https://accounts.google.com https://*.google.com https://*.gstatic.com",
    "script-src 'self' https://apis.google.com https://www.gstatic.com https://www.googletagmanager.com https://www.google-analytics.com",
    "worker-src 'self' blob:",
].join('; ');

const authCsp = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "img-src 'self' data: blob: https:",
    "style-src 'self' 'unsafe-inline' https:",
    "font-src 'self' data: https:",
    "connect-src 'self' https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://*.googleapis.com https://*.gstatic.com https://firestore.googleapis.com https://firebasestorage.googleapis.com",
    "frame-ancestors 'self'",
    "frame-src 'self' https://*.firebaseapp.com https://accounts.google.com https://*.google.com https://*.gstatic.com",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' https://apis.google.com https://www.gstatic.com https://www.googletagmanager.com https://www.google-analytics.com",
    "worker-src 'self' blob:",
].join('; ');

export function middleware(req: NextRequest) {
    const p = req.nextUrl.pathname;
    const isAuth =
        p === '/login' ||
        p === '/signup' ||
        p === '/verify-email' ||
        p.startsWith('/verify-email/') ||
        p === '/auth/callback';

    const res = NextResponse.next();
    res.headers.set('Content-Security-Policy', isAuth ? authCsp : defaultCsp);
    res.headers.set('x-csp-from', 'middleware-v1');
    return res;
}

export const config = { matcher: ['/:path*'] };
