# 🔄 MongoDB Atlas to Azure Cosmos DB Migration Guide

## LuxyLyfe Database Migration Strategy

### 🎯 Why Migrate to Azure Cosmos DB?

#### **Benefits of Azure Cosmos DB:**

✅ **Native Azure Integration** - Seamless with Azure services  
✅ **Global Distribution** - Multi-region replication  
✅ **Auto-scaling** - Automatic throughput scaling  
✅ **SLA Guarantees** - 99.999% availability  
✅ **MongoDB Compatibility** - Uses MongoDB API  
✅ **Better Security** - Azure AD integration  
✅ **Cost Optimization** - Serverless and provisioned options

---

## 📋 **Migration Prerequisites**

### Current Environment Check:

```bash
# Check your current data
node view-content.js
node view-properties.js

# Current MongoDB Atlas Connection:
# mongodb+srv://username:password@cluster.mongodb.net/luxylyfe_db
```

### Required Tools:

- Azure CLI
- MongoDB Database Tools
- Azure Data Migration Service (optional)
- Azure Cosmos DB Data Migration Tool

---

## 🗄️ **STEP 1: Create Azure Cosmos DB**

### 1.1 Create Cosmos DB Account (Azure Portal)

```bash
# In Azure Portal:
# 1. Create a resource → Azure Cosmos DB
# 2. Select API: Azure Cosmos DB for MongoDB
# 3. Configuration:
#    - Account Name: luxylyfe-cosmosdb
#    - API: Azure Cosmos DB for MongoDB
#    - Resource Group: luxylyfe-rg
#    - Location: East US 2 (or your preferred region)
#    - Capacity mode: Provisioned throughput (or Serverless for dev)
#    - Apply Free Tier Discount: Yes (if available)
#    - Backup Policy: Continuous backup
```

### 1.2 Create Cosmos DB via Azure CLI

```bash
# Login to Azure
az login

# Create resource group (if not exists)
az group create --name luxylyfe-rg --location eastus2

# Create Cosmos DB account
az cosmosdb create \
  --name luxylyfe-cosmosdb \
  --resource-group luxylyfe-rg \
  --kind MongoDB \
  --server-version 4.2 \
  --default-consistency-level Session \
  --locations regionName=eastus2 failoverPriority=0 isZoneRedundant=False \
  --enable-free-tier true

# Create database
az cosmosdb mongodb database create \
  --account-name luxylyfe-cosmosdb \
  --resource-group luxylyfe-rg \
  --name luxylyfe_db

# Create collections with proper throughput
az cosmosdb mongodb collection create \
  --account-name luxylyfe-cosmosdb \
  --resource-group luxylyfe-rg \
  --database-name luxylyfe_db \
  --name User \
  --throughput 400

az cosmosdb mongodb collection create \
  --account-name luxylyfe-cosmosdb \
  --resource-group luxylyfe-rg \
  --database-name luxylyfe_db \
  --name Property \
  --throughput 400

az cosmosdb mongodb collection create \
  --account-name luxylyfe-cosmosdb \
  --resource-group luxylyfe-rg \
  --database-name luxylyfe_db \
  --name PageContent \
  --throughput 400

az cosmosdb mongodb collection create \
  --account-name luxylyfe-cosmosdb \
  --resource-group luxylyfe-rg \
  --database-name luxylyfe_db \
  --name SiteSettings \
  --throughput 400
```

### 1.3 Get Cosmos DB Connection String

```bash
# Get connection string
az cosmosdb keys list --name luxylyfe-cosmosdb --resource-group luxylyfe-rg --type connection-strings

# Connection string format:
# mongodb://luxylyfe-cosmosdb:PRIMARY_KEY@luxylyfe-cosmosdb.mongo.cosmos.azure.com:10255/luxylyfe_db?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@luxylyfe-cosmosdb@
```

---

## 📊 **STEP 2: Data Export from MongoDB Atlas**

### 2.1 Install MongoDB Database Tools

```bash
# Windows (via Chocolatey)
choco install mongodb-database-tools

# Or download from: https://www.mongodb.com/try/download/database-tools
```

### 2.2 Export Current Data

```bash
# Export all collections from MongoDB Atlas
mongodump --uri="mongodb+srv://username:password@cluster.mongodb.net/luxylyfe_db" --out="./mongodb_backup"

# Or export individual collections
mongoexport --uri="mongodb+srv://username:password@cluster.mongodb.net/luxylyfe_db" --collection=User --out=users.json
mongoexport --uri="mongodb+srv://username:password@cluster.mongodb.net/luxylyfe_db" --collection=Property --out=properties.json
mongoexport --uri="mongodb+srv://username:password@cluster.mongodb.net/luxylyfe_db" --collection=PageContent --out=content.json
mongoexport --uri="mongodb+srv://username:password@cluster.mongodb.net/luxylyfe_db" --collection=SiteSettings --out=settings.json
```

