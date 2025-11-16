import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  
  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Enable image optimization
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Optimize bundle size
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: [
      '@/components',
      '@/lib',
      'lucide-react',
    ],
    // Enable optimized CSS loading
    optimizeCss: true,
  },
  
  // Turbopack configuration (Next.js 16+)
  turbopack: {
    // Empty config to silence the warning
    // Turbopack handles code splitting automatically
  },
  
  // Production optimizations
  ...(process.env.NODE_ENV === 'production' && {
    // Enable SWC minification for better performance
    swcMinify: true,
    
    // Optimize production builds
    productionBrowserSourceMaps: false,
    
    // Enable compression
    compress: true,
    
    // Optimize page loading
    poweredByHeader: false,
  }),
};

export default nextConfig;
