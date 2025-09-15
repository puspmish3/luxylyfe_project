const { CosmosClient } = require('@azure/cosmos');
const bcrypt = require('bcryptjs');

async function createAdminUser() {
  try {
    const client = new CosmosClient({
      endpoint: process.env.COSMOS_DB_ENDPOINT,
      key: process.env.COSMOS_DB_KEY,
    });

    const database = client.database('luxylyfe');
    const container = database.container('users');

    // Check if admin user already exists
    const query = 'SELECT * FROM c WHERE c.email = "admin@luxylyfe.com"';
    const { resources: existingUsers } = await container.items.query(query).fetchAll();

    if (existingUsers.length > 0) {
      console.log('Admin user already exists with email: admin@luxylyfe.com');
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('admin123', 12);

    // Create admin user
    const adminUser = {
      id: `user_admin_${Date.now()}`,
      email: 'admin@luxylyfe.com',
      password: hashedPassword,
      role: 'ADMIN',
      firstName: 'Admin',
      lastName: 'User',
      name: 'Admin User',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const { resource: createdUser } = await container.items.create(adminUser);
    console.log('Admin user created successfully:');
    console.log('Email: admin@luxylyfe.com');
    console.log('Password: admin123');
    console.log('Role: ADMIN');
    console.log('User ID:', createdUser.id);

  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });

createAdminUser();