---

## ⬆️ **STEP 3: Data Import to Azure Cosmos DB**

### 3.1 Import Using mongoimport

```bash
# Import to Cosmos DB (replace with your actual connection string)
COSMOS_CONNECTION="mongodb://luxylyfe-cosmosdb:PRIMARY_KEY@luxylyfe-cosmosdb.mongo.cosmos.azure.com:10255/luxylyfe_db?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@luxylyfe-cosmosdb@"

# Import collections
mongoimport --uri="$COSMOS_CONNECTION" --collection=User --file=users.json
mongoimport --uri="$COSMOS_CONNECTION" --collection=Property --file=properties.json
mongoimport --uri="$COSMOS_CONNECTION" --collection=PageContent --file=content.json
mongoimport --uri="$COSMOS_CONNECTION" --collection=SiteSettings --file=settings.json

# Or use mongorestore for full backup
mongorestore --uri="$COSMOS_CONNECTION" ./mongodb_backup
```

### 3.2 Alternative: Azure Data Migration Service

```bash
# For large datasets, use Azure Database Migration Service
# 1. Go to Azure Portal → Database Migration Services
# 2. Create migration project
# 3. Configure source (MongoDB Atlas) and target (Cosmos DB)
# 4. Run migration with minimal downtime
```

---

## 🔧 **STEP 4: Update Application Configuration**

### 4.1 Update Prisma Schema (if needed)

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

// Models remain the same - Cosmos DB MongoDB API is compatible
```

### 4.2 Update Environment Variables

```bash
# .env.local - Update for Cosmos DB
DATABASE_URL="mongodb://luxylyfe-cosmosdb:PRIMARY_KEY@luxylyfe-cosmosdb.mongo.cosmos.azure.com:10255/luxylyfe_db?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@luxylyfe-cosmosdb@"

# Production environment variables in Azure Static Web Apps
DATABASE_URL = mongodb://luxylyfe-cosmosdb:PRIMARY_KEY@luxylyfe-cosmosdb.mongo.cosmos.azure.com:10255/luxylyfe_db?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@luxylyfe-cosmosdb@
NEXTAUTH_URL = https://luxylyfe-webapp.azurestaticapps.net
NEXTAUTH_SECRET = your-super-secure-nextauth-secret-here
JWT_SECRET = your-super-secure-jwt-secret-here
BCRYPT_ROUNDS = 12
```

### 4.3 Test Connection Script

```javascript
// test-cosmos-db-connection.js
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testCosmosDBConnection() {
  try {
    console.log("🔗 Testing Azure Cosmos DB Connection...\n");

    await prisma.$connect();
    console.log("✅ Successfully connected to Azure Cosmos DB!");

    // Test collections
    const userCount = await prisma.user.count();
    const propertyCount = await prisma.property.count();
    const contentCount = await prisma.pageContent.count();
    const settingsCount = await prisma.siteSettings.count();

    console.log("\n📊 Data Migration Results:");
    console.log(`  Users: ${userCount}`);
    console.log(`  Properties: ${propertyCount}`);
    console.log(`  Content: ${contentCount}`);
    console.log(`  Settings: ${settingsCount}`);

    console.log("\n🎉 Migration successful!");
    console.log("\n📝 Azure Cosmos DB Details:");
    console.log("   Database: Azure Cosmos DB (MongoDB API)");
    console.log("   Status: Connected");
    console.log("   All collections: Accessible");
  } catch (error) {
    console.error("❌ Connection failed:", error.message);
    console.log("\n🔧 Troubleshooting:");
    console.log("1. Check your Cosmos DB connection string");
    console.log("2. Verify firewall settings in Azure Portal");
    console.log("3. Ensure SSL is enabled");
  } finally {
    await prisma.$disconnect();
  }
}

testCosmosDBConnection();
```

---

## 🚀 **STEP 5: Performance Optimization**

### 5.1 Configure Throughput

```bash
# Optimize collection throughput based on usage
az cosmosdb mongodb collection throughput update \
  --account-name luxylyfe-cosmosdb \
  --resource-group luxylyfe-rg \
  --database-name luxylyfe_db \
  --name User \
  --throughput 400

# Enable autoscale for production
az cosmosdb mongodb collection throughput update \
  --account-name luxylyfe-cosmosdb \
  --resource-group luxylyfe-rg \
  --database-name luxylyfe_db \
  --name Property \
  --max-throughput 4000
```

### 5.2 Create Indexes for Performance

```javascript
// cosmos-db-indexes.js - Create optimal indexes
const { MongoClient } = require("mongodb");

