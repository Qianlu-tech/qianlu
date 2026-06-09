/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Lint is run separately via `npm run lint`; don't fail production builds on it.
  eslint: { ignoreDuringBuilds: true },
  // Pin the workspace root to this project so Next doesn't latch onto stray
  // lockfiles in the home directory when inferring the file-tracing root.
  outputFileTracingRoot: import.meta.dirname,
  webpack: (config) => {
    // wagmi/AppKit ship optional connectors (Porto, Tempo, …) that import
    // packages we don't install/use. Stub them so webpack doesn't fail.
    config.resolve.alias = {
      ...config.resolve.alias,
      "porto/internal": false,
      porto: false,
      accounts: false,
    };
    // Optional pretty-logging deps pulled in by WalletConnect — not needed.
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
};

export default nextConfig;
