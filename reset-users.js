
// Script to delete all users and create new default users in Cosmos DB (ESM version)
import db from './lib/database.js';
import bcrypt from 'bcryptjs';

async function resetUsers() {
  console.log('Deleting all users...');
  const users = await db.user.findMany();
  for (const user of users) {
    await db.user.delete({ id: user.id });
    console.log('Deleted user:', user.email);
  }

  // New users to create
  const newUsers = [
    {
      email: 'superadmin@luxylyfe.com',
      password: await bcrypt.hash('superadmin123', 12),
      role: 'SUPERADMIN',
      name: 'Super Admin',
      phone: '',
      propertyAddress: '',
      propertyNumber: ''
    },
    {
      email: 'admin@luxylyfe.com',
      password: await bcrypt.hash('admin123', 12),
      role: 'ADMIN',
      name: 'Admin User',
      phone: '',
      propertyAddress: '',
      propertyNumber: ''
    },
    {
      email: 'member@luxylyfe.com',
      password: await bcrypt.hash('member123', 12),
      role: 'MEMBER',
      name: 'Member One',
      phone: '',
      propertyAddress: '',
      propertyNumber: ''
    },
    {
      email: 'jane.smith@email.com',
      password: await bcrypt.hash('member123', 12),
      role: 'MEMBER',
      name: 'Jane Smith',
      phone: '',
      propertyAddress: '',
      propertyNumber: ''
    },
    {
      email: 'debamohapatra@luxylyfe.biz',
      password: await bcrypt.hash('member123', 12),
      role: 'MEMBER',
      name: 'Deba Mohapatra',
      phone: '',
      propertyAddress: '',
      propertyNumber: ''
    }
  ];

  for (const user of newUsers) {
    const created = await db.user.create(user);
    console.log('Created user:', created.email, created.role);
  }

  console.log('User reset complete.');
}

resetUsers().catch(console.error);
