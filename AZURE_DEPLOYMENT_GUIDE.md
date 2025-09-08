# Azure Deployment Guide for LuxyLyfe Web Application

## Overview

This guide provides comprehensive Azure deployment options for your Next.js LuxyLyfe application, with detailed cost projections and recommendations for different business needs.

## Prerequisites

- Azure Account (Free tier available)
- Azure CLI installed and configured
- Node.js 18+ installed
- MongoDB Atlas database (already configured)
- Git repository (GitHub, Azure DevOps, or GitLab)

## Azure Deployment Options

### Option 1: Azure Static Web Apps (Recommended for Next.js)

#### Benefits:

- **Optimized for JAMstack** applications like Next.js
- **Global CDN** with edge locations worldwide
- **Automatic HTTPS** with custom domains
- **Built-in CI/CD** from GitHub/GitLab
- **Serverless APIs** included
- **Authentication** providers built-in
- **Free tier** available

#### Steps:

1. **Prepare Repository**

```bash
# Ensure your code is in GitHub/GitLab
git add .
git commit -m "Prepare for Azure deployment"
git push origin main
```

2. **Deploy via Azure Portal**

   - Go to Azure Portal → Create Resource → Static Web Apps
   - Connect to your GitHub/GitLab repository
   - Select branch: `main`
   - Build Details:
     - Framework: `Next.js`
     - App location: `/`
     - API location: `api`
     - Output location: `.next`

3. **Configure Build Settings**
   Create `.github/workflows/azure-static-web-apps-deployment.yml`:

```yaml
name: Azure Static Web Apps CI/CD

on:
  push:
    branches:
      - main
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches:
      - main

jobs:
  build_and_deploy_job:
    if: github.event_name == 'push' || (github.event_name == 'pull_request' && github.event.action != 'closed')
    runs-on: ubuntu-latest
    name: Build and Deploy Job
    steps:
      - uses: actions/checkout@v3
        with:
          submodules: true
      - name: Build And Deploy
        id: builddeploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/"
          api_location: ""
          output_location: ".next"
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          JWT_SECRET: ${{ secrets.JWT_SECRET }}
          NEXTAUTH_URL: ${{ secrets.NEXTAUTH_URL }}
          NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}
```

4. **Environment Variables**
   - Go to Configuration → Environment variables
   - Add your production variables

#### Cost Projection:

- **Free Tier**: 100GB bandwidth/month, 500MB storage
- **Standard Tier**: $9/month + $0.20/GB bandwidth
- **Estimated Monthly Cost**: $9-25 for typical luxury real estate site

---

### Option 2: Azure App Service (Full-Featured Web Apps)

#### Benefits:

- **Full .NET/Node.js** platform support
- **Deployment slots** for staging/production
- **Auto-scaling** capabilities
- **Application Insights** monitoring
- **Custom domains** and SSL
- **WebJobs** for background tasks

#### Steps:

1. **Create App Service Plan**

```bash
# Install Azure CLI and login
az login

# Create resource group
az group create --name luxylyfe-rg --location "East US"

# Create App Service plan
az appservice plan create --name luxylyfe-plan --resource-group luxylyfe-rg --sku B1 --is-linux

# Create web app
az webapp create --resource-group luxylyfe-rg --plan luxylyfe-plan --name luxylyfe-app --runtime "NODE|18-lts"
```

2. **Configure Deployment**

```bash
# Set up deployment from GitHub
az webapp deployment source config --name luxylyfe-app --resource-group luxylyfe-rg --repo-url https://github.com/yourusername/luxylyfe --branch main --manual-integration

# Configure Node.js settings
az webapp config appsettings set --resource-group luxylyfe-rg --name luxylyfe-app --settings WEBSITE_NODE_DEFAULT_VERSION="18.17.0"
```

3. **Environment Variables**

```bash
az webapp config appsettings set --resource-group luxylyfe-rg --name luxylyfe-app --settings \
  DATABASE_URL="your_mongodb_connection" \
  JWT_SECRET="your_jwt_secret" \
  NEXTAUTH_URL="https://luxylyfe-app.azurewebsites.net" \
  NEXTAUTH_SECRET="your_nextauth_secret"
```

4. **Custom Domain (Optional)**

```bash
# Map custom domain
az webapp config hostname add --resource-group luxylyfe-rg --webapp-name luxylyfe-app --hostname www.luxylyfe.com
```

