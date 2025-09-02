// next.config.ts
import type { NextConfig } from "next";

const defaultCsp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "img-src 'self' data: blob: https:",
  "style-src 'self' 'unsafe-inline' https:",
  "font-src 'self' data: https:",
  "connect-src 'self' https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://api.brevo.com https://www.googletagmanager.com https://www.google-analytics.com https://*.googleapis.com https://*.gstatic.com https://*.firebaseio.com https://firestore.googleapis.com",
  "frame-ancestors 'self'",
  "frame-src 'self' https://*.firebaseapp.com https://accounts.google.com https://*.google.com https://*.gstatic.com",
  "script-src 'self' https://apis.google.com https://www.gstatic.com https://www.googletagmanager.com https://www.google-analytics.com",
].join("; ");

const authCsp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "img-src 'self' data: blob: https:",
  "style-src 'self' 'unsafe-inline' https:",
  "font-src 'self' data: https:",
  "connect-src 'self' https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://api.brevo.com https://www.googletagmanager.com https://www.google-analytics.com https://*.googleapis.com https://*.gstatic.com https://*.firebaseio.com https://firestore.googleapis.com",
  "frame-ancestors 'self'",
  "frame-src 'self' https://*.firebaseapp.com https://accounts.google.com https://*.google.com https://*.gstatic.com",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' https://apis.google.com https://www.gstatic.com https://www.googletagmanager.com https://www.google-analytics.com",
].join("; ");

const nextConfig: NextConfig = {
  typedRoutes: true,
  headers: async () => [
    { source: "/verify-email", headers: [{ key: "Content-Security-Policy", value: authCsp }] },
    { source: "/verify-email/:path*", headers: [{ key: "Content-Security-Policy", value: authCsp }] },
    { source: "/login", headers: [{ key: "Content-Security-Policy", value: authCsp }] },
    { source: "/signup", headers: [{ key: "Content-Security-Policy", value: authCsp }] },
    { source: "/auth/callback", headers: [{ key: "Content-Security-Policy", value: authCsp }] },
    { source: "/api/:path*", headers: [{ key: "Content-Security-Policy", value: defaultCsp }] },
    { source: "/:path*", headers: [{ key: "Content-Security-Policy", value: defaultCsp }] },
  ],
};

export default nextConfig;
