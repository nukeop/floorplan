/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'export', // Enable static exports for your floorplan website
  images: {
    unoptimized: true, // Required when using 'export'
  },
};

module.exports = nextConfig;