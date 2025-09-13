const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔗 Testing MongoDB Atlas Connection...\n');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Successfully connected to MongoDB Atlas!');
    
    // Test database operations
    console.log('\n📊 Testing database operations...');
    
    // Check if User table exists and is accessible
    const userCount = await prisma.user.count();
    console.log(`✅ User table accessible - Current users: ${userCount}`);
    
    // Check if Property table exists and is accessible  
    const propertyCount = await prisma.property.count();
    console.log(`✅ Property table accessible - Current properties: ${propertyCount}`);
    
    // Check if PageContent table exists and is accessible
    const contentCount = await prisma.pageContent.count();
    console.log(`✅ PageContent table accessible - Current content items: ${contentCount}`);
    
    // Check if SiteSettings table exists and is accessible
    const settingsCount = await prisma.siteSettings.count();
    console.log(`✅ SiteSettings table accessible - Current settings: ${settingsCount}`);
    
    console.log('\n🎉 All database operations successful!');
    console.log('\n📝 Connection Details:');
    console.log('   Database: MongoDB Atlas');
    console.log('   Status: Connected');
    console.log('   Tables: All accessible');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Check your DATABASE_URL in .env.local');
    console.log('2. Verify MongoDB Atlas user credentials');
    console.log('3. Ensure network access is configured (0.0.0.0/0 for development)');
    console.log('4. Run: npx prisma generate && npx prisma db push');
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
