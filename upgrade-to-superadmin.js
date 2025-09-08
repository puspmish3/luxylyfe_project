// Update existing admin user to SUPERADMIN role
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function upgradeToSuperAdmin() {
  try {
    console.log('🔄 Upgrading existing admin to SUPERADMIN...')

    const email = 'superadmin@luxylyfe.com'

    // Find and update the user
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role: 'SUPERADMIN' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    })

    console.log('✅ User upgraded to SUPERADMIN successfully!')
    console.log('📧 Email:', updatedUser.email)
    console.log('👤 Name:', updatedUser.name)
    console.log('🔐 Role:', updatedUser.role)
    console.log('')
    console.log('🌐 You can now login at: http://localhost:3000/admin-login')
    console.log('🔑 Use existing credentials to login and access user management')

  } catch (error) {
    console.error('❌ Error upgrading user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

upgradeToSuperAdmin()
