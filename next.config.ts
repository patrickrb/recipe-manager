import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "burnsrecipemanager.blob.core.windows.net",
      },
    ],
  },
};

export default nextConfig;
