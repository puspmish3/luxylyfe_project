/**
 * Test member login flow
 */

const fetch = require('node-fetch');

async function testMemberLogin() {
  console.log('🔐 Testing Member Login Flow...\n');
  
  const baseUrl = 'http://localhost:3000';
  
  // Test credentials from our database
  const testCredentials = {
    email: 'member@luxylyfe.com',
    password: 'password123', // Replace with actual password
    role: 'MEMBER'
  };
  
  try {
    console.log('1. Testing login API...');
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testCredentials),
    });
    
    console.log(`   Login status: ${loginResponse.status}`);
    
    if (loginResponse.status === 200) {
      const loginData = await loginResponse.json();
      console.log(`   ✅ Login successful for: ${loginData.user.name || loginData.user.email}`);
      
      // Extract cookies
      const cookies = loginResponse.headers.get('set-cookie');
      console.log(`   🍪 Cookies set: ${cookies ? 'Yes' : 'No'}`);
      
      if (cookies) {
        // Test the /api/auth/me endpoint with cookies
        console.log('\n2. Testing session verification...');
        const meResponse = await fetch(`${baseUrl}/api/auth/me`, {
          headers: {
            'Cookie': cookies
          }
        });
        
        console.log(`   Session check status: ${meResponse.status}`);
        
        if (meResponse.status === 200) {
          const meData = await meResponse.json();
          console.log(`   ✅ Session valid for: ${meData.user.name || meData.user.email}`);
          console.log(`   👤 Role: ${meData.user.role}`);
          console.log(`   🔐 Is authenticated: ${meData.isAuthenticated}`);
        } else {
          const errorText = await meResponse.text();
          console.log(`   ❌ Session check failed: ${errorText}`);
        }
      }
      
    } else {
      const errorText = await loginResponse.text();
      console.log(`   ❌ Login failed: ${errorText}`);
    }
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }
  
  console.log('\n💡 If login works here but dashboard redirects, the issue is in the frontend session handling');
}

testMemberLogin();