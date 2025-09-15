// Azure Cosmos DB SQL API Connection Test
// Run this script to test your Cosmos DB SQL API connection

require('dotenv').config({ path: '.env.local' });

async function testCosmosDB() {
  console.log('🌌 Azure Cosmos DB SQL API Connection Test');
  console.log('==========================================\n');

  // Check environment variables
  const endpoint = process.env.COSMOS_DB_ENDPOINT;
  const key = process.env.COSMOS_DB_KEY;
  const databaseName = process.env.COSMOS_DB_DATABASE_NAME || 'luxylyfe_db';

  console.log('📋 Configuration Check:');
  console.log(`Endpoint: ${endpoint ? '✅ Set' : '❌ Missing'}`);
  console.log(`Key: ${key ? '✅ Set' : '❌ Missing'}`);
  console.log(`Database: ${databaseName}`);

  if (!endpoint || !key) {
    console.log('\n❌ Missing required environment variables!');
    console.log('\nPlease set in .env.local:');
    console.log('COSMOS_DB_ENDPOINT="https://YOUR_ACCOUNT.documents.azure.com:443/"');
    console.log('COSMOS_DB_KEY="YOUR_PRIMARY_KEY"');
    console.log('COSMOS_DB_DATABASE_NAME="luxylyfe_db"');
    return;
  }

  try {
    // Import Cosmos client after env check
    const { CosmosClient } = require('@azure/cosmos');
    
    console.log('\n🔗 Testing Connection...');
    const client = new CosmosClient({ endpoint, key });

    // Test database connectivity
    const { database } = await client.databases.createIfNotExists({ id: databaseName });
    console.log(`✅ Database "${databaseName}" connected/created`);

    // Define containers (collections) to create
    const containers = [
      { id: 'users', partitionKey: '/email' },
      { id: 'properties', partitionKey: '/city' },
      { id: 'page_contents', partitionKey: '/pageType' },
      { id: 'site_settings', partitionKey: '/key' },
      { id: 'sessions', partitionKey: '/userId' },
      { id: 'login_attempts', partitionKey: '/email' }
    ];

    console.log('\n📊 Testing Containers...');
    
    for (const containerDef of containers) {
      try {
        const { container } = await database.containers.createIfNotExists({
          id: containerDef.id,
          partitionKey: { paths: [containerDef.partitionKey] }
        });

        // Test read access
        const { resources: items } = await container.items.query('SELECT VALUE COUNT(1) FROM c').fetchAll();
        const count = items[0] || 0;
        console.log(`✅ Container "${containerDef.id}": ${count} documents`);
      } catch (error) {
        console.log(`⚠️  Container "${containerDef.id}": Error - ${error.message}`);
      }
    }

    // Test a simple write operation
    console.log('\n🧪 Testing Write Operations...');
    const testContainer = database.container('site_settings');
    
    const testDocument = {
      id: 'test-connection-' + Date.now(),
      key: 'test_connection',
      value: 'successful',
      dataType: 'string',
      isPublic: false,
      description: 'Test document for connection verification',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      const { resource: created } = await testContainer.items.create(testDocument);
      console.log('✅ Write test successful');

      // Clean up test document
      await testContainer.item(created.id, testDocument.key).delete();
      console.log('✅ Cleanup successful');
    } catch (error) {
      console.log(`⚠️  Write test failed: ${error.message}`);
    }

    console.log('\n🎉 Cosmos DB SQL API connection successful!');
    console.log('\n📝 Next steps:');
    console.log('1. Your Cosmos DB is ready to use');
    console.log('2. Use lib/cosmos.ts for database operations');
    console.log('3. Keep using Prisma for MongoDB Atlas operations');
    console.log('4. Consider hybrid approach or migration to MongoDB API');

  } catch (error) {
    console.error('\n❌ Connection test failed:', error.message);
    
    console.log('\n🔧 Troubleshooting:');
    
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      console.log('🔐 Authentication Error:');
      console.log('- Verify your primary key is correct');
      console.log('- Check if the key has been regenerated');
      console.log('- Ensure you\'re using the primary key, not secondary');
    }
    
    if (error.message.includes('403') || error.message.includes('Forbidden')) {
      console.log('🚫 Permission Error:');
      console.log('- Check firewall rules in Azure Portal');
      console.log('- Verify your IP address is allowed');
      console.log('- Temporarily allow all IPs (0.0.0.0/0) for testing');
    }
    
    if (error.message.includes('network') || error.message.includes('timeout')) {
      console.log('🌐 Network Error:');
      console.log('- Check your internet connection');
      console.log('- Verify the endpoint URL is correct');
      console.log('- Check if Azure service is experiencing issues');
    }

    console.log('\n📋 Required format:');
    console.log('COSMOS_DB_ENDPOINT="https://YOUR_ACCOUNT.documents.azure.com:443/"');
    console.log('COSMOS_DB_KEY="your-very-long-primary-key"');
    console.log('COSMOS_DB_DATABASE_NAME="luxylyfe_db"');
  }
}

// Helper function to show connection string format
function showConnectionFormat() {
  console.log('\n📋 Azure Cosmos DB SQL API Configuration Format:');
  console.log('===============================================');
  console.log('COSMOS_DB_ENDPOINT="https://YOUR_ACCOUNT.documents.azure.com:443/"');
  console.log('COSMOS_DB_KEY="your-primary-key-from-azure-portal"');
  console.log('COSMOS_DB_DATABASE_NAME="luxylyfe_db"');
  console.log('\nTo get these values:');
  console.log('1. Go to Azure Portal → Your Cosmos DB Account');
  console.log('2. Click "Keys" in the left menu');
  console.log('3. Copy "URI" for COSMOS_DB_ENDPOINT');
  console.log('4. Copy "PRIMARY KEY" for COSMOS_DB_KEY');
  console.log('5. Set database name to "luxylyfe_db"');
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--format')) {
    showConnectionFormat();
  } else {
    testCosmosDB();
  }
}

module.exports = { testCosmosDB, showConnectionFormat };