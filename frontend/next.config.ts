import type { NextConfig } from "next";

// The API origin for server-side fetches and the /api/* proxy.
// In production this is the public API host; override with API_ORIGIN if it moves.
const apiOrigin =
  process.env.API_ORIGIN ??
  (process.env.NODE_ENV === "development"
    ? "http://localhost:5000"
    : "http://vingo-roll-api.runasp.net");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  outputFileTracingRoot: __dirname,

  // Same-origin API proxy — the browser only ever talks to the frontend
  // origin, so the plain-HTTP API causes no mixed-content or CORS issues.
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${apiOrigin}/api/:path*` }];
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Explicitly allow every quality value used in the app (required from Next.js 16)
    qualities: [60, 70, 75, 80, 85],
  },

  // i18n support (ready for future expansion)
  // i18n: {
  //   locales: ['en', 'es', 'fr'],
  //   defaultLocale: 'en',
  // },

  // Headers for security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ];
  },
};

export default nextConfig;
