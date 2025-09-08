// Test the new superadmin login directly
const testSuperAdminLogin = async () => {
  console.log('🧪 Testing SUPERADMIN login via API...\n')

  const testCredentials = {
    email: 'newadmin@luxylyfe.com',
    password: 'newadmin123',
    role: 'SUPERADMIN'
  }

  try {
    console.log('📧 Testing with credentials:')
    console.log(`   Email: ${testCredentials.email}`)
    console.log(`   Password: ${testCredentials.password}`)
    console.log(`   Role: ${testCredentials.role}`)
    console.log('')

    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testCredentials),
    })

    console.log(`📡 Response status: ${response.status}`)
    
    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ LOGIN SUCCESSFUL!')
      console.log(`   Welcome: ${data.user.name}`)
      console.log(`   Email: ${data.user.email}`)
      console.log(`   Role: ${data.user.role}`)
      console.log(`   Message: ${data.message}`)
      
      // Get cookies
      const cookies = response.headers.get('set-cookie')
      if (cookies) {
        console.log(`🍪 Auth token set: ${cookies.includes('auth-token') ? 'Yes' : 'No'}`)
      }
      
    } else {
      console.log('❌ LOGIN FAILED!')
      console.log(`   Error: ${data.error}`)
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.log('\n💡 Make sure the development server is running:')
    console.log('   npm run dev')
  }

  console.log('\n🌐 Manual test:')
  console.log('   1. Go to: http://localhost:3000/admin-login')
  console.log('   2. Use email: newadmin@luxylyfe.com')
  console.log('   3. Use password: newadmin123')
}

// Add a small delay to ensure server is ready
setTimeout(testSuperAdminLogin, 1000)
