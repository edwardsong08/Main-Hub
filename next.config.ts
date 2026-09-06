import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep Next's development badge from covering the compact embed's map hint.
  devIndicators: false,
  // Coolify can deploy the minimal standalone server produced by `next build`.
  output: "standalone",
};

export default nextConfig;
