import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ── Image optimization ────────────────────────────────────────────
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "img.clerk.com" },
      { protocol: "https", hostname: "**.convex.cloud" },
      { protocol: "https", hostname: "**.convex.site" },
      { protocol: "https", hostname: "cdn.gameboost.com" },
    ],
  },

  // ── Bundle optimizations ─────────────────────────────────────────
  // Tree-shake heavy packages to only import what's used
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion", "recharts"],
  },

  // ── Logging ──────────────────────────────────────────────────────
  logging: {
    fetches: { fullUrl: false },
  },

  // ── Compression ──────────────────────────────────────────────────
  compress: true,

  // ── Power-mode: strip source maps in prod ────────────────────────
  productionBrowserSourceMaps: false,
};

export default nextConfig;
