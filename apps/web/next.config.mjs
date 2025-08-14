/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
    serverActions: true,
  },
  reactStrictMode: true,
  swcMinify: true,
  
  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), camera=(), microphone=(), payment=()',
          },
        ],
      },
      {
        // Cache emergency pages aggressively
        source: '/e/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
          },
        ],
      },
    ];
  },

  // Redirects for SEO and UX
  async redirects() {
    return [
      {
        source: '/emergency/:shortId',
        destination: '/e/:shortId',
        permanent: true,
      },
    ];
  },

  // Environment variable validation
  env: {
    NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE,
    NEXT_PUBLIC_CDN_BASE: process.env.NEXT_PUBLIC_CDN_BASE,
  },
};

export default nextConfig;