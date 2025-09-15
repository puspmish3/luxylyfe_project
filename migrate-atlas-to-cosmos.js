/**
 * MongoDB Atlas to Azure Cosmos DB SQL API Migration Script
 * 
 * This script migrates all data from MongoDB Atlas to Azure Cosmos DB SQL API
 * Handles: Users, Sessions, LoginAttempts, Properties, PageContent, SiteSettings
 */

const { PrismaClient } = require('@prisma/client');
const { CosmosClient } = require('@azure/cosmos');
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

// Initialize Cosmos DB client
const cosmosClient = new CosmosClient({
  endpoint: process.env.COSMOS_DB_ENDPOINT,
  key: process.env.COSMOS_DB_KEY,
});

const databaseName = process.env.COSMOS_DB_DATABASE_NAME || 'luxylyfe-db';

// Container names mapping MongoDB collections to Cosmos containers
const CONTAINERS = {
  users: 'users',
  sessions: 'sessions', 
  loginAttempts: 'login_attempts',
  properties: 'properties',
  pageContents: 'page_contents',
  siteSettings: 'site_settings'
};

/**
 * Initialize Cosmos DB database and containers
 */
async function initializeCosmosDB() {
  console.log('🔧 Initializing Cosmos DB database and containers...');
  
  try {
    // Create database if it doesn't exist
    const { database } = await cosmosClient.databases.createIfNotExists({
      id: databaseName
    });
    
    console.log(`✅ Database "${databaseName}" ready`);

    // Create containers for each collection
    for (const [collectionName, containerName] of Object.entries(CONTAINERS)) {
      try {
        const { container } = await database.containers.createIfNotExists({
          id: containerName,
          partitionKey: { paths: ['/id'] }, // Using id as partition key
          throughput: 400 // Minimum throughput
        });
        console.log(`✅ Container "${containerName}" ready`);
      } catch (error) {
        console.error(`❌ Error creating container ${containerName}:`, error.message);
      }
    }
    
    return database;
  } catch (error) {
    console.error('❌ Failed to initialize Cosmos DB:', error.message);
    throw error;
  }
}

/**
 * Transform MongoDB document to Cosmos DB format
 */
function transformDocument(doc, collectionType) {
  if (!doc) return null;
  
  // Convert MongoDB ObjectId to string and add Cosmos DB id field
  const transformed = {
    id: doc.id || doc._id?.toString() || generateId(),
    ...doc
  };
  
  // Remove MongoDB-specific fields
  delete transformed._id;
  
  // Handle specific transformations per collection type
  switch (collectionType) {
    case 'users':
      // Ensure required fields
      if (!transformed.email) {
        console.warn(`⚠️ User missing email, skipping: ${transformed.id}`);
        return null;
      }
      break;
      
    case 'properties':
      // Ensure required fields
      if (!transformed.propertyId) {
        transformed.propertyId = `PROP-${transformed.id.slice(-6)}`;
      }
      break;
      
    case 'sessions':
      // Handle date fields
      if (transformed.expiresAt) {
        transformed.expiresAt = new Date(transformed.expiresAt).toISOString();
      }
      break;
  }
  
  // Handle date fields consistently
  if (transformed.createdAt) {
    transformed.createdAt = new Date(transformed.createdAt).toISOString();
  }
  if (transformed.updatedAt) {
    transformed.updatedAt = new Date(transformed.updatedAt).toISOString();
  }
  
  return transformed;
}

/**
 * Generate a simple ID if none exists
 */
function generateId() {
  return 'gen-' + Math.random().toString(36).substr(2, 9);
}

/**
 * Migrate a specific collection
 */
