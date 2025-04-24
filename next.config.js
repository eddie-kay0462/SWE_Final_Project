/** @type {import('next').NextConfig} */
const nextConfig = {
  // Suppress specific warnings
  onDemandEntries: {
    // Reduce console noise
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  
  // Add webpack configuration to handle punycode
  webpack: (config, { isServer }) => {
    // Suppress punycode warnings
    config.ignoreWarnings = [
      { module: /node_modules\/punycode/ },
    ];
    
    return config;
  },

  // Environment variable validation
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },

  // Disable static optimization for API routes
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'csoft.vercel.app'],
    },
  },

  // Image configuration using remotePatterns
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'miro.medium.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      }
    ],
  },
}

module.exports = nextConfig
