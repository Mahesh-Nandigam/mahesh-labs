import type { NextConfig } from "next";

const config: NextConfig = {
  trailingSlash: true,
  outputFileTracingRoot: process.cwd(),
  images: { unoptimized: true },
  reactStrictMode: true,
  agentRules: false,
};

export default config;
