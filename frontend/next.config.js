/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      { source: '/api-backend/:path*', destination: 'http://localhost:4000/api/:path*' },
    ];
  },
  webpack: (config) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/node_modules/**', '**/.git/**', '**/.next/**'],
    };
    return config;
  },
};

module.exports = nextConfig;
