// Example: Hybrid Database Usage
// This demonstrates how to use both MongoDB Atlas (via Prisma) and Cosmos DB SQL API

import { prisma } from '../lib/prisma';
import { cosmosModels } from '../lib/cosmos';

// Example API route demonstrating hybrid approach
export default async function handler(req: any, res: any) {
  try {
    // Get data from MongoDB Atlas (existing Prisma setup)
    const atlasUsers = await prisma.user.count();
    const atlasProperties = await prisma.property.count();
    
    // Get data from Cosmos DB SQL API (new setup)
    const cosmosUsers = await cosmosModels.users.count();
    const cosmosProperties = await cosmosModels.properties.count();
    
    // Return comparison
    res.json({
      databases: {
        atlas: {
          users: atlasUsers,
          properties: atlasProperties,
          provider: 'MongoDB Atlas (Prisma ORM)'
        },
        cosmos: {
          users: cosmosUsers,
          properties: cosmosProperties,
          provider: 'Azure Cosmos DB SQL API'
        }
      },
      note: 'This demonstrates hybrid database usage'
    });
    
  } catch (error: any) {
    res.status(500).json({ 
      error: 'Database connection failed',
      details: error?.message || 'Unknown error'
    });
  }
}

// Example: Creating a user in both databases
export async function createUserInBothDBs(userData: any) {
  try {
    // Create in MongoDB Atlas via Prisma
    const atlasUser = await prisma.user.create({
      data: {
        email: userData.email,
        password: userData.password,
        role: userData.role,
        name: userData.name,
      }
    });

    // Create in Cosmos DB SQL API
    const cosmosUser = await cosmosModels.users.create({
      email: userData.email,
      password: userData.password,
      role: userData.role,
      name: userData.name,
    });

    return {
      atlas: atlasUser,
      cosmos: cosmosUser,
      success: true
    };
  } catch (error) {
    console.error('Failed to create user in both databases:', error);
    throw error;
  }
}

// Example: Migration utility function
export async function migrateUserToCosmos(userId: string) {
  try {
    // Get user from MongoDB Atlas
    const atlasUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!atlasUser) {
      throw new Error('User not found in Atlas');
    }

    // Create in Cosmos DB
    const cosmosUser = await cosmosModels.users.create({
      id: atlasUser.id,
      email: atlasUser.email,
      password: atlasUser.password,
      role: atlasUser.role,
      name: atlasUser.name,
      phone: atlasUser.phone,
      propertyAddress: atlasUser.propertyAddress,
      propertyNumber: atlasUser.propertyNumber,
    });

    return {
      migrated: true,
      atlasUser,
      cosmosUser
    };
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}