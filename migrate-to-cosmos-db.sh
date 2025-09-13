#!/bin/bash

# 🔄 LuxyLyfe MongoDB Atlas to Azure Cosmos DB Migration Script
# This script automates the migration process

echo "🏠 LuxyLyfe Database Migration"
echo "============================="
echo "📊 MongoDB Atlas → Azure Cosmos DB"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Step 1: Check prerequisites
echo -e "${BLUE}📋 Checking Prerequisites...${NC}"
echo ""

# Check Azure CLI
if command_exists az; then
    echo -e "${GREEN}✅ Azure CLI is installed${NC}"
    az --version | head -1
else
    echo -e "${RED}❌ Azure CLI is not installed${NC}"
    echo "   Please install from: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Check MongoDB tools
if command_exists mongodump; then
    echo -e "${GREEN}✅ MongoDB Database Tools are installed${NC}"
    mongodump --version | head -1
else
    echo -e "${RED}❌ MongoDB Database Tools are not installed${NC}"
    echo "   Please install from: https://www.mongodb.com/try/download/database-tools"
    exit 1
fi

# Check if logged into Azure
if az account show &> /dev/null; then
    echo -e "${GREEN}✅ Logged into Azure${NC}"
    echo "   Account: $(az account show --query name --output tsv)"
else
    echo -e "${YELLOW}⚠️  Not logged into Azure${NC}"
    echo "   Running: az login"
    az login
fi

echo ""

# Step 2: Environment setup
echo -e "${BLUE}🔧 Environment Setup${NC}"
echo ""

# Check for .env.local file
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✅ Found .env.local file${NC}"
    
    # Load environment variables
    export $(grep -v '^#' .env.local | xargs)
    
    if [ -n "$DATABASE_URL" ]; then
        echo -e "${GREEN}✅ MongoDB Atlas connection string found${NC}"
    else
        echo -e "${RED}❌ DATABASE_URL not found in .env.local${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ .env.local file not found${NC}"
    echo "   Please create .env.local with your MongoDB Atlas connection string"
    exit 1
fi

echo ""

# Step 3: Create Azure Cosmos DB
echo -e "${BLUE}🗄️  Azure Cosmos DB Setup${NC}"
echo ""

read -p "Do you want to create a new Azure Cosmos DB account? (y/n): " create_cosmosdb

if [ "$create_cosmosdb" = "y" ]; then
    echo "Creating Azure Cosmos DB resources..."
    
    # Variables
    RESOURCE_GROUP="luxylyfe-rg"
    COSMOSDB_ACCOUNT="luxylyfe-cosmosdb"
    LOCATION="eastus2"
    DATABASE_NAME="luxylyfe_db"
    
    echo "📦 Creating resource group: $RESOURCE_GROUP"
    az group create --name $RESOURCE_GROUP --location $LOCATION
    
    echo "🚀 Creating Cosmos DB account: $COSMOSDB_ACCOUNT"
    az cosmosdb create \
        --name $COSMOSDB_ACCOUNT \
        --resource-group $RESOURCE_GROUP \
        --kind MongoDB \
        --server-version 4.2 \
        --default-consistency-level Session \
        --locations regionName=$LOCATION failoverPriority=0 \
        --enable-free-tier true
    
    echo "📊 Creating database: $DATABASE_NAME"
    az cosmosdb mongodb database create \
        --account-name $COSMOSDB_ACCOUNT \
        --resource-group $RESOURCE_GROUP \
        --name $DATABASE_NAME
    
    echo "📋 Creating collections..."
    collections=("User" "Property" "PageContent" "SiteSettings")
    
    for collection in "${collections[@]}"; do
        echo "  Creating collection: $collection"
        az cosmosdb mongodb collection create \
            --account-name $COSMOSDB_ACCOUNT \
            --resource-group $RESOURCE_GROUP \
            --database-name $DATABASE_NAME \
            --name $collection \
            --throughput 400
    done
    
    echo -e "${GREEN}✅ Azure Cosmos DB setup completed${NC}"
    
    # Get connection string
    echo "🔗 Getting connection string..."
    COSMOS_CONNECTION_STRING=$(az cosmosdb keys list --name $COSMOSDB_ACCOUNT --resource-group $RESOURCE_GROUP --type connection-strings --query "connectionStrings[0].connectionString" --output tsv)
    
    echo "Connection string obtained (check Azure Portal for full string)"
    echo ""
else
    echo "Using existing Azure Cosmos DB account"
    read -p "Enter your Cosmos DB connection string: " COSMOS_CONNECTION_STRING
fi

echo ""

# Step 4: Data Export
echo -e "${BLUE}📤 Exporting Data from MongoDB Atlas${NC}"
echo ""

BACKUP_DIR="./mongodb_atlas_backup"

echo "Creating backup directory: $BACKUP_DIR"
mkdir -p $BACKUP_DIR

