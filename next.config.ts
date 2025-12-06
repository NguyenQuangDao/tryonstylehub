import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cilsrdpvqtgutxprdofn.supabase.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'image-ai-style.s3.ap-southeast-1.amazonaws.com',
        port: '',
        pathname: '/**',
      },
      ...(process.env.AWS_S3_BUCKET && process.env.AWS_S3_REGION
        ? [{
            protocol: 'https' as const,
            hostname: `${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_S3_REGION}.amazonaws.com`,
            port: '',
            pathname: '/**',
          }]
        : []),
      {
        protocol: 'https',
        hostname: 'cdn.fashn.ai',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.fashn.ai',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'app.fashn.ai',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'v3.fal.media',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'custom-icon-badges.demolab.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.shields.io',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'mjc1kvq4a1.ufs.sh',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'oaidalleapiprodscus.blob.core.windows.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    // Relax CSP to allow Next.js dev/runtime scripts and styles
    contentSecurityPolicy:
      process.env.NODE_ENV === 'production'
        ? "default-src 'self'; img-src 'self' https: data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self' https:; font-src 'self' https: data:; frame-src 'self'" 
        : "default-src 'self'; img-src 'self' https: data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self' http: https: ws:; font-src 'self' https: data:; frame-src 'self'",
  },
  experimental: {
    serverActions: { allowedOrigins: [] },
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  poweredByHeader: false,
  compress: true,
  // Enable static optimization
  trailingSlash: false,
  // Optimize bundle
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle size
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
          },
        },
      };
    }
    return config;
  },
};

export default nextConfig;
