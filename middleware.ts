import { NextResponse } from 'next/server';

export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip API, internals and assets so the Next runtime can handle them
    '/((?!api|_next|\\.netlify|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|css|js|map|txt|xml|pdf)).*)',
  ],
};
