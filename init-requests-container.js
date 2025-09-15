// Initialize Requests Container in Cosmos DB
// This script creates the missing 'requests' container needed for the request management system

// Load environment variables from .env.local manually
const fs = require('fs');
const path = require('path');

function loadEnvFile() {
  try {
    const envPath = path.join(__dirname, '.env.local');
    const envFile = fs.readFileSync(envPath, 'utf8');
    const lines = envFile.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').replace(/^["']|["']$/g, ''); // Remove quotes
          process.env[key] = value;
        }
      }
    }
  } catch (error) {
    console.log('Warning: Could not load .env.local file:', error.message);
  }
}

loadEnvFile();

async function initializeRequestsContainer() {
  console.log('🚀 Initializing Requests Container');
  console.log('==================================\n');

  // Check environment variables
  const endpoint = process.env.COSMOS_DB_ENDPOINT;
  const key = process.env.COSMOS_DB_KEY;
  const databaseName = process.env.COSMOS_DB_DATABASE_NAME || 'luxylyfe_db';

  console.log('📋 Configuration:');
  console.log(`Endpoint: ${endpoint ? '✅ Set' : '❌ Missing'}`);
  console.log(`Key: ${key ? '✅ Set' : '❌ Missing'}`);
  console.log(`Database: ${databaseName}\n`);

  if (!endpoint || !key) {
    console.log('❌ Missing required environment variables!');
    console.log('\nPlease set in .env.local:');
    console.log('COSMOS_DB_ENDPOINT="https://YOUR_ACCOUNT.documents.azure.com:443/"');
    console.log('COSMOS_DB_KEY="YOUR_PRIMARY_KEY"');
    console.log('COSMOS_DB_DATABASE_NAME="luxylyfe_db"');
    return;
  }

  try {
    // Import Cosmos client
    const { CosmosClient } = require('@azure/cosmos');
    
    console.log('🔗 Connecting to Cosmos DB...');
    const client = new CosmosClient({ endpoint, key });

    // Get database
    const { database } = await client.databases.createIfNotExists({ id: databaseName });
    console.log(`✅ Database "${databaseName}" connected\n`);

    // Create requests container
    console.log('📦 Creating requests container...');
    const { container } = await database.containers.createIfNotExists({
      id: 'requests',
      partitionKey: { paths: ['/type'] } // Partition by request type (CONTACT_US/SCHEDULE_VIEWING)
    });

    console.log('✅ Requests container created/verified');

    // Test container access
    console.log('\n🧪 Testing container access...');
    const { resources: items } = await container.items.query('SELECT VALUE COUNT(1) FROM c').fetchAll();
    const count = items[0] || 0;
    console.log(`📊 Current requests count: ${count}`);

    console.log('\n🎉 Initialization complete!');
    console.log('The requests container is now ready for the Contact Us and Schedule Viewing forms.');

  } catch (error) {
    console.error('\n❌ Error during initialization:', error.message);
    console.error('\nFull error:', error);
  }
}

// Run the initialization
initializeRequestsContainer()
  .then(() => {
    console.log('\n✨ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });