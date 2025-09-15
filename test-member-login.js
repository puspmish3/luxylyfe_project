/**
 * Test member login flow to identify the error
 */

const fetch = require('node-fetch');

async function testMemberLogin() {
  console.log('🧪 Testing member login flow...\n');
  
  const baseUrl = 'http://localhost:3001';
  
  try {
    // Test 1: Check if we can reach the API
    console.log('1. Testing API availability...');
    try {
      const healthResponse = await fetch(`${baseUrl}/api/properties`);
      console.log(`   ✅ API is reachable (Status: ${healthResponse.status})`);
    } catch (error) {
      console.log(`   ❌ API unreachable: ${error.message}`);
      return;
    }
    
    // Test 2: Try to get a member user from the database
    console.log('\n2. Testing database access...');
    const { db } = require('./lib/database');
    
    const memberUsers = await db.user.findMany({ role: 'MEMBER' });
    console.log(`   ✅ Found ${memberUsers.length} member users`);
    
    if (memberUsers.length === 0) {
      console.log('   ⚠️ No member users found for testing');
      return;
    }
    
    const testUser = memberUsers[0];
    console.log(`   📝 Testing with user: ${testUser.email}`);
    
    // Test 3: Attempt login
    console.log('\n3. Testing login API...');
    const loginData = {
      email: testUser.email,
      password: 'password123', // Common test password
      role: 'MEMBER'
    };
    
    try {
      const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData)
      });
      
      const loginResult = await loginResponse.json();
      console.log(`   Status: ${loginResponse.status}`);
      console.log(`   Response: ${JSON.stringify(loginResult, null, 2)}`);
      
      if (loginResponse.status === 200) {
        console.log('   ✅ Login API working');
        
        // Extract cookies for next request
        const cookies = loginResponse.headers.get('set-cookie');
        console.log(`   🍪 Cookies received: ${cookies ? 'Yes' : 'No'}`);
        
        // Test 4: Check authentication
        console.log('\n4. Testing authentication check...');
        const authHeaders = {};
        if (cookies) {
          authHeaders.Cookie = cookies;
        }
        
        const authResponse = await fetch(`${baseUrl}/api/auth/me`, {
          headers: authHeaders
        });
        
        const authResult = await authResponse.json();
        console.log(`   Status: ${authResponse.status}`);
        console.log(`   Response: ${JSON.stringify(authResult, null, 2)}`);
        
        if (authResponse.status === 200) {
          console.log('   ✅ Authentication working');
        } else {
          console.log('   ❌ Authentication failed');
        }
        
      } else {
        console.log('   ❌ Login failed');
      }
      
    } catch (error) {
      console.log(`   ❌ Login API error: ${error.message}`);
    }
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    try {
      const { db } = require('./lib/database');
      await db.$disconnect();
    } catch (error) {
      // Ignore disconnect errors
    }
  }
}

// Run the test
testMemberLogin();