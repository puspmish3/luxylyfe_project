// Debug superadmin login - check user and test password
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function debugSuperAdminLogin() {
  try {
    console.log('� Debugging SUPERADMIN login issue...\n')

    const email = 'newadmin@luxylyfe.com'
    const testPassword = 'newadmin123'

    // Step 1: Check if user exists
    console.log('1. Checking if user exists in database...')
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true,
        createdAt: true
      }
    })

    if (!user) {
      console.log('❌ User not found in database!')
      return
    }

    console.log('✅ User found:')
    console.log(`   📧 Email: ${user.email}`)
    console.log(`   👤 Name: ${user.name}`)
    console.log(`   🔐 Role: ${user.role}`)
    console.log(`   🆔 ID: ${user.id}`)
    console.log(`   📅 Created: ${user.createdAt}`)
    console.log(`   🔒 Password Hash: ${user.password.substring(0, 20)}...`)

    // Step 2: Test password hash
    console.log('\n2. Testing password verification...')
    const passwordMatch = await bcrypt.compare(testPassword, user.password)
    
    if (passwordMatch) {
      console.log('✅ Password verification successful!')
    } else {
      console.log('❌ Password verification failed!')
      console.log(`   Expected password: ${testPassword}`)
      
      // Test if it might be a different password
      const commonPasswords = ['admin123', 'superadmin123', 'newadmin123']
      console.log('\n   Testing common passwords:')
      
      for (const pwd of commonPasswords) {
        const match = await bcrypt.compare(pwd, user.password)
        console.log(`   - ${pwd}: ${match ? '✅ MATCH' : '❌ No match'}`)
      }
    }

    // Step 3: Create a test hash to compare
    console.log('\n3. Creating test hash for comparison...')
    const testHash = await bcrypt.hash(testPassword, 12)
    console.log(`   Test hash: ${testHash.substring(0, 20)}...`)
    
    const testVerification = await bcrypt.compare(testPassword, testHash)
    console.log(`   Test verification: ${testVerification ? '✅ Works' : '❌ Failed'}`)

  } catch (error) {
    console.error('❌ Debug error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugSuperAdminLogin()
