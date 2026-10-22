import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/meezingen", destination: "/contact#meezingen", permanent: false },
    ];
  },
};

export default nextConfig;
