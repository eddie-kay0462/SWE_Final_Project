/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Add your webpack configurations here if needed
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com', 
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'miro.medium.com',  // Add this for Medium images
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@supabase/ssr', '@supabase/supabase-js', 'framer-motion'],
    serverActions: true,
  },
  // Enable static optimization
  staticPageGenerationTimeout: 60,
  // Enable HTTP/2
  http2: true,
  // Enable compression
  compress: true,
};

export default nextConfig;
