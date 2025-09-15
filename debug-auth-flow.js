/**
 * Comprehensive Authentication Flow Debug Script
 * Tests the complete login -> session verification -> dashboard flow
 */

console.log('🔐 Testing Complete Authentication Flow\n');

// Simulate the authentication process that happens in the browser
async function debugAuthFlow() {
  try {
    // Load environment to check JWT configuration
    require('dotenv').config({ path: '.env.local' });
    
    console.log('🔍 Environment Check:');
    console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? '[SET]' : '[MISSING]'}`);
    console.log(`   COSMOS_DB_ENDPOINT: ${process.env.COSMOS_DB_ENDPOINT ? '[SET]' : '[MISSING]'}`);
    console.log(`   DATABASE_MODE: ${process.env.DATABASE_MODE}`);
    
    // Test JWT functionality
    console.log('\n🧪 Testing JWT Functions:');
    const { generateToken, verifyToken } = require('./lib/auth');
    
    const testPayload = {
      userId: 'test-123',
      email: 'test@test.com',
      role: 'MEMBER'
    };
    
    const token = generateToken(testPayload);
    console.log(`   Token generated: ${token ? '[SUCCESS]' : '[FAILED]'}`);
    
    try {
      const decoded = verifyToken(token);
      console.log(`   Token verification: [SUCCESS]`);
      console.log(`   Decoded payload: ${JSON.stringify(decoded, null, 2)}`);
    } catch (error) {
      console.log(`   Token verification: [FAILED] - ${error.message}`);
    }
    
    // Test database connection
    console.log('\n🗄️  Testing Database Connection:');
    const { db } = require('./lib/database');
    
    try {
      // Test if we can find the test member
      const testUser = await db.user.findUnique({ email: 'member@luxylyfe.com' });
      console.log(`   User lookup: ${testUser ? '[SUCCESS]' : '[FAILED]'}`);
      if (testUser) {
        console.log(`   User found: ${testUser.name} (${testUser.role})`);
      }
    } catch (error) {
      console.log(`   User lookup: [FAILED] - ${error.message}`);
    }
    
    // Test session operations
    console.log('\n📋 Testing Session Operations:');
    try {
      // Create a test session
      const sessionToken = generateToken({
        userId: 'test-user-id',
        email: 'test@test.com',
        role: 'MEMBER'
      });
      
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);
      
      const session = await db.session.create({
        userId: 'test-user-id',
        token: sessionToken,
        expiresAt: expiresAt.toISOString()
      });
      
      console.log(`   Session creation: ${session ? '[SUCCESS]' : '[FAILED]'}`);
      
      // Test session lookup
      const foundSession = await db.session.findUnique({ token: sessionToken });
      console.log(`   Session lookup: ${foundSession ? '[SUCCESS]' : '[FAILED]'}`);
      
      // Clean up test session
      if (session) {
        await db.session.delete({ id: session.id });
        console.log(`   Session cleanup: [SUCCESS]`);
      }
      
    } catch (error) {
      console.log(`   Session operations: [FAILED] - ${error.message}`);
    }
    
    console.log('\n✅ Authentication flow test completed!');
    console.log('\n🎯 Next steps:');
    console.log('   1. Start dev server: npm run dev');
    console.log('   2. Navigate to: http://localhost:3000/member-login');
    console.log('   3. Use credentials: member@luxylyfe.com / member123');
    console.log('   4. Check browser dev tools for network requests');
    
  } catch (error) {
    console.error('\n❌ Authentication flow test failed:', error);
  }
}

debugAuthFlow();