#### Cost Projection:

- **Basic (B1)**: $13.14/month (1 core, 1.75GB RAM)
- **Standard (S1)**: $56.94/month (1 core, 1.75GB RAM, staging slots)
- **Premium (P1v2)**: $142.35/month (1 core, 3.5GB RAM, advanced features)
- **Estimated Monthly Cost**: $13-60 for most use cases

---

### Option 3: Azure Container Instances (Containerized)

#### Benefits:

- **Pay-per-second** billing
- **No server management**
- **Fast startup** times
- **Custom container** support
- **Resource flexibility**

#### Steps:

1. **Create Container Registry**

```bash
# Create Azure Container Registry
az acr create --resource-group luxylyfe-rg --name luxylyferegistry --sku Basic --admin-enabled true

# Login to registry
az acr login --name luxylyferegistry
```

2. **Build and Push Docker Image**

```bash
# Build Docker image
docker build -t luxylyfe .

# Tag for Azure Container Registry
docker tag luxylyfe luxylyferegistry.azurecr.io/luxylyfe:latest

# Push to registry
docker push luxylyferegistry.azurecr.io/luxylyfe:latest
```

3. **Deploy Container Instance**

```bash
# Create container instance
az container create \
  --resource-group luxylyfe-rg \
  --name luxylyfe-container \
  --image luxylyferegistry.azurecr.io/luxylyfe:latest \
  --registry-login-server luxylyferegistry.azurecr.io \
  --registry-username luxylyferegistry \
  --registry-password $(az acr credential show --name luxylyferegistry --query "passwords[0].value" -o tsv) \
  --dns-name-label luxylyfe \
  --ports 3000 \
  --environment-variables \
    DATABASE_URL="your_mongodb_connection" \
    JWT_SECRET="your_jwt_secret" \
    NEXTAUTH_URL="http://luxylyfe.eastus.azurecontainer.io:3000"
```

#### Cost Projection:

- **Container Registry**: $5/month (Basic)
- **Container Instance**: $29.90/month (1 vCPU, 1GB RAM)
- **Storage**: $0.10/GB/month
- **Estimated Monthly Cost**: $35-50

---

### Option 4: Azure Kubernetes Service (AKS) - Enterprise

#### Benefits:

- **High availability** and scalability
- **Microservices** architecture ready
- **Advanced networking** and security
- **Integration** with Azure services
- **Production-grade** orchestration

#### Steps:

1. **Create AKS Cluster**

```bash
# Create AKS cluster
az aks create \
  --resource-group luxylyfe-rg \
  --name luxylyfe-aks \
  --node-count 2 \
  --node-vm-size Standard_B2s \
  --enable-addons monitoring \
  --generate-ssh-keys

# Get credentials
az aks get-credentials --resource-group luxylyfe-rg --name luxylyfe-aks
```

2. **Deploy Application**
   Create `k8s-deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: luxylyfe-app
spec:
  replicas: 2
  selector:
    matchLabels:
      app: luxylyfe
  template:
    metadata:
      labels:
        app: luxylyfe
    spec:
      containers:
        - name: luxylyfe
          image: luxylyferegistry.azurecr.io/luxylyfe:latest
          ports:
            - containerPort: 3000
          env:
            - name: DATABASE_URL
              value: "your_mongodb_connection"
            - name: JWT_SECRET
              value: "your_jwt_secret"
---
apiVersion: v1
kind: Service
metadata:
  name: luxylyfe-service
spec:
  type: LoadBalancer
  ports:
    - port: 80
      targetPort: 3000
  selector:
    app: luxylyfe
```

```bash
# Deploy to AKS
kubectl apply -f k8s-deployment.yaml
```

#### Cost Projection:

- **AKS Management**: Free
- **Node Pool (2x B2s)**: $60.74/month
- **Load Balancer**: $21.90/month
- **Storage**: $4.80/month (30GB)
- **Estimated Monthly Cost**: $87-120

---

### Option 5: Azure Functions (Serverless)

#### Benefits:

- **Pay-per-execution** model
- **Automatic scaling**
- **No server management**
- **Event-driven** architecture
- **Integration** with Azure services

#### Steps:

1. **Install Azure Functions Core Tools**

```bash
npm install -g azure-functions-core-tools@4 --unsafe-perm true
```

2. **Create Functions App**

