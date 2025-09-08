# AWS Deployment Guide for LuxyLyfe Web Application

## Overview

This guide provides multiple options to deploy your Next.js LuxyLyfe application on AWS, ranging from simple to advanced setups.

## Prerequisites

- AWS Account
- AWS CLI installed and configured
- Node.js 18+ installed
- MongoDB Atlas database (already configured)

## Deployment Options

### Option 1: AWS Amplify (Recommended for Quick Deployment)

#### Benefits:

- Easiest deployment method
- Automatic CI/CD pipeline
- Built-in SSL certificate
- Global CDN
- Automatic scaling

#### Steps:

1. **Prepare your repository**

```bash
# Push your code to GitHub/GitLab/CodeCommit
git add .
git commit -m "Prepare for AWS deployment"
git push origin main
```

2. **Deploy with AWS Amplify**
   - Go to AWS Amplify Console
   - Click "New app" → "Host web app"
   - Connect your repository (GitHub/GitLab)
   - Select branch (main)
   - Configure build settings:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - "**/*"
  cache:
    paths:
      - node_modules/**/*
```

3. **Set Environment Variables in Amplify**
   - Go to App Settings → Environment variables
   - Add your environment variables:
     ```
     DATABASE_URL=your_mongodb_atlas_connection_string
     JWT_SECRET=your_jwt_secret
     NEXTAUTH_URL=your_amplify_domain
     NEXTAUTH_SECRET=your_nextauth_secret
     ```

### Option 2: AWS EC2 with PM2 (Full Control)

#### Benefits:

- Full server control
- Cost-effective for consistent traffic
- Custom configuration possible

#### Steps:

1. **Create EC2 Instance**

```bash
# Launch Ubuntu 22.04 LTS instance
# Configure security group (ports 22, 80, 443, 3000)
```

2. **Connect and Setup Server**

```bash
# Connect to EC2
ssh -i your-key.pem ubuntu@your-ec2-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y
```

3. **Deploy Application**

```bash
# Clone your repository
git clone https://your-repo-url.git
cd luxylyfe_project

# Install dependencies
npm install

# Build application
npm run build

# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'luxylyfe',
    script: 'npm',
    args: 'start',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      DATABASE_URL: 'your_mongodb_atlas_url',
      JWT_SECRET: 'your_jwt_secret',
      NEXTAUTH_URL: 'https://your-domain.com',
      NEXTAUTH_SECRET: 'your_nextauth_secret'
    }
  }]
}
EOF

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

4. **Configure Nginx**

```bash
sudo nano /etc/nginx/sites-available/luxylyfe

# Add this configuration:
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/luxylyfe /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

5. **Setup SSL with Let's Encrypt**

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### Option 3: AWS ECS with Fargate (Containerized)

#### Benefits:

- Scalable containerized deployment
- No server management
- Cost-effective for variable traffic

#### Steps:

1. **Create Dockerfile**

```dockerfile
# Create Dockerfile in project root
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

2. **Update next.config.js for standalone build**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
};

module.exports = nextConfig;
```

3. **Build and Push to ECR**

```bash
# Create ECR repository
aws ecr create-repository --repository-name luxylyfe

# Get login token
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin your-account-id.dkr.ecr.us-east-1.amazonaws.com

# Build and push
docker build -t luxylyfe .
docker tag luxylyfe:latest your-account-id.dkr.ecr.us-east-1.amazonaws.com/luxylyfe:latest
docker push your-account-id.dkr.ecr.us-east-1.amazonaws.com/luxylyfe:latest
```

4. **Create ECS Task Definition and Service**
   - Use AWS Console or CLI to create ECS cluster
   - Create task definition with your ECR image
   - Set environment variables
   - Create service with Application Load Balancer

### Option 4: AWS Lambda + API Gateway (Serverless)

#### Benefits:

- Pay per request
- Automatic scaling
- No server management

#### Steps:

1. **Install Serverless Framework**

```bash
npm install -g serverless
npm install serverless-nextjs-plugin
```

2. **Configure serverless.yml**

```yaml
service: luxylyfe

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1

plugins:
  - serverless-nextjs-plugin

custom:
  nextjs:
    memory: 1024
    timeout: 30
    environment:
      DATABASE_URL: ${env:DATABASE_URL}
      JWT_SECRET: ${env:JWT_SECRET}
      NEXTAUTH_URL: ${env:NEXTAUTH_URL}
      NEXTAUTH_SECRET: ${env:NEXTAUTH_SECRET}
```

3. **Deploy**

```bash
serverless deploy
```

## Environment Variables Setup

Create a `.env.production` file:

```env
# Database
DATABASE_URL=your_mongodb_atlas_connection_string

# Authentication
JWT_SECRET=your_super_secure_jwt_secret_at_least_32_characters
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your_nextauth_secret

# Optional: Email configuration
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
```

## Domain and DNS Setup

1. **Purchase Domain** (if needed)

   - Use Route 53 or external provider

2. **Configure DNS**
   - Point domain to your deployment:
     - Amplify: Use provided CloudFront URL
     - EC2: Use Elastic IP
     - ECS: Use Application Load Balancer
     - Lambda: Use API Gateway custom domain

## Security Considerations

1. **Environment Variables**

   - Never commit sensitive data to Git
   - Use AWS Systems Manager Parameter Store or Secrets Manager

2. **Database Security**

   - Whitelist deployment IP addresses in MongoDB Atlas
   - Use strong connection strings

3. **SSL/TLS**
   - Always use HTTPS in production
   - Set up proper SSL certificates

## Cost Estimation

| Option       | Monthly Cost (estimate) |
| ------------ | ----------------------- |
| Amplify      | $15-50                  |
| EC2 t3.small | $15-25                  |
| ECS Fargate  | $20-60                  |
| Lambda       | $5-30                   |

## Monitoring and Maintenance

1. **CloudWatch Monitoring**

   - Set up logs and metrics
   - Configure alarms

2. **Backup Strategy**

   - MongoDB Atlas automatic backups
   - Code repository backups

3. **Updates**
   - Regular security updates
   - Dependency updates

## Quick Start Commands

Choose your preferred deployment method and run:

```bash
# Option 1: Amplify (Manual)
# Follow AWS Console steps above

# Option 2: EC2 with Terraform (Advanced)
# Use infrastructure as code

# Option 3: One-click Amplify deployment
npx create-next-app@latest --example with-mongodb luxylyfe-aws
```

## Support and Troubleshooting

Common issues and solutions:

1. **Build Failures**

   - Check Node.js version compatibility
   - Verify environment variables
   - Review build logs

2. **Database Connection**

   - Verify MongoDB Atlas whitelist
   - Check connection string format
   - Test network connectivity

3. **Performance Issues**
   - Enable caching
   - Optimize images
   - Use CDN for static assets

## Next Steps

After deployment:

1. Set up monitoring
2. Configure backups
3. Set up CI/CD pipeline
4. Implement logging
5. Add performance monitoring

Choose the deployment option that best fits your needs and budget. I recommend starting with AWS Amplify for simplicity, then migrating to EC2 or ECS as your requirements grow.
