import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "img.clerk.com" },
      { protocol: "https", hostname: "**.convex.cloud" },
      { protocol: "https", hostname: "**.convex.site" },
      { protocol: "https", hostname: "cdn.gameboost.com" },
    ],
  },

  // Suppress known non-critical middleware deprecation warning
  logging: {
    fetches: { fullUrl: false },
  },
};

export default nextConfig;
