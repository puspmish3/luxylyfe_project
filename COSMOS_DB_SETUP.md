# Azure Cosmos DB SQL API Configuration Guide

## 🔄 Hybrid Database Strategy: MongoDB Atlas + Cosmos DB SQL API

Since Prisma doesn't directly support Azure Cosmos DB SQL API, we use a hybrid approach:

- **Prisma + MongoDB Atlas**: For ORM-based operations (existing code)
- **Azure Cosmos SDK**: For direct Cosmos DB operations (new features)

### 1. Get Your Cosmos DB SQL API Configuration

From Azure Portal:

1. Go to your Cosmos DB account (SQL API)
2. Click "Keys" in the left menu
3. Copy the following values:
   - **URI** → Use for `COSMOS_DB_ENDPOINT`
   - **PRIMARY KEY** → Use for `COSMOS_DB_KEY`

Example format:

```
COSMOS_DB_ENDPOINT="https://YOUR_ACCOUNT.documents.azure.com:443/"
COSMOS_DB_KEY="very-long-primary-key-from-azure-portal"
COSMOS_DB_DATABASE_NAME="luxylyfe_db"
```

### 2. Update Your Environment Variables

Your `.env.local` should now have:

```bash
# Primary Database (MongoDB Atlas - for Prisma ORM)
DATABASE_URL="mongodb+srv://user:pass@cluster.mongodb.net/luxylyfe_db?retryWrites=true&w=majority"

# Secondary Database (Azure Cosmos DB SQL API - for direct operations)
COSMOS_DB_ENDPOINT="https://YOUR_ACCOUNT.documents.azure.com:443/"
COSMOS_DB_KEY="YOUR_PRIMARY_KEY"
COSMOS_DB_DATABASE_NAME="luxylyfe_db"
```

### 3. Test Your Configuration

```bash
# Test Cosmos DB SQL API connection
npm run db:test-cosmos-sql

# Show configuration format if needed
npm run db:cosmos-format

# Test MongoDB Atlas connection (existing)
npm run db:setup-cosmos
```

### 4. Using the Hybrid Approach

**For existing operations (use Prisma as before):**

```typescript
import { prisma } from "../lib/prisma";

// Continue using Prisma for MongoDB Atlas
const users = await prisma.user.findMany();
```

**For new Cosmos DB operations:**

```typescript
import { cosmosModels } from "../lib/cosmos";

// Use Cosmos SDK for SQL API operations
const users = await cosmosModels.users.count();
const properties = await cosmosModels.properties.findAvailable();
```

### 5. Migration Strategy Options

**Option A: Keep Both (Recommended for now)**

- Continue using MongoDB Atlas for existing features
- Use Cosmos DB for new features or analytics
- Gradually migrate specific features to Cosmos DB

**Option B: Full Migration to Cosmos DB**

- Requires rewriting Prisma queries to use Cosmos SDK
- More work but better Azure integration
- Consider migrating to Cosmos DB for MongoDB API instead

**Option C: Switch to Cosmos DB for MongoDB API**

- Recreate your Cosmos DB account with MongoDB API
- Keep using Prisma with minimal changes
- Best of both worlds

## 🔧 Troubleshooting

### Common Issues:

1. **Authentication Failed**

   - Check username/password in connection string
   - Verify user exists in Cosmos DB
   - Ensure user has read/write permissions

2. **Network Timeout**

   - Check firewall rules in Azure Portal
   - Add your IP address to allowed list
   - Temporarily allow all IPs (0.0.0.0/0) for testing

3. **SSL/TLS Errors**

   - Ensure `ssl=true` in connection string
   - Try adding `&tlsInsecure=true` for testing (not recommended for production)

4. **Connection Pool Issues**
   - Adjust `maxIdleTimeMS` parameter
   - Add `&serverSelectionTimeoutMS=30000`

### Connection String Parameters:

| Parameter               | Purpose                 | Cosmos DB Recommended |
| ----------------------- | ----------------------- | --------------------- |
| `ssl=true`              | Enable SSL/TLS          | ✅ Required           |
| `retryWrites=true`      | Enable write retries    | ✅ Recommended        |
| `maxIdleTimeMS=120000`  | Connection timeout      | ✅ Recommended        |
| `appName=@ACCOUNT@`     | Application identifier  | ✅ Auto-set           |
| `authSource=admin`      | Authentication database | ⚠️ If needed          |
| `directConnection=true` | Skip server discovery   | ⚠️ For single server  |

## 📊 Verification Steps

After configuration:

1. ✅ Connection test passes
2. ✅ All collections accessible
3. ✅ CRUD operations working
4. ✅ Application starts without errors
5. ✅ Data migration completed (if applicable)

## 🔄 Rollback Plan

If issues occur, revert to MongoDB Atlas:

1. Restore previous `.env.local` configuration
2. Update `DATABASE_URL` back to Atlas connection string
3. Restart application
4. Verify functionality

## 🚀 Production Deployment

For Azure App Service deployment:

1. Set `DATABASE_URL` in App Service Configuration
2. Ensure Cosmos DB allows App Service IP ranges
3. Use managed identity for enhanced security (future enhancement)
4. Enable monitoring and diagnostics

## 📞 Support

- Azure Cosmos DB Documentation: https://docs.microsoft.com/azure/cosmos-db/
- Prisma MongoDB Guide: https://www.prisma.io/docs/concepts/database-connectors/mongodb
- Project Issues: Use GitHub Issues for project-specific problems

## 🎯 Next Steps

1. **Get your actual credentials** from Azure Portal → Your Cosmos DB Account → Keys
2. **Update .env.local** with your real values (replace the placeholder ones)
3. **Test the connection**: `npm run db:test-cosmos-sql`
4. **View usage examples**: Check `examples/hybrid-database-usage.ts`
5. **Decide on strategy**:
   - Keep hybrid approach (both databases)
   - Full migration to Cosmos DB SQL API
   - Switch to Cosmos DB for MongoDB API (if preferred)

**✅ Your hybrid database setup is ready! Just add your real Cosmos DB credentials to get started.**
