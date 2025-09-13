const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });

async function comprehensiveConnectionTest() {
  console.log('🧪 Comprehensive MongoDB Connection Test');
  console.log('=======================================\n');

  const connectionString = process.env.DATABASE_URL;
  console.log('📋 Connection Details:');
  console.log(`Host: ${new URL(connectionString).hostname}`);
  console.log(`Database: ${new URL(connectionString).pathname.slice(1)}`);
  console.log(`Protocol: ${new URL(connectionString).protocol}`);

  const prisma = new PrismaClient();

  try {
    console.log('\n🔗 Testing connection stability...');
    
    // Test 1: Basic connection
    console.log('1️⃣ Basic connection test...');
    await prisma.$connect();
    console.log('✅ Initial connection successful');

    // Test 2: Multiple quick connections
    console.log('\n2️⃣ Testing multiple connections...');
    for (let i = 1; i <= 5; i++) {
      await prisma.$disconnect();
      await prisma.$connect();
      console.log(`✅ Connection ${i}/5 successful`);
    }

    // Test 3: Database operations
    console.log('\n3️⃣ Testing database operations...');
    const results = await Promise.all([
      prisma.user.count(),
      prisma.property.count(),
      prisma.pageContent.count(),
      prisma.siteSettings.count()
    ]);
    console.log(`✅ All collections accessible`);
    console.log(`   Users: ${results[0]}, Properties: ${results[1]}, Content: ${results[2]}, Settings: ${results[3]}`);

    // Test 4: Complex query
    console.log('\n4️⃣ Testing complex queries...');
    const activeUsers = await prisma.user.findMany({
      where: { isActive: true },
      select: { id: true, name: true, email: true }
    });
    console.log(`✅ Complex query successful - ${activeUsers.length} active users`);

    // Test 5: Transaction test
    console.log('\n5️⃣ Testing transaction support...');
    await prisma.$transaction(async (tx) => {
      const userCount = await tx.user.count();
      const propertyCount = await tx.property.count();
      console.log(`✅ Transaction successful - ${userCount} users, ${propertyCount} properties`);
    });

    console.log('\n🎉 All tests passed! Your MongoDB connection is stable and working correctly.');
    
    console.log('\n📊 Connection Health Summary:');
    console.log('✅ Basic connectivity: PASS');
    console.log('✅ Connection stability: PASS');
    console.log('✅ Database operations: PASS');
    console.log('✅ Complex queries: PASS');
    console.log('✅ Transaction support: PASS');

  } catch (error) {
    console.error('\n❌ Connection test failed:', error.message);
    
    console.log('\n🔧 Troubleshooting the "Server record does not share host name" error:');
    console.log('');
    console.log('1. 🌐 DNS/Network Issues:');
    console.log('   • Try using different DNS servers (8.8.8.8, 1.1.1.1)');
    console.log('   • Check if your ISP is blocking MongoDB Atlas');
    console.log('   • Restart your network adapter');
    console.log('');
    console.log('2. 🔒 MongoDB Atlas Configuration:');
    console.log('   • Verify IP whitelist includes your current IP');
    console.log('   • Check if cluster is paused or maintenance mode');
    console.log('   • Ensure connection string is correct');
    console.log('');
    console.log('3. 🛡️ Windows/Firewall Issues:');
    console.log('   • Temporarily disable Windows Defender firewall');
    console.log('   • Check antivirus software blocking connections');
    console.log('   • Try running as administrator');
    console.log('');
    console.log('4. 🔧 Connection String Fixes:');
    console.log('   • Add &ssl=true to connection string');
    console.log('   • Try &directConnection=true');
    console.log('   • Add &serverSelectionTimeoutMS=30000');
    
    // Show alternative connection strings
    console.log('\n📝 Alternative connection strings to try:');
    
    const baseUrl = connectionString.split('?')[0];
    const alternatives = [
      `${baseUrl}?retryWrites=true&w=majority&ssl=true&authSource=admin`,
      `${baseUrl}?retryWrites=true&w=majority&directConnection=true`,
      `${baseUrl}?retryWrites=true&w=majority&serverSelectionTimeoutMS=30000`,
      `${baseUrl}?retryWrites=true&w=majority&ssl=true&tlsInsecure=true`
    ];
    
    alternatives.forEach((alt, index) => {
      console.log(`${index + 1}. ${alt.replace(/:[^:@]+@/, ':****@')}`);
    });

  } finally {
    await prisma.$disconnect();
  }
}

comprehensiveConnectionTest();