async function migrateCollection(collectionName, containerName, getData) {
  console.log(`\n📊 Migrating ${collectionName}...`);
  
  try {
    // Get data from MongoDB Atlas
    const mongoData = await getData();
    console.log(`   Found ${mongoData.length} records in MongoDB Atlas`);
    
    if (mongoData.length === 0) {
      console.log(`   ✅ No data to migrate for ${collectionName}`);
      return { success: true, migrated: 0, errors: 0 };
    }
    
    // Get Cosmos DB container
    const database = cosmosClient.database(databaseName);
    const container = database.container(containerName);
    
    let migrated = 0;
    let errors = 0;
    
    // Migrate each document
    for (const doc of mongoData) {
      try {
        const transformed = transformDocument(doc, collectionName);
        
        if (!transformed) {
          errors++;
          continue;
        }
        
        // Use upsert to handle duplicates
        await container.items.upsert(transformed);
        migrated++;
        
        if (migrated % 10 === 0) {
          console.log(`   📝 Migrated ${migrated}/${mongoData.length} records...`);
        }
        
      } catch (error) {
        console.error(`   ❌ Error migrating document ${doc.id}:`, error.message);
        errors++;
      }
    }
    
    console.log(`   ✅ Migration complete: ${migrated} migrated, ${errors} errors`);
    return { success: true, migrated, errors, total: mongoData.length };
    
  } catch (error) {
    console.error(`   ❌ Failed to migrate ${collectionName}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Main migration function
 */
async function migrateData() {
  console.log('🚀 Starting MongoDB Atlas to Cosmos DB SQL API migration...\n');
  
  const migrationResults = {};
  
  try {
    // Initialize Cosmos DB
    await initializeCosmosDB();
    
    // Migrate each collection
    const migrations = [
      {
        name: 'users',
        container: CONTAINERS.users,
        getData: () => prisma.user.findMany()
      },
      {
        name: 'sessions', 
        container: CONTAINERS.sessions,
        getData: () => prisma.session.findMany()
      },
      {
        name: 'loginAttempts',
        container: CONTAINERS.loginAttempts, 
        getData: () => prisma.loginAttempt.findMany()
      },
      {
        name: 'properties',
        container: CONTAINERS.properties,
        getData: () => prisma.property.findMany()
      },
      {
        name: 'pageContents',
        container: CONTAINERS.pageContents,
        getData: () => prisma.pageContent.findMany()
      },
      {
        name: 'siteSettings',
        container: CONTAINERS.siteSettings,
        getData: () => prisma.siteSettings.findMany()
      }
    ];
    
    // Execute migrations
    for (const migration of migrations) {
      const result = await migrateCollection(
        migration.name, 
        migration.container, 
        migration.getData
      );
      migrationResults[migration.name] = result;
    }
    
    // Display summary
    console.log('\n📋 Migration Summary:');
    console.log('=====================');
    
    let totalMigrated = 0;
    let totalErrors = 0;
    
    for (const [collection, result] of Object.entries(migrationResults)) {
      if (result.success) {
        console.log(`✅ ${collection.padEnd(15)} | ${result.migrated} migrated, ${result.errors} errors`);
        totalMigrated += result.migrated || 0;
        totalErrors += result.errors || 0;
      } else {
        console.log(`❌ ${collection.padEnd(15)} | FAILED: ${result.error}`);
      }
    }
    
    console.log('=====================');
    console.log(`📊 Total: ${totalMigrated} records migrated, ${totalErrors} errors`);
    
    if (totalErrors === 0) {
      console.log('\n🎉 Migration completed successfully!');
    } else {
      console.log(`\n⚠️ Migration completed with ${totalErrors} errors. Check logs above.`);
    }
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Verify migration by comparing record counts
 */
async function verifyMigration() {
  console.log('\n🔍 Verifying migration...');
  
  try {
    const database = cosmosClient.database(databaseName);
    
    // Check each container
    for (const [collectionName, containerName] of Object.entries(CONTAINERS)) {
      try {
        const container = database.container(containerName);
        const { resources } = await container.items.readAll().fetchAll();
        const cosmosCount = resources.length;
        
        // Get MongoDB count
        let mongoCount = 0;
        switch (collectionName) {
          case 'users':
            mongoCount = await prisma.user.count();
            break;
          case 'sessions':
            mongoCount = await prisma.session.count();
            break;
          case 'loginAttempts':
            mongoCount = await prisma.loginAttempt.count();
            break;
          case 'properties':
            mongoCount = await prisma.property.count();
            break;
          case 'pageContents':
            mongoCount = await prisma.pageContent.count();
            break;
          case 'siteSettings':
            mongoCount = await prisma.siteSettings.count();
            break;
        }
        
        const status = mongoCount === cosmosCount ? '✅' : '⚠️';
        console.log(`${status} ${collectionName.padEnd(15)} | MongoDB: ${mongoCount}, Cosmos DB: ${cosmosCount}`);
        
      } catch (error) {
        console.log(`❌ ${collectionName.padEnd(15)} | Error: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Check command line arguments
const command = process.argv[2];

if (command === 'verify') {
  verifyMigration();
} else if (command === 'migrate' || !command) {
  migrateData();
} else {
  console.log('Usage: node migrate-atlas-to-cosmos.js [migrate|verify]');
  console.log('  migrate (default): Migrate data from MongoDB Atlas to Cosmos DB');
  console.log('  verify: Verify migration by comparing record counts');
}