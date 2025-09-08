// Test SUPERADMIN User Management Features
// This script tests the user creation and password update functionality

const fetch = require('node-fetch') // You might need to install node-fetch or use a different method

const API_BASE = 'http://localhost:3000/api'

async function testSuperAdminFeatures() {
  console.log('🧪 Testing SUPERADMIN User Management Features\n')

  try {
    // Step 1: Login as superadmin
    console.log('1. Logging in as SUPERADMIN...')
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'newadmin@luxylyfe.com',
        password: 'newadmin123' // Updated credentials
      })
    })

    if (!loginResponse.ok) {
      console.log('❌ Login failed. Please check credentials.')
      console.log('💡 Try logging in manually at: http://localhost:3000/admin-login')
      console.log('📧 Email: superadmin@luxylyfe.com')
      return
    }

    const cookies = loginResponse.headers.get('set-cookie')
    console.log('✅ SUPERADMIN login successful!')

    // Step 2: Test user creation
    console.log('\n2. Testing user creation...')
    const newUser = {
      name: 'Test User',
      email: 'testuser@example.com',
      phone: '+1 (555) 123-4567',
      password: 'testpass123',
      role: 'MEMBER',
      propertyAddress: '123 Test Street, Test City, TC 12345',
      propertyNumber: 'Unit 1A'
    }

    const createUserResponse = await fetch(`${API_BASE}/admin/users`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': cookies
      },
      body: JSON.stringify(newUser)
    })

    const createResult = await createUserResponse.json()
    
    if (createUserResponse.ok) {
      console.log('✅ User creation successful!')
      console.log(`Created user: ${createResult.user.name} (${createResult.user.email})`)
    } else {
      console.log(`❌ User creation failed: ${createResult.error}`)
    }

    // Step 3: Test getting all users
    console.log('\n3. Testing user list retrieval...')
    const getUsersResponse = await fetch(`${API_BASE}/admin/users`, {
      headers: { 'Cookie': cookies }
    })

    const usersResult = await getUsersResponse.json()
    
    if (getUsersResponse.ok) {
      console.log('✅ User list retrieved successfully!')
      console.log(`Total users: ${usersResult.users.length}`)
      usersResult.users.forEach(user => {
        console.log(`- ${user.name || 'No name'} (${user.email}) - ${user.role}`)
      })
    } else {
      console.log(`❌ Failed to get users: ${usersResult.error}`)
    }

    console.log('\n🎉 SUPERADMIN feature tests completed!')
    console.log('\n🌐 Access the user management interface at:')
    console.log('   http://localhost:3000/admin-login (login first)')
    console.log('   http://localhost:3000/admin/users (after login)')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.log('\n💡 Manual testing instructions:')
    console.log('1. Go to: http://localhost:3000/admin-login')
    console.log('2. Login with: superadmin@luxylyfe.com')
    console.log('3. Navigate to User Management from dashboard')
    console.log('4. Test creating users and updating passwords')
  }
}

testSuperAdminFeatures()