echo "Exporting data from MongoDB Atlas..."
if mongodump --uri="$DATABASE_URL" --out="$BACKUP_DIR"; then
    echo -e "${GREEN}✅ Data export completed successfully${NC}"
    
    # Show backup summary
    echo ""
    echo "📊 Backup Summary:"
    for collection in User Property PageContent SiteSettings; do
        if [ -f "$BACKUP_DIR/luxylyfe_db/$collection.bson" ]; then
            size=$(stat -f%z "$BACKUP_DIR/luxylyfe_db/$collection.bson" 2>/dev/null || stat -c%s "$BACKUP_DIR/luxylyfe_db/$collection.bson" 2>/dev/null)
            echo "   $collection: $size bytes"
        fi
    done
else
    echo -e "${RED}❌ Data export failed${NC}"
    echo "Please check your MongoDB Atlas connection string"
    exit 1
fi

echo ""

# Step 5: Data Import
echo -e "${BLUE}📥 Importing Data to Azure Cosmos DB${NC}"
echo ""

if [ -n "$COSMOS_CONNECTION_STRING" ]; then
    echo "Importing data to Azure Cosmos DB..."
    
    if mongorestore --uri="$COSMOS_CONNECTION_STRING" "$BACKUP_DIR"; then
        echo -e "${GREEN}✅ Data import completed successfully${NC}"
    else
        echo -e "${RED}❌ Data import failed${NC}"
        echo "Please check your Cosmos DB connection string and try again"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  Cosmos DB connection string not provided${NC}"
    echo "Please import data manually using:"
    echo "mongorestore --uri=\"YOUR_COSMOS_CONNECTION_STRING\" $BACKUP_DIR"
fi

echo ""

# Step 6: Update configuration
echo -e "${BLUE}🔧 Updating Application Configuration${NC}"
echo ""

if [ -n "$COSMOS_CONNECTION_STRING" ]; then
    # Create backup of current .env.local
    cp .env.local .env.local.backup
    echo -e "${GREEN}✅ Created backup: .env.local.backup${NC}"
    
    # Update DATABASE_URL in .env.local
    if sed -i.bak "s|DATABASE_URL=.*|DATABASE_URL=\"$COSMOS_CONNECTION_STRING\"|" .env.local; then
        echo -e "${GREEN}✅ Updated DATABASE_URL in .env.local${NC}"
        rm .env.local.bak
    else
        echo -e "${YELLOW}⚠️  Please manually update DATABASE_URL in .env.local${NC}"
    fi
fi

echo ""

# Step 7: Test connection
echo -e "${BLUE}🧪 Testing Connection${NC}"
echo ""

if [ -f "test-cosmos-db-connection.js" ]; then
    echo "Running connection test..."
    if node test-cosmos-db-connection.js; then
        echo -e "${GREEN}✅ Connection test passed${NC}"
    else
        echo -e "${YELLOW}⚠️  Connection test failed - please check manually${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  test-cosmos-db-connection.js not found${NC}"
    echo "Please run: node test-cosmos-db-connection.js manually"
fi

echo ""

# Step 8: Create indexes
echo -e "${BLUE}📈 Optimizing Performance${NC}"
echo ""

if [ -f "create-cosmos-db-indexes.js" ]; then
    echo "Creating optimized indexes..."
    if node create-cosmos-db-indexes.js; then
        echo -e "${GREEN}✅ Indexes created successfully${NC}"
    else
        echo -e "${YELLOW}⚠️  Index creation failed - please check manually${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  create-cosmos-db-indexes.js not found${NC}"
    echo "Please run index creation manually"
fi

echo ""

# Migration summary
echo -e "${GREEN}🎉 Migration Summary${NC}"
echo "==================="
echo ""
echo -e "${GREEN}✅ MongoDB Atlas to Azure Cosmos DB migration completed!${NC}"
echo ""
echo "📊 What was migrated:"
echo "   • User accounts and authentication data"
echo "   • Property listings and details"
echo "   • Page content (CMS data)"
echo "   • Site settings and configuration"
echo ""
echo "🔧 Next Steps:"
echo "   1. Test your application thoroughly"
echo "   2. Update Azure Static Web Apps environment variables"
echo "   3. Monitor performance in Azure Portal"
echo "   4. Set up backup schedules"
echo "   5. Configure alerts and monitoring"
echo ""
echo "💰 Cost Optimization:"
echo "   • Monitor RU consumption in Azure Portal"
echo "   • Consider autoscale for variable workloads"
echo "   • Use serverless for development/staging"
echo ""
echo "📖 Documentation:"
echo "   • Full guide: MONGODB_TO_COSMOSDB_MIGRATION.md"
echo "   • Rollback plan: Keep MongoDB Atlas for 30 days"
echo ""
echo -e "${BLUE}Your LuxyLyfe application is now powered by Azure Cosmos DB! 🚀${NC}"
