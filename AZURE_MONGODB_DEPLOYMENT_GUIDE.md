# 🏠 LuxyLyfe Azure Deployment Guide

## MongoDB Atlas + Azure Static Web Apps Complete Setup

### 📋 Prerequisites

- ✅ Azure Account (Free tier available)
- ✅ GitHub Account (for CI/CD)
- ✅ MongoDB Atlas in Azure (your existing instance)
- ✅ Domain name (optional, for custom branding)

---

## 🗄️ **STEP 1: Configure Azure MongoDB Atlas**

### 1.1 Access Your MongoDB Atlas

```bash
# Login to Azure Portal
https://portal.azure.com

# Search for "MongoDB Atlas" or navigate to your existing cluster
```

### 1.2 Create Database User for Production

```bash
# In MongoDB Atlas Dashboard:
# Go to Database Access → Add New Database User

Username: luxylyfe_prod_user
Password: [Generate strong password - SAVE THIS!]
Database User Privileges: Atlas admin
```

### 1.3 Configure Network Access for Azure

```bash
# In MongoDB Atlas Dashboard:
# Go to Network Access → Add IP Address

# For Azure Static Web Apps (Global):
IP Address: 0.0.0.0/0
Comment: Azure Static Web Apps - Global Access

# For production security (later):
# Add specific Azure datacenter IP ranges
```

### 1.4 Get Production Connection String

```bash
# In MongoDB Atlas Dashboard:
# Go to Databases → Connect → Connect your application

# Copy the connection string - it should look like:
mongodb+srv://luxylyfe_prod_user:YOUR_PASSWORD@your-cluster.xxxxx.mongodb.net/luxylyfe_prod_db?retryWrites=true&w=majority
```

---

## 🔧 **STEP 2: Prepare Your Code for Azure**

### 2.1 Configure Next.js for Azure Static Web Apps

```javascript
// next.config.js - Update for Azure deployment
/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // Remove output: 'export' for API routes to work
};

module.exports = nextConfig;
```

### 2.2 Create Azure Static Web Apps Configuration

```json
// staticwebapp.config.json (create in root directory)
{
  "routes": [
    {
      "route": "/api/*",
      "allowedRoles": ["anonymous"]
    },
    {
      "route": "/admin/*",
      "allowedRoles": ["anonymous"]
    }
  ],
  "navigationFallback": {
    "rewrite": "/index.html"
  },
  "platform": {
    "apiRuntime": "node:18"
  },
  "trailingSlash": "auto"
}
```

---

## 🚀 **STEP 3: Deploy to Azure Static Web Apps**

### 3.1 Push Code to GitHub

```bash
# Ensure your code is in GitHub
git add .
git commit -m "Prepare LuxyLyfe for Azure deployment"
git push origin main
```

### 3.2 Create Azure Static Web App (Azure Portal Method)

```bash
# 1. Go to Azure Portal → Create a resource
# 2. Search "Static Web Apps" → Create
# 3. Fill in details:
#    - Subscription: Your Azure subscription
#    - Resource Group: Create new "luxylyfe-rg"
#    - Name: "luxylyfe-webapp"
#    - Plan type: Free (for development) or Standard (for production)
#    - Region: East US 2 or your preferred region
#    - Source: GitHub
#    - Organization: Your GitHub username
#    - Repository: luxylyfe_project
#    - Branch: main
#    - Build Presets: Next.js
#    - App location: /
#    - Api location: /api
#    - Output location: .next
```

### 3.3 Configure Environment Variables

```bash
# In Azure Portal:
# Go to Static Web Apps → luxylyfe-webapp → Configuration → Environment variables

# Add these environment variables:
DATABASE_URL = mongodb+srv://luxylyfe_prod_user:YOUR_PASSWORD@your-cluster.xxxxx.mongodb.net/luxylyfe_prod_db?retryWrites=true&w=majority
NEXTAUTH_URL = https://luxylyfe-webapp.azurestaticapps.net
NEXTAUTH_SECRET = your-super-secure-nextauth-secret-here
JWT_SECRET = your-super-secure-jwt-secret-here
BCRYPT_ROUNDS = 12
```

---

## 🔄 **STEP 4: Initialize Production Database**

### 4.1 Run Production Setup Script

