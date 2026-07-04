import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  experimental: {
    // Nonaktifkan default cache agar semua data selalu fresh dari database
    staleTimes: {
      dynamic: 0,
      static: 0,
    },
  },
};

export default nextConfig;
