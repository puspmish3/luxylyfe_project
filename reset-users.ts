
import 'dotenv/config'
import { db } from './lib/database'
import bcrypt from 'bcryptjs'

interface TestUser {
  email: string
  password: string
  name: string
  role: 'MEMBER' | 'ADMIN' | 'SUPERADMIN'
}

const testUsers: TestUser[] = [
  {
    email: 'superadmin@luxylyfe.com',
    password: 'superadmin123',
    name: 'Super Admin',
    role: 'SUPERADMIN'
  },
  {
    email: 'admin@luxylyfe.com',
    password: 'admin123',
    name: 'Test Admin',
    role: 'ADMIN'
  },
  {
    email: 'member@luxylyfe.com',
    password: 'member123',
    name: 'Test Member',
    role: 'MEMBER'
  },
  {
    email: 'member2@luxylyfe.com',
    password: 'member456',
    name: 'Another Member',
    role: 'MEMBER'
  },
  {
    email: 'jane.smith@email.com',
    password: 'member789',
    name: 'Jane Smith',
    role: 'MEMBER'
  },
  {
    email: 'debamohapatra@luxylyfe.biz',
    password: 'deba123',
    name: 'Deba Mohapatra',
    role: 'MEMBER'
  }
]

async function resetUsers() {
  try {
    console.log('🔄 Starting user reset process...')

    // Delete all existing users
    console.log('🗑️  Deleting all existing users...')
    const existingUsers = await db.user.findMany()
    console.log(`Found ${existingUsers.length} existing users`)
    
    for (const user of existingUsers) {
      try {
        await db.user.delete({ id: user.id })
        console.log(`✅ Deleted user: ${user.email}`)
      } catch (error: any) {
        if (error.code === 404 || error.body?.code === 'NotFound') {
          console.log(`ℹ️  User already deleted or not found: ${user.email}`)
        } else {
          console.log(`❌ Failed to delete user ${user.email}:`, error)
        }
      }
    }

    // Delete all existing sessions
    console.log('🗑️  Deleting all existing sessions...')
    const existingSessions = await db.session.findMany()
    console.log(`Found ${existingSessions.length} existing sessions`)
    
    for (const session of existingSessions) {
      try {
        await db.session.delete({ id: session.id })
        console.log(`✅ Deleted session: ${session.id}`)
      } catch (error: any) {
        if (error.code === 404 || error.body?.code === 'NotFound') {
          console.log(`ℹ️  Session already deleted or not found: ${session.id}`)
        } else {
          console.log(`❌ Failed to delete session ${session.id}:`, error)
        }
      }
    }

    // Create fresh test users
    console.log('👥 Creating fresh test users...')
    
    for (const testUser of testUsers) {
      try {
        const hashedPassword = await bcrypt.hash(testUser.password, 10)
        
        const newUser = await db.user.create({
          email: testUser.email,
          password: hashedPassword,
          name: testUser.name,
          role: testUser.role,
          phone: '',
          propertyAddress: '',
          propertyNumber: ''
        })
        
        console.log(`✅ Created ${testUser.role.toLowerCase()}: ${testUser.email} (ID: ${newUser.id})`)
      } catch (error) {
        console.log(`❌ Failed to create user ${testUser.email}:`, error)
      }
    }

    console.log('\n🎉 User reset complete! Test credentials:')
    console.log('Super Admin: superadmin@luxylyfe.com / superadmin123')
    console.log('Admin: admin@luxylyfe.com / admin123')
    console.log('Member: member@luxylyfe.com / member123')
    console.log('Member 2: member2@luxylyfe.com / member456')
    console.log('Jane Smith: jane.smith@email.com / member789')
    console.log('Deba Mohapatra: debamohapatra@luxylyfe.biz / deba123')

    // Verify created users
    console.log('\n🔍 Verifying created users...')
    const createdUsers = await db.user.findMany()
    console.log(`Total users in database: ${createdUsers.length}`)
    
    for (const user of createdUsers) {
      console.log(`- ${user.email} (${user.role}) - ID: ${user.id}`)
    }

  } catch (error) {
    console.error('❌ Error during user reset:', error)
    throw error
  }
}

// Run the reset
resetUsers()
  .then(() => {
    console.log('\n✨ User reset script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Script failed:', error)
    process.exit(1)
  })
