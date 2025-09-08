/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Required for Docker/containerized deployments
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs']
  },
  images: {
    domains: ['example.com', 'via.placeholder.com'], // Add your image domains here
  },
}

module.exports = nextConfig
