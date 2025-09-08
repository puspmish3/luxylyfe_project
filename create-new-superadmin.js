// Create a new SUPERADMIN user and delete the old one
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createNewSuperAdminAndDeleteOld() {
  try {
    console.log('🔧 Creating new SUPERADMIN user and removing old one...\n')

    // New superadmin details
    const newSuperAdmin = {
      email: 'newadmin@luxylyfe.com',
      password: 'newadmin123',
      name: 'New LuxyLyfe Administrator'
    }

    const oldSuperAdminEmail = 'superadmin@luxylyfe.com'

    // Step 1: Check if old superadmin exists
    console.log('1. Checking existing SUPERADMIN...')
    const oldUser = await prisma.user.findUnique({
      where: { email: oldSuperAdminEmail }
    })

    if (!oldUser) {
      console.log('❌ Old SUPERADMIN user not found!')
      return
    }

    console.log(`✅ Found old SUPERADMIN: ${oldUser.email} (${oldUser.role})`)

    // Step 2: Check if new email already exists
    console.log('\n2. Checking if new email is available...')
    const existingNewUser = await prisma.user.findUnique({
      where: { email: newSuperAdmin.email }
    })

    if (existingNewUser) {
      console.log('❌ New email already exists! Choose a different email.')
      return
    }

    console.log('✅ New email is available')

    // Step 3: Create new superadmin
    console.log('\n3. Creating new SUPERADMIN user...')
    const hashedPassword = await bcrypt.hash(newSuperAdmin.password, 12)

    const newUser = await prisma.user.create({
      data: {
        email: newSuperAdmin.email,
        password: hashedPassword,
        name: newSuperAdmin.name,
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

    console.log('✅ New SUPERADMIN created successfully!')
    console.log(`📧 Email: ${newUser.email}`)
    console.log(`👤 Name: ${newUser.name}`)
    console.log(`🔐 Role: ${newUser.role}`)

    // Step 4: Delete old superadmin
    console.log('\n4. Deleting old SUPERADMIN user...')
    
    // First delete any sessions for the old user
    await prisma.session.deleteMany({
      where: { userId: oldUser.id }
    })

    // Then delete the old user
    await prisma.user.delete({
      where: { id: oldUser.id }
    })

    console.log(`✅ Old SUPERADMIN user deleted: ${oldSuperAdminEmail}`)

    // Step 5: Summary
    console.log('\n🎉 SUPERADMIN replacement completed!')
    console.log('\n📋 NEW LOGIN CREDENTIALS:')
    console.log(`📧 Email: ${newSuperAdmin.email}`)
    console.log(`🔑 Password: ${newSuperAdmin.password}`)
    console.log(`👤 Name: ${newSuperAdmin.name}`)
    console.log(`🔐 Role: SUPERADMIN`)
    console.log('')
    console.log('🌐 Login at: http://localhost:3000/admin-login')
    console.log('')
    console.log('⚠️  IMPORTANT: Please change the password after first login!')

  } catch (error) {
    console.error('❌ Error during SUPERADMIN replacement:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createNewSuperAdminAndDeleteOld()
