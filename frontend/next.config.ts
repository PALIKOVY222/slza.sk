import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
  
  // Turbopack config (prázdny objekt = no warnings)
  turbopack: {},
  
  // Optimalizácia pre Vercel deployment
  experimental: {
    serverMinification: true,
  },
};

export default nextConfig;
