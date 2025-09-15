/**
 * Simple Test: Login and Session Check
 * This simulates what happens when a user logs in and the dashboard checks the session
 */

const https = require('https');
const querystring = require('querystring');

// Function to make HTTP request
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body
        });
      });
    });
    
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function testLoginFlow() {
  console.log('🧪 Testing Login Flow...\n');
  
  try {
    // Step 1: Login
    console.log('1. Attempting login...');
    const loginData = JSON.stringify({
      email: 'member@luxylyfe.com',
      password: 'member123',
      role: 'MEMBER'
    });
    
    const loginOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginData)
      }
    };
    
    const loginResponse = await makeRequest(loginOptions, loginData);
    console.log(`   Status: ${loginResponse.statusCode}`);
    
    if (loginResponse.statusCode === 200) {
      console.log('   ✅ Login successful!');
      const cookies = loginResponse.headers['set-cookie'];
      
      if (cookies) {
        console.log('   🍪 Cookies received');
        
        // Step 2: Check session
        console.log('\n2. Checking session...');
        const sessionOptions = {
          hostname: 'localhost',
          port: 3000,
          path: '/api/auth/me',
          method: 'GET',
          headers: {
            'Cookie': cookies.join('; ')
          }
        };
        
        const sessionResponse = await makeRequest(sessionOptions);
        console.log(`   Status: ${sessionResponse.statusCode}`);
        
        if (sessionResponse.statusCode === 200) {
          console.log('   ✅ Session valid!');
          const userData = JSON.parse(sessionResponse.body);
          console.log(`   👤 User: ${userData.user.name} (${userData.user.role})`);
          console.log('\n🎉 Authentication flow working! Member dashboard should load properly.');
        } else {
          console.log('   ❌ Session check failed');
          console.log(`   Error: ${sessionResponse.body}`);
        }
      } else {
        console.log('   ❌ No cookies received from login');
      }
    } else {
      console.log('   ❌ Login failed');
      console.log(`   Error: ${loginResponse.body}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testLoginFlow();