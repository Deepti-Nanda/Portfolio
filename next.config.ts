import type { NextConfig } from "next";

// Security headers for every page and file.
const securityHeaders = [
  // Only this site may show its pages in a frame (the resume viewer frames
  // resume.pdf), which blocks clickjacking from other sites.
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  { key: "Strict-Transport-Security", value: "max-age=63072000" },
];

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Don't advertise the framework in an "X-Powered-By" header.
  poweredByHeader: false,
  images: {
    // 75 is the default; the hero photo uses 90 so faces stay crisp.
    qualities: [75, 90],
  },
  headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
