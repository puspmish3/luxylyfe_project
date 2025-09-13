#!/bin/bash

# LuxyLyfe Azure Deployment Script
# This script helps automate the Azure deployment process

echo "🏠 LuxyLyfe Azure Deployment Helper"
echo "=================================="
echo ""

# Check prerequisites
echo "📋 Checking Prerequisites..."
echo ""

# Check if Azure CLI is installed
if command -v az &> /dev/null; then
    echo "✅ Azure CLI is installed"
    az --version | head -1
else
    echo "❌ Azure CLI is not installed"
    echo "   Please install from: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Check if logged into Azure
if az account show &> /dev/null; then
    echo "✅ Logged into Azure"
    az account show --query name --output tsv
else
    echo "⚠️  Not logged into Azure"
    echo "   Running: az login"
    az login
fi

echo ""
echo "🚀 Azure Static Web Apps Deployment Options:"
echo ""
echo "Option 1: Deploy via Azure Portal (Recommended)"
echo "  1. Go to: https://portal.azure.com"
echo "  2. Create Resource → Static Web Apps"
echo "  3. Connect to GitHub repository"
echo "  4. Configure build settings:"
echo "     - App location: /"
echo "     - API location: /api"
echo "     - Output location: .next"
echo ""
echo "Option 2: Deploy via Azure CLI"
echo "  1. Create resource group:"
echo "     az group create --name luxylyfe-rg --location eastus2"
echo ""
echo "  2. Create static web app:"
echo "     az staticwebapp create \\"
echo "       --name luxylyfe-webapp \\"
echo "       --resource-group luxylyfe-rg \\"
echo "       --source https://github.com/YOUR_USERNAME/luxylyfe_project \\"
echo "       --location eastus2 \\"
echo "       --branch main \\"
echo "       --app-location / \\"
echo "       --api-location /api \\"
echo "       --output-location .next"
echo ""
echo "📊 Cost Estimate:"
echo "  - Azure Static Web Apps: $0-9/month"
echo "  - MongoDB Atlas: $0-9/month"
echo "  - Total: $0-18/month"
echo ""
echo "🔧 Next Steps:"
echo "  1. Choose deployment option above"
echo "  2. Configure environment variables in Azure"
echo "  3. Update MongoDB connection string"
echo "  4. Run: node azure-production-setup.js"
echo "  5. Test your deployed application"
echo ""
echo "📖 Full Guide: See AZURE_MONGODB_DEPLOYMENT_GUIDE.md"
