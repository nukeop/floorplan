/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'export', // Enable static exports for your floorplan website
  images: {
    unoptimized: true, // Required when using 'export'
  },
  // The following line needs to be updated with your actual repository name
  basePath: process.env.NODE_ENV === 'production' ? '/floorplan' : '',
};

module.exports = nextConfig;