# Azure Deployment Script for LuxyLyfe Next.js Application
# Run this script after setting up your environment variables

Write-Host "🚀 Starting Azure deployment for LuxyLyfe..." -ForegroundColor Green

# Check if azd is installed
if (-not (Get-Command azd -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Azure Developer CLI (azd) is not installed." -ForegroundColor Red
    Write-Host "📦 Install it from: https://docs.microsoft.com/azure/developer/azure-developer-cli/install-azd"
    exit 1
}

# Check if user is logged in to Azure
try {
    azd auth show | Out-Null
} catch {
    Write-Host "🔐 Please log in to Azure..." -ForegroundColor Yellow
    azd auth login
}

# Initialize the project (if not already done)
if (-not (Test-Path ".azure/config.json")) {
    Write-Host "🔧 Initializing Azure Developer CLI project..." -ForegroundColor Blue
    azd init
}

# Set environment variables
Write-Host "🔧 Setting up environment variables..." -ForegroundColor Blue
azd env set AZURE_LOCATION eastus
azd env set JWT_SECRET ([System.Web.Security.Membership]::GeneratePassword(32, 5))
azd env set NEXTAUTH_SECRET ([System.Web.Security.Membership]::GeneratePassword(32, 5))
azd env set DATABASE_MODE cosmos_primary
azd env set COSMOS_DATABASE_NAME luxylyfe

# Prompt for existing Cosmos DB account name
$cosmosAccount = Read-Host "Enter your existing Cosmos DB account name (leave empty to create new)"
if ($cosmosAccount) {
    azd env set COSMOS_ACCOUNT_NAME $cosmosAccount
}

# Deploy infrastructure and application
Write-Host "📦 Deploying to Azure..." -ForegroundColor Green
azd up

Write-Host "✅ Deployment completed!" -ForegroundColor Green
Write-Host "🌐 Your application should be available at the URL shown above."
Write-Host ""
Write-Host "🔧 Next steps:" -ForegroundColor Yellow
Write-Host "1. Update your Cosmos DB connection strings in Azure App Service"
Write-Host "2. Test the deployed application"
Write-Host "3. Configure custom domain (optional)"