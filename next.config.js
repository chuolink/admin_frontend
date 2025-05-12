/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io',
        port: ''
      },
      {
        protocol: 'https',
        hostname: 'api.slingacademy.com',
        port: ''
      },
      {
        protocol: 'https',
        hostname: 'localhost',
        port: ''
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000'
      }
    ]
  },
  transpilePackages: ['geist']
};

module.exports = nextConfig;
