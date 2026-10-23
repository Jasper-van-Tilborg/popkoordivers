import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/meezingen", destination: "/contact#meezingen", permanent: false },
      { source: "/admin/leden", destination: "/admin/gebruikers", permanent: false },
      { source: "/admin/instellingen", destination: "/admin", permanent: false },
    ];
  },
};

export default nextConfig;
