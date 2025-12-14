import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Don't use static export for Electron - we need API routes and database
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "burnsrecipemanager.blob.core.windows.net",
      },
    ],
  },
};

export default nextConfig;
