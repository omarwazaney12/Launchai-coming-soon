/** @type {import('next').NextConfig} */
// Force Vercel to rebuild without cache
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Explicitly exclude the test-supabase page from builds
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  images: {
    domains: ['localhost'],
  },
  async redirects() {
    return [
      {
        source: '/test-supabase',
        destination: '/',
        permanent: true,
      },
    ]
  },
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://wpinaxsmwqcgpgpvehqk.supabase.co https://*.supabase.in;"
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ],
      },
    ]
  },
}

module.exports = nextConfig 