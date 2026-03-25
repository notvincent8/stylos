import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  experimental: {
    // Cap the buffered request body at proxy level before it reaches any
    // route handler. The Zod schema still enforces per-field limits.
    proxyClientMaxBodySize: "2mb",
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            // script-src: 'unsafe-inline' is required for Next.js hydration scripts.
            // style-src: 'unsafe-inline' is required for Tailwind utility classes.
            // img-src: blob: is required for client-side image previews (URL.createObjectURL).
            // connect-src: 'self' covers fetch() calls to our own API routes.
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com",
              "img-src 'self' blob: data:",
              "connect-src 'self'",
              "frame-ancestors 'none'",
            ].join("; "),
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            // strict-origin-when-cross-origin omits the path on cross-origin
            // requests, which is slightly stricter than origin-when-cross-origin.
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), battery=(), geolocation=(), microphone=()",
          },
        ],
      },
    ]
  },
}

export default nextConfig
