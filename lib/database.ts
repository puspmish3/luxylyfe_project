// Database Client - Cosmos DB Primary Implementation
// This replaces Prisma and provides a unified interface for the application

import { CosmosClient } from '@azure/cosmos';
import bcrypt from 'bcryptjs';

// Types for our models
export interface User {
  id: string;
  email: string;
  password: string;
  role: 'SUPERADMIN' | 'ADMIN' | 'MEMBER';
  name?: string;
  phone?: string;
  propertyAddress?: string;
  propertyNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Property {
  id: string;
  propertyId: string;
  title: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  propertyType: string;
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  lotSize?: number;
  price: number;
  description?: string;
  amenities: string[];
  images: string[];
  email?: string;
  phone?: string;
  isAvailable: boolean;
  isFeature: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  createdAt: string;
}

export interface LoginAttempt {
  id: string;
  email: string;
  ipAddress?: string;
  success: boolean;
  createdAt: string;
}

export interface PageContent {
  id: string;
  pageType: string;
  sectionType: string;
  title?: string;
  subtitle?: string;
  content?: string;
  images: string[];
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface SiteSettings {
  id: string;
  key: string;
  value: string;
  description?: string;
  dataType: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  updatedBy?: string;
}

// Cosmos DB configuration
const cosmosConfig = {
  endpoint: process.env.COSMOS_DB_ENDPOINT!,
  key: process.env.COSMOS_DB_KEY!,
  databaseId: process.env.COSMOS_DB_DATABASE_NAME || 'luxylyfe-db',
};

// Create Cosmos DB client
let cosmosClientInstance: CosmosClient | null = null;

function getCosmosClient(): CosmosClient {
  if (!cosmosClientInstance) {
    if (!process.env.COSMOS_DB_ENDPOINT || !process.env.COSMOS_DB_KEY) {
      throw new Error('Cosmos DB configuration missing. Please set COSMOS_DB_ENDPOINT and COSMOS_DB_KEY in your environment.');
    }
    
    cosmosClientInstance = new CosmosClient({
      endpoint: cosmosConfig.endpoint,
      key: cosmosConfig.key,
    });
  }
  
  return cosmosClientInstance;
}

// Get database reference
function getCosmosDatabase() {
  const client = getCosmosClient();
  return client.database(cosmosConfig.databaseId);
}

// Helper function to generate IDs
function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

// Helper function to handle timestamps
function addTimestamps(data: any, isUpdate = false) {
  const now = new Date().toISOString();
  if (!isUpdate) {
    data.createdAt = now;
  }
  data.updatedAt = now;
  return data;
}

// Database client implementation
export const db = {
  // User operations
  user: {
    async create(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) {
      const container = getCosmosDatabase().container('users');
      const user = {
        id: generateId(),
        ...addTimestamps(data),
      };
      const { resource } = await container.items.create(user);
      return resource as User;
    },

    async findUnique(where: { id?: string; email?: string }) {
      const container = getCosmosDatabase().container('users');

      if (where.email) {
        const { resources } = await container.items
          .query({
            query: 'SELECT * FROM c WHERE c.email = @email',
            parameters: [{ name: '@email', value: where.email }]
          })
          .fetchAll();
        // Always return the first match (should be unique by email)
        return resources[0] as User | null;
      }

      return null;
    },

    async findMany(where?: { role?: string }) {
      const container = getCosmosDatabase().container('users');
      
      if (where?.role) {
        const { resources } = await container.items
          .query({
            query: 'SELECT * FROM c WHERE c.role = @role',
            parameters: [{ name: '@role', value: where.role }]
          })
          .fetchAll();
        // Sort on client side to avoid index issues
        return (resources as User[]).sort((a, b) => 
          new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
        );
      }
      
      const { resources } = await container.items
        .query('SELECT * FROM c')
        .fetchAll();
      // Sort on client side to avoid index issues
      return (resources as User[]).sort((a, b) => 
        new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
      );
    },

    async update(where: { id: string }, data: Partial<User>) {
      const container = getCosmosDatabase().container('users');
      const existing = await this.findUnique(where);
      if (!existing) throw new Error('User not found');
      
      const updated = {
        ...existing,
        ...addTimestamps(data, true),
      };
      
      const { resource } = await container.item(where.id, where.id).replace(updated);
      return resource as User;
    },

    async delete(where: { id: string }) {
      const container = getCosmosDatabase().container('users');
      const { resource } = await container.item(where.id, where.id).delete();
      return resource as User;
    },

    async count(where?: { role?: string }) {
      const container = getCosmosDatabase().container('users');
      
      if (where?.role) {
        const { resources } = await container.items
          .query({
            query: 'SELECT VALUE COUNT(1) FROM c WHERE c.role = @role',
            parameters: [{ name: '@role', value: where.role }]
          })
          .fetchAll();
        return resources[0] || 0;
      }
      
      const { resources } = await container.items
        .query('SELECT VALUE COUNT(1) FROM c')
        .fetchAll();
      return resources[0] || 0;
    },
  },

  // Property operations
  property: {
    async create(data: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>) {
      const container = getCosmosDatabase().container('properties');
      const property = {
        id: generateId(),
        ...addTimestamps(data),
      };
      const { resource } = await container.items.create(property);
      return resource as Property;
    },

    async findUnique(where: { id?: string; propertyId?: string }) {
      const container = getCosmosDatabase().container('properties');
      
      if (where.id) {
        try {
          const { resource } = await container.item(where.id, where.id).read();
          return resource as Property | null;
        } catch (error: any) {
          if (error.code === 404) return null;
          throw error;
        }
      }
      
      if (where.propertyId) {
        const { resources } = await container.items
          .query({
            query: 'SELECT * FROM c WHERE c.propertyId = @propertyId',
            parameters: [{ name: '@propertyId', value: where.propertyId }]
          })
          .fetchAll();
        return resources[0] as Property | null;
      }
      
      return null;
    },

    async findMany(where?: { isAvailable?: boolean; isFeature?: boolean }) {
      const container = getCosmosDatabase().container('properties');
      let query = 'SELECT * FROM c';
      const parameters: any[] = [];
      
      if (where?.isAvailable !== undefined || where?.isFeature !== undefined) {
        const conditions: string[] = [];
        if (where.isAvailable !== undefined) {
          conditions.push('c.isAvailable = @isAvailable');
          parameters.push({ name: '@isAvailable', value: where.isAvailable });
        }
        if (where.isFeature !== undefined) {
          conditions.push('c.isFeature = @isFeature');
          parameters.push({ name: '@isFeature', value: where.isFeature });
        }
        query += ' WHERE ' + conditions.join(' AND ');
      }
      
      // Remove ORDER BY to avoid index issues - sort on client side
      
      const { resources } = await container.items
        .query({ query, parameters })
        .fetchAll();
      // Sort on client side to avoid index issues
      return (resources as Property[]).sort((a, b) => 
        new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
      );
    },

    async update(where: { id: string }, data: Partial<Property>) {
      const container = getCosmosDatabase().container('properties');
      const existing = await this.findUnique(where);
      if (!existing) throw new Error('Property not found');
      
      const updated = {
        ...existing,
        ...addTimestamps(data, true),
      };
      
      const { resource } = await container.item(where.id, where.id).replace(updated);
      return resource as Property;
    },

    async delete(where: { id: string }) {
      const container = getCosmosDatabase().container('properties');
      const { resource } = await container.item(where.id, where.id).delete();
      return resource as Property;
    },

    async count() {
      const container = getCosmosDatabase().container('properties');
      const { resources } = await container.items
        .query('SELECT VALUE COUNT(1) FROM c')
        .fetchAll();
      return resources[0] || 0;
    },
  },

  // Session operations
  session: {
    async create(data: Omit<Session, 'id' | 'createdAt'>) {
      const container = getCosmosDatabase().container('sessions');
      const session = {
        id: generateId(),
        ...data,
        createdAt: new Date().toISOString(),
      };
      const { resource } = await container.items.create(session);
      return resource as Session;
    },

    async findUnique(where: { id?: string; token?: string }) {
      const container = getCosmosDatabase().container('sessions');
      
      if (where.id) {
        try {
          const { resource } = await container.item(where.id, where.id).read();
          return resource as Session | null;
        } catch (error: any) {
          if (error.code === 404) return null;
          throw error;
        }
      }
      
      if (where.token) {
        const { resources } = await container.items
          .query({
            query: 'SELECT * FROM c WHERE c.token = @token',
            parameters: [{ name: '@token', value: where.token }]
          })
          .fetchAll();
        return resources[0] as Session | null;
      }
      
      return null;
    },

    async findMany(where?: { userId?: string }) {
      const container = getCosmosDatabase().container('sessions');
      
      if (where?.userId) {
        const { resources } = await container.items
          .query({
            query: 'SELECT * FROM c WHERE c.userId = @userId',
            parameters: [{ name: '@userId', value: where.userId }]
          })
          .fetchAll();
        // Sort on client side to avoid index issues
        return (resources as Session[]).sort((a, b) => 
          new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
        );
      }
      
      const { resources } = await container.items
        .query('SELECT * FROM c')
        .fetchAll();
      // Sort on client side to avoid index issues
      return (resources as Session[]).sort((a, b) => 
        new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
      );
    },

    async delete(where: { id: string }) {
      const container = getCosmosDatabase().container('sessions');
      const { resource } = await container.item(where.id, where.id).delete();
      return resource as Session;
    },

    async count() {
      const container = getCosmosDatabase().container('sessions');
      const { resources } = await container.items
        .query('SELECT VALUE COUNT(1) FROM c')
        .fetchAll();
      return resources[0] || 0;
    },
  },

  // Login attempt operations
  loginAttempt: {
    async create(data: Omit<LoginAttempt, 'id' | 'createdAt'>) {
      const container = getCosmosDatabase().container('login_attempts');
      const loginAttempt = {
        id: generateId(),
        ...data,
        createdAt: new Date().toISOString(),
      };
      const { resource } = await container.items.create(loginAttempt);
      return resource as LoginAttempt;
    },

    async findMany(where?: { email?: string }) {
      const container = getCosmosDatabase().container('login_attempts');
      
      if (where?.email) {
        const { resources } = await container.items
          .query({
            query: 'SELECT * FROM c WHERE c.email = @email',
            parameters: [{ name: '@email', value: where.email }]
          })
          .fetchAll();
        // Sort on client side to avoid index issues
        return (resources as LoginAttempt[]).sort((a, b) => 
          new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
        );
      }
      
      const { resources } = await container.items
        .query('SELECT * FROM c')
        .fetchAll();
      // Sort on client side to avoid index issues
      return (resources as LoginAttempt[]).sort((a, b) => 
        new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
      );
    },

    async count() {
      const container = getCosmosDatabase().container('login_attempts');
      const { resources } = await container.items
        .query('SELECT VALUE COUNT(1) FROM c')
        .fetchAll();
      return resources[0] || 0;
    },
  },

  // Page content operations
  pageContent: {
    async create(data: Omit<PageContent, 'id' | 'createdAt' | 'updatedAt'>) {
      const container = getCosmosDatabase().container('page_contents');
      const pageContent = {
        id: generateId(),
        ...addTimestamps(data),
      };
      const { resource } = await container.items.create(pageContent);
      return resource as PageContent;
    },

    async findMany(where?: { pageType?: string; isActive?: boolean }) {
      const container = getCosmosDatabase().container('page_contents');
      let query = 'SELECT * FROM c';
      const parameters: any[] = [];
      
      if (where?.pageType !== undefined || where?.isActive !== undefined) {
        const conditions: string[] = [];
        if (where.pageType !== undefined) {
          conditions.push('c.pageType = @pageType');
          parameters.push({ name: '@pageType', value: where.pageType });
        }
        if (where.isActive !== undefined) {
          conditions.push('c.isActive = @isActive');
          parameters.push({ name: '@isActive', value: where.isActive });
        }
        query += ' WHERE ' + conditions.join(' AND ');
      }
      
      // Remove ORDER BY to avoid index issues - sort on client side
      
      const { resources } = await container.items
        .query({ query, parameters })
        .fetchAll();
      // Sort on client side to avoid index issues
      return (resources as PageContent[]).sort((a, b) => {
        // Sort by order first, then by createdAt
        const orderA = a.order || 0;
        const orderB = b.order || 0;
        if (orderA !== orderB) return orderA - orderB;
        return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
      });
    },

    async count() {
      const container = getCosmosDatabase().container('page_contents');
      const { resources } = await container.items
        .query('SELECT VALUE COUNT(1) FROM c')
        .fetchAll();
      return resources[0] || 0;
    },
  },

  // Site settings operations
  siteSettings: {
    async create(data: Omit<SiteSettings, 'id' | 'createdAt' | 'updatedAt'>) {
      const container = getCosmosDatabase().container('site_settings');
      const settings = {
        id: generateId(),
        ...addTimestamps(data),
      };
      const { resource } = await container.items.create(settings);
      return resource as SiteSettings;
    },

    async findUnique(where: { key: string }) {
      const container = getCosmosDatabase().container('site_settings');
      const { resources } = await container.items
        .query({
          query: 'SELECT * FROM c WHERE c.key = @key',
          parameters: [{ name: '@key', value: where.key }]
        })
        .fetchAll();
      return resources[0] as SiteSettings | null;
    },

    async findMany() {
      const container = getCosmosDatabase().container('site_settings');
      const { resources } = await container.items
        .query('SELECT * FROM c')
        .fetchAll();
      // Sort on client side to avoid index issues
      return (resources as SiteSettings[]).sort((a, b) => 
        (a.key || '').localeCompare(b.key || '')
      );
    },

    async count() {
      const container = getCosmosDatabase().container('site_settings');
      const { resources } = await container.items
        .query('SELECT VALUE COUNT(1) FROM c')
        .fetchAll();
      return resources[0] || 0;
    },
  },

  // Utility function to disconnect (no-op for Cosmos DB)
  async $disconnect() {
    // Cosmos DB SDK handles connection pooling automatically
    return;
  },
};

// Export the db client as default (replaces Prisma)
export default db;