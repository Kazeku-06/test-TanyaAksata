import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['103.6.201.118'],
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/storage/**",
      },
      {
        protocol: "https",
        hostname: "api-ta.neverland.my.id",
        pathname: "/storage/**",
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com",
        pathname: "/api/**",
      },
    ],
  },
};

export default nextConfig;
