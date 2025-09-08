// Test Member Signup Validation
// This script tests the member signup validation against property data

const API_BASE = 'http://localhost:3000/api'

async function testMemberSignupValidation() {
  console.log('🧪 Testing Member Signup Validation\n')

  try {
    // 1. Get available properties first
    console.log('1. Fetching available properties...')
    const propertiesResponse = await fetch(`${API_BASE}/properties/available`)
    const propertiesData = await propertiesResponse.json()
    
    if (!propertiesResponse.ok) {
      throw new Error('Failed to fetch properties')
    }
    
    console.log(`✅ Found ${propertiesData.properties.length} available properties`)
    
    // Show first few properties
    console.log('\nAvailable Properties:')
    propertiesData.properties.slice(0, 3).forEach(prop => {
      console.log(`- ${prop.propertyId}: ${prop.title}`)
      console.log(`  Email: ${prop.email || 'N/A'}`)
      console.log(`  Phone: ${prop.phone || 'N/A'}`)
      console.log(`  Address: ${prop.address}, ${prop.city}, ${prop.state}`)
      console.log('')
    })

    // 2. Test valid signup (using first property with contact info)
    const testProperty = propertiesData.properties.find(p => p.email && p.phone)
    
    if (testProperty) {
      console.log(`2. Testing VALID signup with Property ID: ${testProperty.propertyId}`)
      
      const validSignup = {
        name: 'John Smith',
        email: testProperty.email,
        phone: testProperty.phone,
        password: 'testpass123',
        propertyId: testProperty.propertyId,
        propertyAddress: `${testProperty.address}, ${testProperty.city}, ${testProperty.state} ${testProperty.zipCode}`,
        propertyNumber: 'Unit 1A',
        role: 'MEMBER'
      }

      const validResponse = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validSignup)
      })

      const validResult = await validResponse.json()
      
      if (validResponse.ok) {
        console.log('✅ Valid signup successful!')
        console.log(`User created: ${validResult.user.name} (${validResult.user.email})`)
        console.log(`Property: ${validResult.propertyInfo?.title}\n`)
      } else {
        console.log(`❌ Valid signup failed: ${validResult.error}\n`)
      }
    }

    // 3. Test invalid email
    if (testProperty) {
      console.log(`3. Testing INVALID email with Property ID: ${testProperty.propertyId}`)
      
      const invalidEmailSignup = {
        name: 'Jane Doe',
        email: 'wrong.email@example.com',
        phone: testProperty.phone,
        password: 'testpass123',
        propertyId: testProperty.propertyId,
        propertyAddress: `${testProperty.address}, ${testProperty.city}, ${testProperty.state} ${testProperty.zipCode}`,
        propertyNumber: 'Unit 2B',
        role: 'MEMBER'
      }

      const invalidEmailResponse = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidEmailSignup)
      })

      const invalidEmailResult = await invalidEmailResponse.json()
      
      if (!invalidEmailResponse.ok) {
        console.log(`✅ Invalid email correctly rejected: ${invalidEmailResult.error}\n`)
      } else {
        console.log(`❌ Invalid email should have been rejected!\n`)
      }
    }

    // 4. Test invalid phone
    if (testProperty) {
      console.log(`4. Testing INVALID phone with Property ID: ${testProperty.propertyId}`)
      
      const invalidPhoneSignup = {
        name: 'Bob Wilson',
        email: testProperty.email,
        phone: '+1 (999) 999-9999',
        password: 'testpass123',
        propertyId: testProperty.propertyId,
        propertyAddress: `${testProperty.address}, ${testProperty.city}, ${testProperty.state} ${testProperty.zipCode}`,
        propertyNumber: 'Unit 3C',
        role: 'MEMBER'
      }

      const invalidPhoneResponse = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidPhoneSignup)
      })

      const invalidPhoneResult = await invalidPhoneResponse.json()
      
      if (!invalidPhoneResponse.ok) {
        console.log(`✅ Invalid phone correctly rejected: ${invalidPhoneResult.error}\n`)
      } else {
        console.log(`❌ Invalid phone should have been rejected!\n`)
      }
    }

    // 5. Test invalid property ID
    console.log('5. Testing INVALID Property ID')
    
    const invalidPropertySignup = {
      name: 'Alice Brown',
      email: 'alice@example.com',
      phone: '+1 (555) 555-5555',
      password: 'testpass123',
      propertyId: 'INVALID-999',
      propertyAddress: '123 Fake Street, Test City, TC 12345',
      propertyNumber: 'Unit 4D',
      role: 'MEMBER'
    }

    const invalidPropertyResponse = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidPropertySignup)
    })

    const invalidPropertyResult = await invalidPropertyResponse.json()
    
    if (!invalidPropertyResponse.ok) {
      console.log(`✅ Invalid Property ID correctly rejected: ${invalidPropertyResult.error}\n`)
    } else {
      console.log(`❌ Invalid Property ID should have been rejected!\n`)
    }

    console.log('🎉 Signup validation tests completed!')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

// Run the test
testMemberSignupValidation()
