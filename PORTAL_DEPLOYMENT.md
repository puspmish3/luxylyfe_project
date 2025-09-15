# Azure Portal Deployment Guide for LuxyLyfe

## Step 1: Create App Service via Azure Portal

1. **Go to Azure Portal**: https://portal.azure.com
2. **Create Resource** → **Web App**
3. **Fill in details**:
   - **Subscription**: Your subscription
   - **Resource Group**: Create new "rg-luxylyfe-prod"
   - **Name**: "app-luxylyfe-prod" (must be globally unique)
   - **Runtime Stack**: Node 18 LTS
   - **Operating System**: Linux
   - **Region**: East US (or your preferred region)
   - **Pricing Plan**: Basic B1

## Step 2: Configure Environment Variables

After creation, go to **App Service** → **Configuration** → **Application Settings**:

Add these settings:
```
JWT_SECRET = "your-secure-jwt-secret-minimum-32-characters"
NEXTAUTH_SECRET = "your-nextauth-secret-different-from-jwt"
NEXTAUTH_URL = "https://your-app-name.azurewebsites.net"
DATABASE_MODE = "cosmos_primary"
COSMOS_DB_ENDPOINT = "https://your-cosmos-account.documents.azure.com:443/"
COSMOS_DB_KEY = "your-cosmos-db-primary-key"
COSMOS_DB_DATABASE_NAME = "luxylyfe"
```

## Step 3: Deploy Code

### Option A: GitHub Actions (Recommended)
1. Push your code to GitHub
2. In App Service → **Deployment Center**
3. Select **GitHub** as source
4. Authenticate and select your repository
5. Configure workflow file

### Option B: Local Git
1. In App Service → **Deployment Center**
2. Select **Local Git**
3. Copy the Git URL
4. Add as remote: `git remote add azure <git-url>`
5. Deploy: `git push azure main`

### Option C: ZIP Deploy
1. Build locally: `npm run build`
2. Create ZIP of project (exclude node_modules, .git)
3. In App Service → **Advanced Tools (Kudu)** → **ZIP Push Deploy**
4. Drag and drop your ZIP file

## Step 4: Configure Startup
In **Configuration** → **General Settings**:
- **Startup Command**: `npm start`

## Step 5: Get Your Cosmos DB Details

If you need to find your existing Cosmos DB details:
1. Go to your Cosmos DB account in Azure Portal
2. **Keys** section for connection strings
3. **Overview** for endpoint URL

## Step 6: Test Deployment
1. Wait for deployment to complete
2. Visit your App Service URL
3. Test login with your user accounts
4. Check logs in **Log Stream** if issues occur

## Troubleshooting
- Check **Log Stream** for real-time logs
- Verify all environment variables are set
- Ensure Cosmos DB is accessible from App Service
- Check that startup command is correct