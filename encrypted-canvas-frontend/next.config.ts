import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  // Note: Headers are not supported in static export
  // For production deployment, configure headers at the hosting platform level
};

export default nextConfig;
