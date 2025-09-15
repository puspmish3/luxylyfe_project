// Test the requests API endpoint directly
// This script tests if the requests system is working properly

// Load environment variables from .env.local manually
const fs = require('fs');
const path = require('path');

function loadEnvFile() {
  try {
    const envPath = path.join(__dirname, '.env.local');
    const envFile = fs.readFileSync(envPath, 'utf8');
    const lines = envFile.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').replace(/^["']|["']$/g, ''); // Remove quotes
          process.env[key] = value;
        }
      }
    }
  } catch (error) {
    console.log('Warning: Could not load .env.local file:', error.message);
  }
}

loadEnvFile();

async function testRequestsAPI() {
  console.log('🧪 Testing Requests API');
  console.log('========================\n');

  try {
    // Test data for a contact us request
    const testRequest = {
      type: 'CONTACT_US',
      name: 'Test User',
      email: 'test@example.com',
      phone: '(555) 123-4567',
      subject: 'Test Subject',
      message: 'This is a test message to verify the requests system is working.'
    };

    console.log('📤 Sending test request...');
    console.log('Request data:', JSON.stringify(testRequest, null, 2));

    const response = await fetch('http://localhost:3000/api/requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testRequest),
    });

    console.log(`\n📡 Response Status: ${response.status}`);
    
    const responseData = await response.json();
    console.log('📋 Response Data:', JSON.stringify(responseData, null, 2));

    if (response.ok && responseData.success) {
      console.log('\n✅ SUCCESS: Requests API is working properly!');
      console.log(`📝 Request ID: ${responseData.data.id}`);
    } else {
      console.log('\n❌ FAILED: API returned an error');
      console.log('Error:', responseData.error);
    }

  } catch (error) {
    console.error('\n💥 ERROR: Failed to test API');
    console.error('Error:', error.message);
  }
}

// Wait a moment for server to be ready, then test
setTimeout(testRequestsAPI, 2000);