```bash
# Update your production MongoDB connection in .env.local temporarily
DATABASE_URL="mongodb+srv://luxylyfe_prod_user:YOUR_PASSWORD@your-cluster.xxxxx.mongodb.net/luxylyfe_prod_db?retryWrites=true&w=majority"

# Run production setup
node azure-production-setup.js

# Initialize database schema
npx prisma generate
npx prisma db push

# Seed production data
npm run prisma:seed
node seed-footer-content.js
```

---

## 🌐 **STEP 5: Configure Custom Domain (Optional)**

### 5.1 Add Custom Domain

```bash
# In Azure Portal:
# Go to Static Web Apps → luxylyfe-webapp → Custom domains
# Click "Add" → "Custom domain on other DNS"

# Domain: www.luxylyfe.com
# Validation: DNS TXT record
```

### 5.2 DNS Configuration

```bash
# Add these DNS records in your domain provider:

# TXT Record (for validation):
Name: asverify.www
Value: [Azure provides this value]

# CNAME Record (for custom domain):
Name: www
Value: luxylyfe-webapp.azurestaticapps.net
```

---

## 📊 **STEP 6: Monitoring and Performance**

### 6.1 Enable Application Insights

```bash
# In Azure Portal:
# Go to Static Web Apps → luxylyfe-webapp → Application Insights
# Click "Enable" → Create new Application Insights resource
```

### 6.2 Performance Optimization

```bash
# Add these optimizations:
# 1. Enable CDN for static assets
# 2. Configure image optimization
# 3. Enable compression
# 4. Set up monitoring alerts
```

---

## 💰 **Cost Estimation**

### Azure Static Web Apps Pricing:

```
Free Tier:
- 100GB bandwidth/month
- 0.5GB storage
- Custom domains included
- Global CDN included

Standard Tier: $9/month
- Additional bandwidth: $0.20/GB
- Premium features
- Advanced authentication

Monthly Cost Estimate: $0-25/month
```

### MongoDB Atlas Pricing:

```
M0 Free Tier:
- 512MB storage
- Shared RAM/CPU
- No cost

M2 Shared: $9/month
- 2GB storage
- Shared RAM/CPU

Monthly Cost Estimate: $0-9/month
```

**Total Monthly Cost: $0-34/month**

---

## ✅ **Deployment Checklist**

### Pre-Deployment:

- [ ] Azure account created
- [ ] MongoDB Atlas cluster accessible
- [ ] GitHub repository ready
- [ ] Environment variables documented
- [ ] Domain name purchased (optional)

### Deployment:

- [ ] Azure Static Web App created
- [ ] GitHub integration configured
- [ ] Environment variables set in Azure
- [ ] Production database initialized
- [ ] CI/CD pipeline working

### Post-Deployment:

- [ ] Custom domain configured (optional)
- [ ] SSL certificate working
- [ ] Application Insights enabled
- [ ] Performance monitoring active
- [ ] Backup strategy implemented

---

## 🔧 **Troubleshooting Common Issues**

### Build Failures:

```bash
# Check Node.js version in workflow
# Ensure all dependencies are in package.json
# Verify environment variables are set
```

### API Route Issues:

```bash
# Ensure staticwebapp.config.json is correct
# Check API routes are in /api directory
# Verify MongoDB connection string
```

### Authentication Problems:

```bash
# Check NEXTAUTH_URL matches deployed URL
# Verify JWT_SECRET is set
# Ensure cookie settings are correct
```

---

## 📞 **Next Steps After Deployment**

1. **Test thoroughly** - Check all features work in production
2. **Monitor performance** - Use Application Insights
3. **Set up backups** - Configure MongoDB Atlas backups
4. **Security review** - Update network access rules
5. **SEO optimization** - Add meta tags and sitemap
6. **Analytics** - Add Google Analytics or similar

---

## 🎯 **Production URLs**

```
Main Site: https://luxylyfe-webapp.azurestaticapps.net
Admin Login: https://luxylyfe-webapp.azurestaticapps.net/admin-login
Member Login: https://luxylyfe-webapp.azurestaticapps.net/member-login

With Custom Domain:
Main Site: https://www.luxylyfe.com
Admin Login: https://www.luxylyfe.com/admin-login
```

Your LuxyLyfe luxury real estate platform will be live on Azure with global CDN, automatic HTTPS, and enterprise-grade security! 🚀
