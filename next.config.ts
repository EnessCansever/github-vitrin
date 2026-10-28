import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const config: NextConfig = {
  agentRules: false,
  experimental: {serverActions: {bodySizeLimit: "8kb"}},
};

export default createNextIntlPlugin()(config);
