/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/MEC',
  assetPrefix: '/MEC/',
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
