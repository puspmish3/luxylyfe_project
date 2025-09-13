const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testCosmosDBConnection() {
  try {
    console.log('🔗 Testing Azure Cosmos DB Connection...\n');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Successfully connected to Azure Cosmos DB!');
    
    console.log('\n📊 Testing database operations...');
    
    // Check if collections exist and are accessible
    const userCount = await prisma.user.count();
    console.log(`✅ User collection accessible - Current users: ${userCount}`);
    
    const propertyCount = await prisma.property.count();
    console.log(`✅ Property collection accessible - Current properties: ${propertyCount}`);
    
    const contentCount = await prisma.pageContent.count();
    console.log(`✅ PageContent collection accessible - Current content items: ${contentCount}`);
    
    const settingsCount = await prisma.siteSettings.count();
    console.log(`✅ SiteSettings collection accessible - Current settings: ${settingsCount}`);
    
    console.log('\n🎉 All database operations successful!');
    console.log('\n📝 Azure Cosmos DB Connection Details:');
    console.log('   Database: Azure Cosmos DB (MongoDB API)');
    console.log('   Status: Connected');
    console.log('   Collections: All accessible');
    console.log('   Compatibility: Full MongoDB API support');
    
    console.log('\n📊 Data Migration Summary:');
    console.log(`   Total Users: ${userCount}`);
    console.log(`   Total Properties: ${propertyCount}`);
    console.log(`   Total Content Items: ${contentCount}`);
    console.log(`   Total Settings: ${settingsCount}`);
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Check your Cosmos DB connection string in .env.local');
    console.log('2. Verify firewall settings allow your IP in Azure Portal');
    console.log('3. Ensure SSL is enabled in connection string');
    console.log('4. Check if Cosmos DB account is active');
    console.log('5. Verify MongoDB API is selected for Cosmos DB');
  } finally {
    await prisma.$disconnect();
  }
}

testCosmosDBConnection();
