/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    formats: ['image/avif', 'image/webp'],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Remove console logs in production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Optimize package imports
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', 'framer-motion', 'react-syntax-highlighter'],
  },
  // Production optimizations
  productionBrowserSourceMaps: false,
}

export default nextConfig
