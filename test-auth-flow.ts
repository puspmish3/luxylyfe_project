import 'dotenv/config'

const baseUrl = 'http://localhost:3000'

interface LoginResponse {
  success?: boolean
  error?: string
  user?: any
  sessionId?: string
  expiresAt?: string
}

interface MeResponse {
  user?: any
  isAuthenticated?: boolean
  error?: string
}

async function testLogin(email: string, password: string) {
  console.log(`\n🔐 Testing login for: ${email}`)
  
  try {
    // Test login
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    console.log(`Login response status: ${loginResponse.status}`)
    
    if (!loginResponse.ok) {
      const errorText = await loginResponse.text()
      console.log(`❌ Login failed: ${errorText}`)
      return
    }

    const loginData: LoginResponse = await loginResponse.json()
    console.log('✅ Login successful!')
    console.log('Response:', {
      success: loginData.success,
      user: loginData.user ? `${loginData.user.email} (${loginData.user.role})` : 'N/A',
      sessionId: loginData.sessionId?.substring(0, 10) + '...',
      expiresAt: loginData.expiresAt
    })

    // Extract cookies from login response
    const cookies = loginResponse.headers.get('set-cookie')
    console.log('Set-Cookie header:', cookies ? 'Present' : 'Missing')

    if (!cookies) {
      console.log('❌ No cookies set in login response')
      return
    }

    // Test /api/auth/me with the cookie
    console.log('\n🔍 Testing session verification...')
    const meResponse = await fetch(`${baseUrl}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Cookie': cookies
      }
    })

    console.log(`Me response status: ${meResponse.status}`)
    
    if (!meResponse.ok) {
      const errorText = await meResponse.text()
      console.log(`❌ Session verification failed: ${errorText}`)
      return
    }

    const meData: MeResponse = await meResponse.json()
    console.log('✅ Session verification successful!')
    console.log('Response:', {
      isAuthenticated: meData.isAuthenticated,
      user: meData.user ? `${meData.user.email} (${meData.user.role})` : 'N/A'
    })

  } catch (error) {
    console.log(`❌ Test failed with error:`, error)
  }
}

async function runTests() {
  console.log('🧪 Running authentication tests...')
  
  const testCredentials = [
    { email: 'member@luxylyfe.com', password: 'member123' },
    { email: 'admin@luxylyfe.com', password: 'admin123' },
    { email: 'superadmin@luxylyfe.com', password: 'superadmin123' }
  ]

  for (const creds of testCredentials) {
    await testLogin(creds.email, creds.password)
    await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second between tests
  }

  console.log('\n✨ Authentication tests completed!')
}

runTests().catch(console.error)