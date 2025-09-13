const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function createCosmosDBIndexes() {
  const client = new MongoClient(process.env.DATABASE_URL);
  
  try {
    console.log('🚀 Creating optimized indexes for Azure Cosmos DB...\n');
    
    await client.connect();
    console.log('✅ Connected to Azure Cosmos DB');
    
    const db = client.db('luxylyfe_db');
    
    // User collection indexes
    console.log('📊 Creating User collection indexes...');
    await db.collection('User').createIndex({ email: 1 }, { unique: true });
    await db.collection('User').createIndex({ role: 1 });
    await db.collection('User').createIndex({ isActive: 1 });
    await db.collection('User').createIndex({ createdAt: -1 });
    console.log('✅ User indexes created');
    
    // Property collection indexes
    console.log('📊 Creating Property collection indexes...');
    await db.collection('Property').createIndex({ propertyType: 1 });
    await db.collection('Property').createIndex({ isFeatured: 1 });
    await db.collection('Property').createIndex({ price: 1 });
    await db.collection('Property').createIndex({ location: 1 });
    await db.collection('Property').createIndex({ isActive: 1 });
    await db.collection('Property').createIndex({ createdAt: -1 });
    console.log('✅ Property indexes created');
    
    // PageContent collection indexes
    console.log('📊 Creating PageContent collection indexes...');
    await db.collection('PageContent').createIndex({ pageType: 1, sectionType: 1 });
    await db.collection('PageContent').createIndex({ isActive: 1 });
    await db.collection('PageContent').createIndex({ order: 1 });
    await db.collection('PageContent').createIndex({ createdAt: -1 });
    console.log('✅ PageContent indexes created');
    
    // SiteSettings collection indexes
    console.log('📊 Creating SiteSettings collection indexes...');
    await db.collection('SiteSettings').createIndex({ key: 1 }, { unique: true });
    await db.collection('SiteSettings').createIndex({ isPublic: 1 });
    await db.collection('SiteSettings').createIndex({ dataType: 1 });
    console.log('✅ SiteSettings indexes created');
    
    console.log('\n🎉 All indexes created successfully!');
    console.log('\n💡 Performance Benefits:');
    console.log('   - Faster user authentication queries');
    console.log('   - Optimized property search and filtering');
    console.log('   - Efficient content management operations');
    console.log('   - Quick settings retrieval');
    
    console.log('\n📈 Cosmos DB Optimization Tips:');
    console.log('   - Monitor RU consumption in Azure Portal');
    console.log('   - Use compound indexes for complex queries');
    console.log('   - Consider partitioning for large datasets');
    console.log('   - Enable autoscale for variable workloads');
    
  } catch (error) {
    console.error('❌ Index creation failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Ensure connection to Cosmos DB is working');
    console.log('2. Check if collections exist');
    console.log('3. Verify sufficient RU/s allocation');
    console.log('4. Run: node test-cosmos-db-connection.js first');
  } finally {
    await client.close();
    console.log('\n🔌 Connection closed');
  }
}

createCosmosDBIndexes();
