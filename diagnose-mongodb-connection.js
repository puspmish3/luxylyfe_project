const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });

async function diagnoseMongDBConnection() {
  console.log('🔍 MongoDB Connection Diagnostics');
  console.log('================================\n');

  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('❌ DATABASE_URL not found in .env.local');
    return;
  }

  console.log('📋 Connection String Analysis:');
  console.log(`Current: ${connectionString.replace(/:[^:@]+@/, ':****@')}`);
  
  // Parse the connection string
  try {
    const url = new URL(connectionString);
    console.log(`Protocol: ${url.protocol}`);
    console.log(`Host: ${url.hostname}`);
    console.log(`Database: ${url.pathname.slice(1) || 'default'}`);
    console.log(`Params: ${url.search}`);
  } catch (error) {
    console.error('❌ Invalid connection string format:', error.message);
  }

  console.log('\n🔧 Testing Connection with Different Options:\n');

  // Test 1: Original connection
  console.log('1️⃣ Testing original connection...');
  await testPrismaConnection(connectionString, 'Original');

  // Test 2: With SSL and auth source
  console.log('\n2️⃣ Testing with SSL and authSource...');
  const sslConnection = addConnectionParams(connectionString, {
    ssl: 'true',
    authSource: 'admin'
  });
  await testPrismaConnection(sslConnection, 'With SSL');

  // Test 3: With connection timeout
  console.log('\n3️⃣ Testing with connection timeout...');
  const timeoutConnection = addConnectionParams(connectionString, {
    connectTimeoutMS: '10000',
    serverSelectionTimeoutMS: '10000'
  });
  await testPrismaConnection(timeoutConnection, 'With Timeout');

  // Test 4: Without SSL (for testing)
  console.log('\n4️⃣ Testing without SSL...');
  const noSslConnection = addConnectionParams(connectionString, {
    ssl: 'false'
  });
  await testPrismaConnection(noSslConnection, 'Without SSL');

  console.log('\n📖 Common Solutions:');
  console.log('• Check MongoDB Atlas Network Access (IP whitelist)');
  console.log('• Verify database user permissions');
  console.log('• Ensure cluster is not paused');
  console.log('• Try different DNS servers (8.8.8.8, 1.1.1.1)');
  console.log('• Check Windows Defender/antivirus blocking');
  console.log('• Update MongoDB Atlas cluster if outdated');
}

function addConnectionParams(connectionString, params) {
  try {
    const url = new URL(connectionString);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    return url.toString();
  } catch (error) {
    return connectionString;
  }
}

async function testPrismaConnection(connectionString, method) {
  // Temporarily override the DATABASE_URL
  const originalUrl = process.env.DATABASE_URL;
  process.env.DATABASE_URL = connectionString;
  
  const prisma = new PrismaClient();
  
  try {
    await prisma.$connect();
    await prisma.user.count(); // Simple query to test
    console.log(`✅ ${method}: Connection successful`);
    await prisma.$disconnect();
    return true;
  } catch (error) {
    console.log(`❌ ${method}: ${error.message}`);
    return false;
  } finally {
    // Restore original URL
    process.env.DATABASE_URL = originalUrl;
    await prisma.$disconnect();
  }
}

diagnoseMongDBConnection();
