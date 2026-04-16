import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },// Disable if you wanna solve bugs in prod
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  async rewrites() {
    return [
      {
        source: '/api/db/:path*',
        destination: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/:path*`, // Proxy to Supabase
      },
    ];
  },
};

export default nextConfig;