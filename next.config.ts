import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.ELECTRON_BUILD === 'true' ? 'export' : undefined,
  distDir: process.env.ELECTRON_BUILD === 'true' ? 'out' : '.next',
  images: {
    unoptimized: process.env.ELECTRON_BUILD === 'true',
    remotePatterns: [
      {
        protocol: "https",
        hostname: "burnsrecipemanager.blob.core.windows.net",
      },
    ],
  },
};

export default nextConfig;
