// next.config.ts  (full file)
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typedRoutes: true,
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self' https: data: blob:; base-uri 'self'; object-src 'none'; img-src 'self' https: data: blob:; media-src 'self' https: blob:; font-src 'self' https: data:; connect-src 'self' https: wss: https://www.google-analytics.com https://*.googleapis.com https://*.googleusercontent.com https://*.firebaseio.com https://firestore.googleapis.com https://securetoken.googleapis.com https://identitytoolkit.googleapis.com https://www.googletagmanager.com; script-src 'self' https: 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.gstatic.com https://accounts.google.com https://apis.google.com; style-src 'self' https: 'unsafe-inline'; frame-ancestors 'self'; frame-src 'self' https: https://accounts.google.com https://*.google.com https://*.firebaseapp.com;",
          },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        ],
      },
    ];
  },
};

export default nextConfig;
