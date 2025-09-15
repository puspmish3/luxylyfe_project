/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Required for Azure App Service deployments
  experimental: {
    serverComponentsExternalPackages: ['@azure/cosmos', 'bcryptjs', 'jsonwebtoken']
  },
  images: {
    domains: ['example.com', 'via.placeholder.com'], // Add your image domains here
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    COSMOS_DB_ENDPOINT: process.env.COSMOS_DB_ENDPOINT,
    COSMOS_DB_KEY: process.env.COSMOS_DB_KEY,
    COSMOS_DB_DATABASE_NAME: process.env.COSMOS_DB_DATABASE_NAME,
    JWT_SECRET: process.env.JWT_SECRET,
    DATABASE_MODE: process.env.DATABASE_MODE,
  },
}

module.exports = nextConfig
