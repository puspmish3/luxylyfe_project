import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../lib/auth'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Hash passwords
  const adminPassword = await hashPassword('admin123')
  const memberPassword = await hashPassword('member123')
  const superAdminPassword = await hashPassword('superadmin123')
  const managerPassword = await hashPassword('manager123')

  // Create super admin user
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@luxylyfe.com' },
    update: {},
    create: {
      email: 'superadmin@luxylyfe.com',
      password: superAdminPassword,
      role: 'ADMIN',
      name: 'Super Administrator',
      phone: '+1-555-0001'
    }
  })

  // Create main admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@luxylyfe.com' },
    update: {},
    create: {
      email: 'admin@luxylyfe.com',
      password: adminPassword,
      role: 'ADMIN',
      name: 'LuxyLyfe Administrator',
      phone: '+1-555-0100'
    }
  })

  // Create property manager admin
  const manager = await prisma.user.upsert({
    where: { email: 'manager@luxylyfe.com' },
    update: {},
    create: {
      email: 'manager@luxylyfe.com',
      password: managerPassword,
      role: 'ADMIN',
      name: 'Property Manager',
      phone: '+1-555-0150'
    }
  })

  // Create member user
  const member = await prisma.user.upsert({
    where: { email: 'member@luxylyfe.com' },
    update: {},
    create: {
      email: 'member@luxylyfe.com',
      password: memberPassword,
      role: 'MEMBER',
      name: 'John Doe',
      phone: '+1-555-0200',
      propertyAddress: '123 Luxury Lane, Beverly Hills, CA 90210',
      propertyNumber: 'Unit 101'
    }
  })

  // Create additional test member
  const member2 = await prisma.user.upsert({
    where: { email: 'jane.smith@email.com' },
    update: {},
    create: {
      email: 'jane.smith@email.com',
      password: memberPassword,
      role: 'MEMBER',
      name: 'Jane Smith',
      phone: '+1-555-0250',
      propertyAddress: '456 Elite Drive, Manhattan, NY 10021',
      propertyNumber: 'Penthouse A'
    }
  })

  console.log('✅ Database seeded successfully!')
  console.log('\n📋 Test Credentials:')
  console.log('\n� ADMIN ACCOUNTS:')
  console.log('�👤 Super Admin:')
  console.log('   Email: superadmin@luxylyfe.com')
  console.log('   Password: superadmin123')
  console.log('\n👤 Main Admin:')
  console.log('   Email: admin@luxylyfe.com')
  console.log('   Password: admin123')
  console.log('\n👤 Property Manager:')
  console.log('   Email: manager@luxylyfe.com')
  console.log('   Password: manager123')
  console.log('\n👥 MEMBER ACCOUNTS:')
  console.log('👤 Member 1:')
  console.log('   Email: member@luxylyfe.com')
  console.log('   Password: member123')
  console.log('\n👤 Member 2:')
  console.log('   Email: jane.smith@email.com')
  console.log('   Password: member123')
  console.log('\n🔒 Important: Change these credentials in production!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