async function createIndexes() {
  const client = new MongoClient(process.env.DATABASE_URL);

  try {
    await client.connect();
    const db = client.db("luxylyfe_db");

    // User collection indexes
    await db.collection("User").createIndex({ email: 1 }, { unique: true });
    await db.collection("User").createIndex({ role: 1 });

    // Property collection indexes
    await db.collection("Property").createIndex({ propertyType: 1 });
    await db.collection("Property").createIndex({ isFeatured: 1 });
    await db.collection("Property").createIndex({ price: 1 });

    // Content collection indexes
    await db
      .collection("PageContent")
      .createIndex({ pageType: 1, sectionType: 1 });
    await db.collection("PageContent").createIndex({ isActive: 1 });

    console.log("✅ Indexes created successfully");
  } finally {
    await client.close();
  }
}

createIndexes();
```

---

## 💰 **Cost Comparison & Optimization**

### MongoDB Atlas vs Azure Cosmos DB:

```
MongoDB Atlas M0 (Free):
- 512MB storage
- Shared resources
- Limited connections
- Cost: $0/month

Azure Cosmos DB (Free Tier):
- 1000 RU/s throughput
- 25GB storage
- Cost: $0/month (first 1000 RU/s + 25GB free)

MongoDB Atlas M2:
- 2GB storage
- Shared resources
- Cost: ~$9/month

Azure Cosmos DB (Provisioned):
- 400 RU/s per collection
- Pay for actual usage
- Cost: ~$24/month (400 RU/s x 4 collections)

Azure Cosmos DB (Serverless):
- Pay per request
- No minimum throughput
- Cost: ~$0.25 per million requests
```

### Cost Optimization Strategies:

```bash
# 1. Use shared throughput at database level
az cosmosdb mongodb database throughput update \
  --account-name luxylyfe-cosmosdb \
  --resource-group luxylyfe-rg \
  --name luxylyfe_db \
  --throughput 400

# 2. Enable autoscale
# 3. Use serverless for development
# 4. Monitor with Azure Cost Management
```

---

## 🔄 **STEP 6: Migration Execution Plan**

### 6.1 Zero-Downtime Migration Strategy:

```bash
# Phase 1: Setup and Test (Development)
1. Create Cosmos DB instance
2. Export small dataset for testing
3. Import to Cosmos DB
4. Test application functionality
5. Performance testing

# Phase 2: Full Migration (Staging)
1. Export complete dataset from MongoDB Atlas
2. Import to Cosmos DB
3. Update application configuration
4. End-to-end testing

# Phase 3: Production Cutover
1. Schedule maintenance window
2. Final data sync
3. Update DNS/configuration
4. Monitor application health
5. Rollback plan ready
```

### 6.2 Rollback Plan:

```bash
# Keep MongoDB Atlas running during migration
# Quick rollback by updating environment variables
# Data sync scripts for bidirectional updates
```

---

## ✅ **Migration Checklist**

### Pre-Migration:

- [ ] Azure Cosmos DB account created
- [ ] Connection string obtained
- [ ] Data export completed
- [ ] Test environment setup
- [ ] Performance benchmarks established

### Migration:

- [ ] Data imported to Cosmos DB
- [ ] Indexes created
- [ ] Application configuration updated
- [ ] Connection testing successful
- [ ] Performance validation complete

### Post-Migration:

- [ ] Monitoring enabled
- [ ] Cost optimization applied
- [ ] Backup strategy implemented
- [ ] Security settings configured
- [ ] Documentation updated
- [ ] Atlas vs Cosmos comparison clean (`npm run db:compare`)
- [ ] Incremental sync run during freeze window
- [ ] Application `DATABASE_URL` switched to Cosmos
- [ ] Rollback plan validated

---

## 🛠️ **Migration Automation Script**

```bash
#!/bin/bash

# LuxyLyfe MongoDB Atlas to Cosmos DB Migration
echo "🔄 Starting MongoDB Atlas to Cosmos DB Migration"

# Step 1: Verify prerequisites
echo "📋 Checking prerequisites..."
command -v az >/dev/null 2>&1 || { echo "Azure CLI required"; exit 1; }
command -v mongodump >/dev/null 2>&1 || { echo "MongoDB tools required"; exit 1; }

# Step 2: Export from Atlas
echo "📤 Exporting data from MongoDB Atlas..."
mongodump --uri="$ATLAS_CONNECTION_STRING" --out="./atlas_backup"

# Step 3: Import to Cosmos DB
echo "📥 Importing data to Azure Cosmos DB..."
mongorestore --uri="$COSMOS_CONNECTION_STRING" ./atlas_backup

# Step 4: Verify migration
echo "✅ Verifying migration..."
node test-cosmos-db-connection.js