```bash
# Create storage account
az storage account create --name luxylyfestore --resource-group luxylyfe-rg --location eastus --sku Standard_LRS

# Create function app
az functionapp create \
  --resource-group luxylyfe-rg \
  --consumption-plan-location eastus \
  --runtime node \
  --runtime-version 18 \
  --functions-version 4 \
  --name luxylyfe-functions \
  --storage-account luxylyfestore
```

3. **Deploy Function**

```bash
# Initialize function project
func init --worker-runtime node --language typescript

# Create HTTP function
func new --name HttpTrigger --template "HTTP trigger"

# Deploy to Azure
func azure functionapp publish luxylyfe-functions
```

#### Cost Projection:

- **Consumption Plan**: $0.20 per million executions + $0.000016/GB-s
- **Storage**: $2.40/month (estimated)
- **Estimated Monthly Cost**: $5-20 (low to medium traffic)

---

## Deployment Comparison Table

| Option              | Complexity | Scaling     | Management | Cost/Month | Best For                   |
| ------------------- | ---------- | ----------- | ---------- | ---------- | -------------------------- |
| Static Web Apps     | ⭐         | Auto        | Minimal    | $9-25      | JAMstack, Marketing sites  |
| App Service         | ⭐⭐       | Manual/Auto | Low        | $13-60     | Full web applications      |
| Container Instances | ⭐⭐⭐     | Manual      | Medium     | $35-50     | Containerized apps         |
| AKS                 | ⭐⭐⭐⭐⭐ | Auto        | High       | $87-120    | Enterprise, Microservices  |
| Functions           | ⭐⭐       | Auto        | Minimal    | $5-20      | API endpoints, Low traffic |

## Recommended Choice: Azure Static Web Apps

For your LuxyLyfe luxury real estate website, **Azure Static Web Apps** is the optimal choice because:

### ✅ **Perfect Fit:**

- **Next.js optimized** with excellent SSG support
- **Global CDN** for fast loading (crucial for luxury market)
- **Built-in authentication** for your admin/member system
- **Cost-effective** with generous free tier
- **Easy maintenance** with automated deployments

### 💰 **Cost Breakdown (Estimated Monthly):**

```
Static Web Apps Standard: $9/month
Custom Domain SSL: Included
CDN Bandwidth (10GB): $2/month
API Calls (100K): $0.20/month
------------------------
Total: ~$11.20/month
```

### 🚀 **Performance Benefits:**

- **Global Edge Locations**: Sub-100ms load times worldwide
- **Automatic Optimization**: Image compression, caching
- **SEO Friendly**: Perfect for luxury real estate marketing

## Migration Considerations

### **From AWS to Azure:**

- **Domain Transfer**: Update DNS records
- **Database**: Keep MongoDB Atlas (works with both)
- **Environment Variables**: Reconfigure in Azure
- **CI/CD**: Update GitHub Actions workflow

### **Hybrid Approach:**

- **Frontend**: Azure Static Web Apps
- **Database**: MongoDB Atlas
- **Images/Assets**: Azure CDN
- **Email**: Azure Communication Services

## Security and Compliance

### **Security Features:**

- **Azure Active Directory** integration
- **DDoS protection** included
- **WAF (Web Application Firewall)** available
- **SSL/TLS certificates** automated

### **Compliance:**

- **GDPR compliant** (important for real estate)
- **SOC 2 Type II** certified
- **ISO 27001** compliant

## Monitoring and Analytics

### **Application Insights:**

- **Performance monitoring**
- **User behavior analytics**
- **Error tracking**
- **Custom dashboards**

### **Cost Monitoring:**

- **Azure Cost Management**
- **Budget alerts**
- **Resource optimization recommendations**

## Getting Started Checklist

1. ✅ **Azure Account Setup**
2. ✅ **Choose deployment option** (Recommended: Static Web Apps)
3. ✅ **Prepare environment variables**
4. ✅ **Set up GitHub Actions workflow**
5. ✅ **Configure custom domain**
6. ✅ **Set up monitoring**
7. ✅ **Test production deployment**

## Next Steps

1. **Start with Azure Static Web Apps** free tier
2. **Monitor usage patterns** for 30 days
3. **Scale up** if needed based on traffic
4. **Add premium features** (custom authentication, advanced analytics)

Your LuxyLyfe application is perfectly suited for Azure's modern cloud platform, offering excellent performance for luxury real estate clients while maintaining cost efficiency.
