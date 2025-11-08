/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  productionBrowserSourceMaps: false,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? {
      exclude: ["error", "warn"],
    } : false,
  },
  experimental: {
    optimizePackageImports: ["framer-motion", "lottie-react"],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: "all",
        cacheGroups: {
          default: false,
          vendors: false,
          framerMotion: {
            name: "framer-motion",
            test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
            priority: 30,
          },
          tonConnect: {
            name: "tonconnect",
            test: /[\\/]node_modules[\\/]@tonconnect[\\/]/,
            priority: 20,
          },
          games: {
            name: "games",
            test: /[\\/]components[\\/](Game|Galaxy)/,
            priority: 10,
          },
        },
      };
    }
    return config;
  },
};

module.exports = withBundleAnalyzer(nextConfig);
