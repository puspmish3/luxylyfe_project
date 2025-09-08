// Check all existing users
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkAllUsers() {
  try {
    console.log('👥 Checking all existing users...\n')

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`Found ${users.length} users:`)
    console.log('----------------------------------------')
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name || 'No name'}`)
      console.log(`   📧 Email: ${user.email}`)
      console.log(`   🔐 Role: ${user.role}`)
      console.log(`   📅 Created: ${new Date(user.createdAt).toLocaleDateString()}`)
      console.log('')
    })

  } catch (error) {
    console.error('❌ Error checking users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAllUsers()
