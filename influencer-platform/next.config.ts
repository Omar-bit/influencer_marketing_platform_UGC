import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone', // Add this line for Docker optimization
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack(config) {
    const fileLoaderRule = config.module.rules.find((rule: any) =>
      rule.test?.test?.('.svg')
    );

    config.module.rules.push(
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/, // *.svg?url
      },
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule.issuer,
        resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] }, // exclude if *.svg?url
        use: ['@svgr/webpack'],
      }
    );
    fileLoaderRule.exclude = /\.svg$/i;

    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/uploads/**',
        search: '',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**/**',
        search: '',
      },
      {
        protocol: 'https',
        hostname: 'etylqldpjmkedluwwdqd.supabase.co',
        port: '',
        pathname: '/**/**',
        search: '',
      },
      // Allow API service in Docker network
      {
        protocol: 'http',
        hostname: 'api',
        port: '5000',
        pathname: '/uploads/**',
        search: '',
      },
    ],
  },
};

export default nextConfig;
