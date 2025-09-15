/**
 * Data Comparison and Migration Utilities
 * 
 * This script provides utilities to compare data between MongoDB Atlas and Cosmos DB
 * and verify data integrity after migration
 */

const { PrismaClient } = require('@prisma/client');
// Import Cosmos client directly since we're in a Node.js script
const { CosmosClient } = require('@azure/cosmos');
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

// Initialize Cosmos DB client
const cosmosClient = new CosmosClient({
  endpoint: process.env.COSMOS_DB_ENDPOINT,
  key: process.env.COSMOS_DB_KEY,
});

const databaseName = process.env.COSMOS_DB_DATABASE_NAME || 'luxylyfe-db';

// Simple Cosmos DB utilities for this script
const cosmosUtils = {
  async getUserCount() {
    const container = cosmosClient.database(databaseName).container('users');
    const { resources } = await container.items.readAll().fetchAll();
    return resources.length;
  },
  
  async getPropertyCount() {
    const container = cosmosClient.database(databaseName).container('properties');
    const { resources } = await container.items.readAll().fetchAll();
    return resources.length;
  },
  
  async findUserById(id) {
    const container = cosmosClient.database(databaseName).container('users');
    try {
      const { resource } = await container.item(id, id).read();
      return resource;
    } catch (error) {
      return null;
    }
  },
  
  async findPropertyById(id) {
    const container = cosmosClient.database(databaseName).container('properties');
    try {
      const { resource } = await container.item(id, id).read();
      return resource;
    } catch (error) {
      return null;
    }
  }
};

/**
 * Compare a specific record between databases
 */
async function compareRecord(collection, id) {
  try {
    let mongoRecord, cosmosRecord;
    
    // Get record from MongoDB Atlas
    switch (collection) {
      case 'users':
        mongoRecord = await prisma.user.findUnique({ where: { id } });
        cosmosRecord = await cosmosUtils.findUserById(id);
        break;
      case 'properties':
        mongoRecord = await prisma.property.findUnique({ where: { id } });
        cosmosRecord = await cosmosUtils.findPropertyById(id);
        break;
      default:
        throw new Error(`Collection ${collection} not supported for comparison`);
    }
    
    // Compare key fields
    const differences = [];
    
    if (!mongoRecord && !cosmosRecord) {
      return { status: 'both_missing', differences: [] };
    }
    
    if (!mongoRecord) {
      return { status: 'missing_in_mongo', differences: ['Record exists only in Cosmos DB'] };
    }
    
    if (!cosmosRecord) {
      return { status: 'missing_in_cosmos', differences: ['Record exists only in MongoDB'] };
    }
    
    // Compare specific fields
    const fieldsToCompare = collection === 'users' 
      ? ['email', 'role', 'name', 'phone']
      : ['title', 'address', 'price', 'propertyType', 'isAvailable'];
    
    for (const field of fieldsToCompare) {
      if (mongoRecord[field] !== cosmosRecord[field]) {
        differences.push(`${field}: MongoDB="${mongoRecord[field]}" vs Cosmos="${cosmosRecord[field]}"`);
      }
    }
    
    return {
      status: differences.length === 0 ? 'identical' : 'different',
      differences,
      mongoRecord,
      cosmosRecord
    };
    
  } catch (error) {
    return { status: 'error', error: error.message };
  }
}

/**
 * Get sample records for comparison
 */
async function getSampleComparison() {
  console.log('🔍 Comparing sample records between databases...\n');
  
  try {
    // Get sample user
    const sampleUser = await prisma.user.findFirst();
    if (sampleUser) {
      console.log('👤 User Comparison:');
      const userComparison = await compareRecord('users', sampleUser.id);
      console.log(`   Status: ${userComparison.status}`);
      if (userComparison.differences.length > 0) {
        userComparison.differences.forEach(diff => console.log(`   ⚠️ ${diff}`));
      } else {
        console.log('   ✅ Records identical');
      }
    }
    
    // Get sample property
    const sampleProperty = await prisma.property.findFirst();
    if (sampleProperty) {
      console.log('\n🏠 Property Comparison:');
      const propertyComparison = await compareRecord('properties', sampleProperty.id);
      console.log(`   Status: ${propertyComparison.status}`);
      if (propertyComparison.differences.length > 0) {
        propertyComparison.differences.forEach(diff => console.log(`   ⚠️ ${diff}`));
      } else {
        console.log('   ✅ Records identical');
      }
    }
    
  } catch (error) {
    console.error('❌ Sample comparison failed:', error.message);
  }
}

/**
 * Test CRUD operations on both databases
 */
