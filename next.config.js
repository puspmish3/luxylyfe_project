/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'images.unsplash.com',
			},
		],
	},
	// Azure App Service configurations
	experimental: {
		serverComponentsExternalPackages: ['@azure/cosmos', 'bcryptjs', 'jsonwebtoken']
	},
	// Disable linting and type checking during build for faster deployments
	eslint: {
		ignoreDuringBuilds: true,
	},
	typescript: {
		ignoreBuildErrors: true,
	},
}

module.exports = nextConfig
