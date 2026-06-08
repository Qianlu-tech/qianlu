/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Lint is run separately via `npm run lint`; don't fail production builds on it.
  eslint: { ignoreDuringBuilds: true },
  // Pin the workspace root to this project so Next doesn't latch onto stray
  // lockfiles in the home directory when inferring the file-tracing root.
  outputFileTracingRoot: import.meta.dirname,
};

export default nextConfig;
