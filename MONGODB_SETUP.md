# MongoDB Atlas Setup Guide for LuxyLyfe

## 🌟 Quick Setup Steps

### 1. Create MongoDB Atlas Account

- Go to: https://cloud.mongodb.com
- Sign up for free account
- Verify your email

### 2. Create New Project

- Project Name: `LuxyLyfe`
- Add members if needed (optional)

### 3. Build Your Database

- Click "Build a Database"
- Choose **M0 FREE** tier
- **Cloud Provider**: AWS (recommended for your deployment)
- **Region**: Choose closest to you (e.g., us-east-1, us-west-2)
- **Cluster Name**: `luxylyfe-cluster`
- Click "Create Cluster"

### 4. Create Database User

- Go to **Database Access** (left sidebar)
- Click "Add New Database User"
- **Authentication Method**: Password
- **Username**: `luxylyfe_admin`
- **Password**: `LuxyAdmin2025!` (or generate secure password)
- **Database User Privileges**:
  - Built-in Role: "Read and write to any database"
- Click "Add User"

### 5. Configure Network Access

- Go to **Network Access** (left sidebar)
- Click "Add IP Address"
- For development: "Allow Access from Anywhere" (0.0.0.0/0)
- For production: Add your specific IP addresses
- Click "Confirm"

### 6. Get Connection String

- Go to **Databases** (left sidebar)
- Click "Connect" on your cluster
- Choose "Connect your application"
- **Driver**: Node.js
- **Version**: 4.1 or later
- Copy the connection string (looks like):
  ```
  mongodb+srv://luxylyfe_admin:<password>@luxylyfe-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
  ```

### 7. Update Your .env File

Replace the DATABASE_URL in your .env file with:

```env
DATABASE_URL="mongodb+srv://luxylyfe_admin:LuxyAdmin2025!@luxylyfe-cluster.xxxxx.mongodb.net/luxylyfe_db?retryWrites=true&w=majority"
```

**Important**: Replace `xxxxx` with your actual cluster identifier from the connection string.

## 🔧 Alternative: Local MongoDB

If you prefer to install MongoDB locally:

### Install MongoDB Community Server

1. Download from: https://www.mongodb.com/try/download/community
2. Install with default settings
3. Start MongoDB service
4. Use this connection string:
   ```env
   DATABASE_URL="mongodb://localhost:27017/luxylyfe_db"
   ```

## 🚀 After Setup

Once you have your DATABASE_URL configured:

1. Generate Prisma client: `npx prisma generate`
2. Push database schema: `npx prisma db push`
3. Seed initial data: `npm run db:seed`
4. Test your application: `npm run dev`

## 🌍 Benefits of MongoDB Atlas

- ✅ **Free Tier**: 512 MB storage, shared RAM
- ✅ **Cloud-based**: No local installation needed
- ✅ **Scalable**: Easy to upgrade as you grow
- ✅ **AWS Integration**: Perfect for your AWS deployment
- ✅ **Automatic Backups**: Built-in backup and recovery
- ✅ **Global Deployment**: Multiple regions available
- ✅ **Security**: Built-in authentication and encryption

## 🔐 Security Best Practices

- Use strong passwords for database users
- Restrict IP access in production
- Use environment variables for sensitive data
- Enable MongoDB Atlas security features
- Regular security updates

Your MongoDB setup will be much more suitable for cloud deployment than local PostgreSQL!