echo "🎉 Migration completed successfully!"
```

---

## 📊 **Benefits After Migration**

### Performance Benefits:

- **Lower latency** with Azure region proximity
- **Auto-scaling** handles traffic spikes
- **Global distribution** for worldwide users

### Integration Benefits:

- **Azure AD authentication** integration
- **Azure Monitor** for comprehensive monitoring
- **Azure Security Center** for threat protection

### Cost Benefits:

- **Free tier** covers development needs
- **Serverless option** for variable workloads
- **Reserved capacity** discounts for production

Your LuxyLyfe application will have native Azure integration with enterprise-grade performance and security! 🚀

**Would you like to proceed with the migration?** I can help you through each step of the process.

---

## 🔁 Operational Cutover Procedure (Zero / Minimal Downtime)

### 1. Pre-Cutover (T-24h)

1. Run full export + import (already covered)
2. Run: `npm run db:compare` – ensure counts match
3. Fix mismatches with: `npm run db:sync:incremental` (repeat until clean)

### 2. Change Freeze (T-30m)

1. Announce brief read-only window (if needed)
2. Stop background jobs that write (if any)
3. Last incremental sync with date filter:

```
node incremental-sync-to-cosmos.js --since=2025-09-13T00:00:00Z
```

4. Final compare:

```
npm run db:compare
```

### 3. Switch (T0)

1. Backup `.env.local` → `.env.local.pre-cosmos`
2. Replace `DATABASE_URL` with Cosmos connection string
3. Deploy updated env to Azure (Static Web Apps / App Service settings)
4. Warm app (hit health/page)
5. Run `node test-cosmos-db-connection.js`

### 4. Post-Switch Validation (T+10m)

1. Sanity browse: public pages, login, CRUD in admin
2. Monitor Azure Metrics: RU/s consumption, latency, throttles
3. Create a test user/property → confirm appears in Cosmos (NOT in Atlas unless dual-write)

### 5. Observation Window (T+24h)

1. Keep MongoDB Atlas in read-only standby (do NOT delete)
2. If severe issue: revert by restoring previous `DATABASE_URL`

### 6. Decommission (T+7d - T+30d)

1. Final backup of Atlas
2. Archive backup to secure storage
3. Remove Atlas users / IP rules
4. Close or downgrade Atlas cluster

---

## 🔄 Incremental Sync & Verification Tools

| Script                          | Purpose                                        |
| ------------------------------- | ---------------------------------------------- |
| `migrate-to-cosmos-db.sh`       | First-time bulk migration automation           |
| `compare-databases.js`          | Count & field shape comparison Atlas vs Cosmos |
| `incremental-sync-to-cosmos.js` | Upsert new/updated docs since timestamp        |
| `test-cosmos-db-connection.js`  | Smoke test Prisma connectivity                 |
| `create-cosmos-db-indexes.js`   | Create performance indexes                     |

### Add Required Variables to `.env.local`

```
ATLAS_URL="<original MongoDB Atlas connection>"
COSMOS_URL="<cosmos mongo api connection>"
```

### Typical Workflow Loop

```
npm run db:compare
npm run db:sync:incremental -- --since=2025-09-13T00:00:00Z
npm run db:compare
```

If counts diverge repeatedly, inspect sample docs:

```
mongosh "$ATLAS_URL" --eval 'db.Property.findOne()'
mongosh "$COSMOS_URL" --eval 'db.Property.findOne()'
```

---

## 🧪 Post-Migration QA Scenarios

| Area        | Test                       | Expectation                         |
| ----------- | -------------------------- | ----------------------------------- |
| Auth        | Login as ADMIN             | Token/session stored; no errors     |
| CRUD        | Create Property            | Appears immediately in Cosmos query |
| CMS         | Update PageContent section | Updated `updatedAt` reflected       |
| Settings    | Toggle public flag         | Visible effect in frontend fetch    |
| Performance | First page load            | Latency comparable or improved      |

---

## 🛡️ Rollback Playbook (Quick Reference)

1. Restore `.env.local.pre-cosmos` (or previous secret in Azure)
2. Redeploy application
3. Verify Atlas still current (if dual writes not used, accept short data gap)
4. Log incident & root cause before retrying migration

---

## 📈 Monitoring & Alerting (Post-Cutover)

Configure in Azure Portal:

1. RU Consumption > 70% sustained → scale / enable autoscale
2. Throttled Requests > 0 → investigate hot partition / indexes
3. Availability < 99.99% (monthly) → open Azure support ticket
4. Latency (P95) rising → review query patterns, indexes

---

## 🧾 Partitioning (Future Scaling Consideration)

Current small dataset fits single logical partition. When property count grows (>20GB or high RU hot spots), consider redesign with a synthetic partition key (e.g., city, state, or hashed propertyId) in a new collection version.

---

## ✅ Ready to Execute

Run initial comparison after bulk migration:

```
npm run db:compare
```

Proceed with incremental sync loop until fully in sync, then perform cutover steps above.

---

Need hands-on cutover assistance? Ask and we can script the exact date-stamped sync + validation commands.
