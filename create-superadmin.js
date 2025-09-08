// Create a SUPERADMIN user for testing
// Run this script to create the first superadmin user

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createSuperAdmin() {
  try {
    console.log('🔧 Creating SUPERADMIN user...')

    const email = 'superadmin@luxylyfe.com'
    const password = 'superadmin123'
    const name = 'Super Administrator'

    // Check if superadmin already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.log('❌ SUPERADMIN user already exists!')
      console.log(`Email: ${existingUser.email}`)
      console.log(`Role: ${existingUser.role}`)
      return
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create superadmin user
    const superAdmin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'SUPERADMIN'
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    })

    console.log('✅ SUPERADMIN user created successfully!')
    console.log('📧 Email:', email)
    console.log('🔑 Password:', password)
    console.log('👤 Name:', name)
    console.log('🔐 Role:', superAdmin.role)
    console.log('')
    console.log('🌐 You can now login at: http://localhost:3000/admin-login')
    console.log('')
    console.log('⚠️  IMPORTANT: Please change the password after first login!')

  } catch (error) {
    console.error('❌ Error creating SUPERADMIN user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createSuperAdmin()
