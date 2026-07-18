import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "vumbnail.com" },
      { protocol: "https", hostname: "**.adsspot.me" },
      { protocol: "https", hostname: "adsspot.me" },
    ],
  },
};

export default nextConfig;
