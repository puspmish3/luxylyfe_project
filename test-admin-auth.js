// Test script for admin authentication
// Run this with: node test-admin-auth.js

const testAdminLogin = async (email, password) => {
  try {
    console.log(`\n🔐 Testing login for: ${email}`);
    
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        role: 'ADMIN'
      }),
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ Login successful for ${email}`);
      console.log(`   User: ${data.user.name || 'No name'}`);
      console.log(`   Role: ${data.user.role}`);
    } else {
      console.log(`❌ Login failed for ${email}: ${data.error}`);
    }
  } catch (error) {
    console.log(`❌ Error testing ${email}: ${error.message}`);
  }
};

const runTests = async () => {
  console.log('🚀 Testing Admin Authentication System\n');
  
  // Test all admin accounts
  await testAdminLogin('newadmin@luxylyfe.com', 'newadmin123');
  await testAdminLogin('admin@luxylyfe.com', 'admin123');
  await testAdminLogin('manager@luxylyfe.com', 'manager123');
  
  // Test invalid credentials
  await testAdminLogin('admin@luxylyfe.com', 'wrongpassword');
  await testAdminLogin('nonexistent@luxylyfe.com', 'admin123');
  
  console.log('\n✨ Test completed!');
};

// Wait a moment for server to be ready, then run tests
setTimeout(runTests, 2000);
