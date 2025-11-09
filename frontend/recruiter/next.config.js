/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  
  // Environment variables available to the browser
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
    NEXT_PUBLIC_APP_NAME: 'AI Job Matching - Recruiter Dashboard',
  },

  // Optimize images
  images: {
    domains: ['localhost'],
  },

  // Disable x-powered-by header
  poweredByHeader: false,
}

module.exports = nextConfig
