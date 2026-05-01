import type { NextConfig } from "next";
import path from 'path';
import { withSentryConfig } from '@sentry/nextjs';

const isDev = process.env.NODE_ENV === 'development';
const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

const parsedApi = (() => {
  try {
    const u = new URL(apiUrl);
    return {
      origin: u.origin,
      protocol: u.protocol.replace(':', '') as 'http' | 'https',
      hostname: u.hostname,
      port: u.port,
    };
  } catch {
    return { origin: apiUrl, protocol: 'http' as const, hostname: 'localhost', port: '3000' };
  }
})();

const apiOrigin = parsedApi.origin;

const csp = [
  "default-src 'self'",
  // unsafe-eval needed in dev for Fast Refresh; removed in prod
  isDev
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    : "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  // fonts served from /_next/static/ (next/font/google downloads at build time)
  // data: covers base64-embedded icon glyphs from remixicon/material-symbols
  "font-src 'self' data:",
  "img-src 'self' data: blob:",
  `connect-src 'self' ${apiOrigin}`,
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  { key: 'Content-Security-Policy', value: csp },
];

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR ?? '.next',
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: parsedApi.protocol,
        hostname: parsedApi.hostname,
        ...(parsedApi.port ? { port: parsedApi.port } : {}),
        pathname: '/uploads/**',
      },
    ],
  },
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

const sentryOptions = {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  // Suppress output unless running in CI
  silent: !process.env.CI,
  // Don't leak source maps to the client bundle
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },
  // Reduce bundle size by tree-shaking Sentry logger
  disableLogger: true,
  // Proxy Sentry requests through Next.js to bypass ad-blockers
  tunnelRoute: '/monitoring',
};

// Apply Sentry wrapper when either the server or client DSN is configured
const hasSentryDsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

export default hasSentryDsn
  ? withSentryConfig(nextConfig, sentryOptions)
  : nextConfig;
