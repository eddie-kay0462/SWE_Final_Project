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
}

module.exports = nextConfig 