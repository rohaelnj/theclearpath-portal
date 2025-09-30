// next.config.ts  (full file)
import type { NextConfig } from 'next';

const CSP =
  "default-src 'self' https: data: blob:; base-uri 'self'; object-src 'none'; img-src 'self' https: data: blob:; media-src 'self' https: blob:; font-src 'self' https: data:; connect-src 'self' https: wss: https://www.google-analytics.com https://*.googleapis.com https://*.googleusercontent.com https://*.firebaseio.com https://firestore.googleapis.com https://securetoken.googleapis.com https://identitytoolkit.googleapis.com https://www.googletagmanager.com; script-src 'self' https: 'unsafe-inline' https://www.googletagmanager.com https://www.gstatic.com https://accounts.google.com https://apis.google.com; style-src 'self' https: 'unsafe-inline'; frame-ancestors 'self'; frame-src 'self' https: https://accounts.google.com https://*.google.com https://*.firebaseapp.com;";

const nextConfig: NextConfig = {
  typedRoutes: true,
  reactStrictMode: true,
  typescript: { ignoreBuildErrors: false },
  eslint: { ignoreDuringBuilds: true },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: CSP },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/api/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store' }],
      },
    ];
  },
};

export default nextConfig;
