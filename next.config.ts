import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Coolify can deploy the minimal standalone server produced by `next build`.
  output: "standalone",
};

export default nextConfig;