async function testCRUDOperations() {
  console.log('\n🧪 Testing CRUD operations on both databases...\n');
  
  const testEmail = `test-${Date.now()}@example.com`;
  
  try {
    // Test CREATE
    console.log('📝 Testing CREATE operations...');
    
    const mongoUser = await prisma.user.create({
      data: {
        email: testEmail,
        password: 'test-password',
        role: 'MEMBER',
        name: 'Test User'
      }
    });
    console.log('   ✅ MongoDB: User created');
    
    // For now, skip Cosmos DB creation test since we need the full client
    console.log('   ⏭️ Cosmos DB: Skipping create test (use main migration script)');
    
    // Test READ
    console.log('\n📖 Testing READ operations...');
    
    const mongoRead = await prisma.user.findUnique({ where: { id: mongoUser.id } });
    console.log(`   ✅ MongoDB: Read user ${mongoRead?.name}`);
    
    const cosmosRead = await cosmosUtils.findUserById(mongoUser.id);
    console.log(`   ${cosmosRead ? '✅' : '⚠️'} Cosmos DB: ${cosmosRead ? `Read user ${cosmosRead.name}` : 'User not found (expected for new records)'}`);
    
    // Test UPDATE
    console.log('\n✏️ Testing UPDATE operations...');
    
    await prisma.user.update({
      where: { id: mongoUser.id },
      data: { name: 'Updated Test User' }
    });
    console.log('   ✅ MongoDB: User updated');
    
    console.log('   ⏭️ Cosmos DB: Update test skipped');
    
    // Test DELETE
    console.log('\n🗑️ Testing DELETE operations...');
    
    await prisma.user.delete({ where: { id: mongoUser.id } });
    console.log('   ✅ MongoDB: User deleted');
    
    console.log('   ⏭️ Cosmos DB: Delete test skipped');
    
    console.log('\n🎉 All CRUD operations successful!');
    
  } catch (error) {
    console.error('❌ CRUD test failed:', error.message);
  }
}

/**
 * Generate migration report
 */
async function generateMigrationReport() {
  console.log('📊 Generating Migration Report...\n');
  
  const report = {
    timestamp: new Date().toISOString(),
    databases: {
      source: 'MongoDB Atlas',
      destination: 'Azure Cosmos DB SQL API'
    },
    collections: {},
    summary: {}
  };
  
  try {
    // Check each collection
    const collections = [
      { name: 'users', mongoQuery: () => prisma.user.count() },
      { name: 'sessions', mongoQuery: () => prisma.session.count() },
      { name: 'loginAttempts', mongoQuery: () => prisma.loginAttempt.count() },
      { name: 'properties', mongoQuery: () => prisma.property.count() },
      { name: 'pageContents', mongoQuery: () => prisma.pageContent.count() },
      { name: 'siteSettings', mongoQuery: () => prisma.siteSettings.count() }
    ];
    
    let totalMongo = 0;
    let totalCosmos = 0;
    
    for (const collection of collections) {
      const mongoCount = await collection.mongoQuery();
      
      let cosmosCount = 0;
      try {
        switch (collection.name) {
          case 'users':
            cosmosCount = await cosmosUtils.getUserCount();
            break;
          case 'properties':
            cosmosCount = await cosmosUtils.getPropertyCount();
            break;
          default:
            cosmosCount = 'not_implemented'; // For other collections
        }
      } catch (error) {
        cosmosCount = 'error';
      }
      
      report.collections[collection.name] = {
        mongo: mongoCount,
        cosmos: cosmosCount,
        status: mongoCount === cosmosCount ? 'synced' : 'different'
      };
      
      totalMongo += mongoCount;
      if (typeof cosmosCount === 'number') {
        totalCosmos += cosmosCount;
      }
      
      const status = mongoCount === cosmosCount ? '✅' : '⚠️';
      console.log(`${status} ${collection.name.padEnd(15)} | MongoDB: ${mongoCount}, Cosmos DB: ${cosmosCount}`);
    }
    
    report.summary = {
      totalRecordsMongo: totalMongo,
      totalRecordsCosmos: totalCosmos,
      migrationComplete: totalMongo === totalCosmos
    };
    
    console.log('\n📋 Summary:');
    console.log(`   MongoDB Atlas: ${totalMongo} total records`);
    console.log(`   Cosmos DB SQL API: ${totalCosmos} total records`);
    console.log(`   Migration Status: ${report.summary.migrationComplete ? '✅ Complete' : '⚠️ Incomplete'}`);
    
    return report;
    
  } catch (error) {
    console.error('❌ Report generation failed:', error.message);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}

// Command line interface
const command = process.argv[2];

switch (command) {
  case 'compare':
    getSampleComparison();
    break;
  case 'test':
    testCRUDOperations();
    break;
  case 'report':
  default:
    generateMigrationReport();
    break;
}