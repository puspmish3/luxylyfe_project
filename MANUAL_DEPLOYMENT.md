# Manual Azure Deployment Steps for LuxyLyfe

## Prerequisites
1. Azure CLI installed: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli
2. Active Azure subscription
3. Existing Cosmos DB account

## Step 1: Login to Azure
```bash
az login
az account set --subscription "your-subscription-id"
```

## Step 2: Create Resource Group
```bash
az group create --name rg-luxylyfe-prod --location eastus
```

## Step 3: Create App Service Plan
```bash
az appservice plan create \
  --name plan-luxylyfe-prod \
  --resource-group rg-luxylyfe-prod \
  --location eastus \
  --sku B1 \
  --is-linux
```

## Step 4: Create App Service
```bash
az webapp create \
  --name app-luxylyfe-prod \
  --resource-group rg-luxylyfe-prod \
  --plan plan-luxylyfe-prod \
  --runtime "NODE|18-lts"
```

## Step 5: Configure App Settings
```bash
# JWT Configuration
az webapp config appsettings set \
  --name app-luxylyfe-prod \
  --resource-group rg-luxylyfe-prod \
  --settings \
    JWT_SECRET="your-secure-jwt-secret-32-chars-min" \
    NEXTAUTH_SECRET="your-nextauth-secret-different" \
    NEXTAUTH_URL="https://app-luxylyfe-prod.azurewebsites.net" \
    DATABASE_MODE="cosmos_primary" \
    COSMOS_DB_ENDPOINT="https://your-cosmos-account.documents.azure.com:443/" \
    COSMOS_DB_KEY="your-cosmos-primary-key" \
    COSMOS_DB_DATABASE_NAME="luxylyfe"
```

## Step 6: Deploy Application
```bash
# Build the application
npm run build

# Create deployment package
zip -r luxylyfe-app.zip . -x "node_modules/*" ".git/*" ".next/cache/*"

# Deploy to Azure
az webapp deployment source config-zip \
  --name app-luxylyfe-prod \
  --resource-group rg-luxylyfe-prod \
  --src luxylyfe-app.zip
```

## Step 7: Configure Startup Command
```bash
az webapp config set \
  --name app-luxylyfe-prod \
  --resource-group rg-luxylyfe-prod \
  --startup-file "npm start"
```

## Step 8: Restart App Service
```bash
az webapp restart \
  --name app-luxylyfe-prod \
  --resource-group rg-luxylyfe-prod
```

## Step 9: Test Deployment
Visit: https://app-luxylyfe-prod.azurewebsites.net

## Environment Variables Needed:
- JWT_SECRET: A secure random string (minimum 32 characters)
- NEXTAUTH_SECRET: Another secure random string 
- COSMOS_DB_ENDPOINT: Your existing Cosmos DB endpoint
- COSMOS_DB_KEY: Your Cosmos DB primary key
- COSMOS_DB_DATABASE_NAME: "luxylyfe"
- DATABASE_MODE: "cosmos_primary"
- NEXTAUTH_URL: Will be your App Service URL