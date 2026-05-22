/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true, // ✅ Enables React's Strict Mode in dev
    trailingSlash: true,
    eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;
