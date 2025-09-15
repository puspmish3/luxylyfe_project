#!/bin/bash

# Azure Deployment Script for LuxyLyfe Next.js Application
# Run this script after setting up your environment variables

echo "🚀 Starting Azure deployment for LuxyLyfe..."

# Check if azd is installed
if ! command -v azd &> /dev/null; then
    echo "❌ Azure Developer CLI (azd) is not installed."
    echo "📦 Install it from: https://docs.microsoft.com/azure/developer/azure-developer-cli/install-azd"
    exit 1
fi

# Check if user is logged in to Azure
if ! azd auth show &> /dev/null; then
    echo "🔐 Please log in to Azure..."
    azd auth login
fi

# Initialize the project (if not already done)
if [ ! -f ".azure/config.json" ]; then
    echo "🔧 Initializing Azure Developer CLI project..."
    azd init
fi

# Set environment variables
echo "🔧 Setting up environment variables..."
azd env set AZURE_LOCATION eastus
azd env set JWT_SECRET $(openssl rand -base64 32)
azd env set NEXTAUTH_SECRET $(openssl rand -base64 32)
azd env set DATABASE_MODE cosmos_primary
azd env set COSMOS_DATABASE_NAME luxylyfe

# Deploy infrastructure and application
echo "📦 Deploying to Azure..."
azd up

echo "✅ Deployment completed!"
echo "🌐 Your application should be available at the URL shown above."
echo ""
echo "🔧 Next steps:"
echo "1. Update your Cosmos DB connection strings in Azure App Service"
echo "2. Test the deployed application"
echo "3. Configure custom domain (optional)"