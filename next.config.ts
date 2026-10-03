import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Photos from a phone camera are downscaled in the browser, but the form
      // can still carry up to 7 of them plus the rest of the report.
      bodySizeLimit: "20mb",
    },
  },
};

export default nextConfig;
