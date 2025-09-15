// Azure Cosmos DB Configuration Helper
// Run this script to test and configure your Cosmos DB connection

const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });

async function setupCosmosDB() {
  console.log('🌌 Azure Cosmos DB for MongoDB vCore Setup');
  console.log('==========================================\n');

  // Show current configuration
  console.log('📋 Current Configuration:');
  const currentUrl = process.env.DATABASE_URL;
  if (currentUrl) {
    try {
      const url = new URL(currentUrl);
      console.log(`Host: ${url.hostname}`);
      console.log(`Port: ${url.port || '27017'}`);
      console.log(`Database: ${url.pathname.slice(1) || 'not specified'}`);
      console.log(`Protocol: ${url.protocol}`);
      
      if (url.hostname.includes('cosmos.azure.com')) {
        console.log('✅ Configuration appears to be for Azure Cosmos DB');
      } else if (url.hostname.includes('mongodb.net')) {
        console.log('⚠️  Configuration appears to be for MongoDB Atlas');
      } else {
        console.log('ℹ️  Configuration type unknown');
      }
    } catch (error) {
      console.log('❌ Invalid DATABASE_URL format');
      console.log('Expected format: mongodb://USERNAME:PASSWORD@ACCOUNT.mongo.cosmos.azure.com:10255/DATABASE?ssl=true&retryWrites=true');
      return;
    }
  } else {
    console.log('❌ No DATABASE_URL found in environment');
    return;
  }

  console.log('\n🔗 Testing Connection...');
  const prisma = new PrismaClient();

  try {
    // Test basic connectivity
    await prisma.$connect();
    console.log('✅ Successfully connected to database');

    // Test database operations
    console.log('\n📊 Testing Database Operations...');
    
    const collections = [
      { name: 'User', model: prisma.user },
      { name: 'Property', model: prisma.property },
      { name: 'PageContent', model: prisma.pageContent },
      { name: 'SiteSettings', model: prisma.siteSettings }
    ];

    for (const collection of collections) {
      try {
        const count = await collection.model.count();
        console.log(`✅ ${collection.name}: ${count} documents`);
      } catch (error) {
        console.log(`⚠️  ${collection.name}: Error accessing collection - ${error.message}`);
      }
    }

    console.log('\n🎉 Cosmos DB connection successful!');
    console.log('\n📝 Next steps:');
    console.log('1. Update your DATABASE_URL with actual Cosmos DB credentials');
    console.log('2. Run: npm run db:push (to sync schema if needed)');
    console.log('3. Optionally migrate data from Atlas using migration scripts');

  } catch (error) {
    console.error('\n❌ Connection failed:', error.message);
    
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Verify your Cosmos DB account is running');
    console.log('2. Check network access rules (firewall)');
    console.log('3. Verify connection string format:');
    console.log('   mongodb://USERNAME:PASSWORD@ACCOUNT.mongo.cosmos.azure.com:10255/DATABASE?ssl=true&retryWrites=true');
    console.log('4. Ensure the database user has read/write permissions');
    
    if (error.message.includes('authentication')) {
      console.log('\n🔐 Authentication issues:');
      console.log('- Check username and password');
      console.log('- Verify user exists in Cosmos DB');
      console.log('- Check if user has correct database permissions');
    }
    
    if (error.message.includes('network') || error.message.includes('timeout')) {
      console.log('\n🌐 Network issues:');
      console.log('- Check firewall rules in Azure Portal');
      console.log('- Verify your IP address is allowed');
      console.log('- Try temporarily allowing all IPs (0.0.0.0/0) for testing');
    }

  } finally {
    await prisma.$disconnect();
  }
}

// Helper function to generate Cosmos DB connection string template
function generateConnectionStringTemplate() {
  console.log('\n📋 Cosmos DB Connection String Template:');
  console.log('=====================================');
  console.log('mongodb://USERNAME:PASSWORD@ACCOUNT.mongo.cosmos.azure.com:10255/DATABASE?ssl=true&retryWrites=true&maxIdleTimeMS=120000&appName=@ACCOUNT@');
  console.log('\nReplace:');
  console.log('- USERNAME: Your database username');
  console.log('- PASSWORD: Your database password');
  console.log('- ACCOUNT: Your Cosmos DB account name');
  console.log('- DATABASE: Your database name (luxylyfe_db)');
  console.log('\nOptional parameters:');
  console.log('- &authSource=admin (if using admin authentication)');
  console.log('- &serverSelectionTimeoutMS=30000 (connection timeout)');
  console.log('- &directConnection=true (for single server)');
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--template')) {
    generateConnectionStringTemplate();
  } else {
    setupCosmosDB();
  }
}

module.exports = { setupCosmosDB, generateConnectionStringTemplate };