import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const config: NextConfig = {
  agentRules: false,
  logging: {serverFunctions: false},
  experimental: {serverActions: {bodySizeLimit: "8kb"}},
  async headers() {
    return ["/reports/:path*", "/share/:path*"].map(source => ({source, headers: [
      {key: "CDN-Cache-Control", value: "no-store"},
      {key: "Vercel-CDN-Cache-Control", value: "no-store"},
      {key: "Referrer-Policy", value: "no-referrer"},
      {key: "X-Robots-Tag", value: "noindex, nofollow, noarchive"},
      {key: "Cache-Control", value: "private, no-store, max-age=0"},
    ]}));
  },
};

export default createNextIntlPlugin()(config);
