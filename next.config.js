/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      // Note: Vercel serverless functions have a 4.5MB body size limit
      // This config only applies to Next.js Server Actions in self-hosted environments
      bodySizeLimit: '5mb',
    },
  },
  // API routes don't support body size limit config in Next.js
  // For production on Vercel: Use URLs for large files instead of direct uploads
};

module.exports = nextConfig;

