// next.config.ts
import type { NextConfig } from "next";

const CSP = [
  "default-src 'self'",
  // allow Next.js runtime and hydration
  "script-src 'self' https: 'unsafe-inline' 'unsafe-eval'",
  // inline style props from React
  "style-src 'self' 'unsafe-inline' https:",
  // assets
  "img-src 'self' https: data:",
  "font-src 'self' https: data:",
  // APIs (broad allow for now; tighten later)
  "connect-src 'self' https:",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: CSP },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
