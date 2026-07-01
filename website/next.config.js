/** @type {import('next').NextConfig} */
const nextConfig = {
   output:'export',
    reactStrictMode: true, // ✅ Enables React's Strict Mode in dev
    trailingSlash: true,
    eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        bufferutil: false,
        "utf-8-validate": false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;