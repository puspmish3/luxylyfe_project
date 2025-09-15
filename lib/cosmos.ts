// Azure Cosmos DB SQL API Client Configuration
// This provides a hybrid approach: Prisma for MongoDB Atlas + Cosmos SDK for Azure

import { CosmosClient } from '@azure/cosmos';

// Cosmos DB configuration
const cosmosConfig = {
  endpoint: process.env.COSMOS_DB_ENDPOINT!,
  key: process.env.COSMOS_DB_KEY!,
  databaseId: process.env.COSMOS_DB_DATABASE_NAME || 'luxylyfe_db',
};

// Create Cosmos DB client
let cosmosClientInstance: CosmosClient | null = null;

export function getCosmosClient(): CosmosClient {
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
export function getCosmosDatabase() {
  const client = getCosmosClient();
  return client.database(cosmosConfig.databaseId);
}

// Container references (equivalent to MongoDB collections)
export const cosmosContainers = {
  users: () => getCosmosDatabase().container('users'),
  properties: () => getCosmosDatabase().container('properties'),
  pageContents: () => getCosmosDatabase().container('page_contents'),
  siteSettings: () => getCosmosDatabase().container('site_settings'),
  sessions: () => getCosmosDatabase().container('sessions'),
  loginAttempts: () => getCosmosDatabase().container('login_attempts'),
};

// Utility functions for common operations
export const cosmosUtils = {
  // Create a document
  async createDocument(containerName: keyof typeof cosmosContainers, document: any) {
    const container = cosmosContainers[containerName]();
    const { resource } = await container.items.create(document);
    return resource;
  },

  // Read a document by ID
  async readDocument(containerName: keyof typeof cosmosContainers, id: string, partitionKey?: string) {
    const container = cosmosContainers[containerName]();
    const { resource } = await container.item(id, partitionKey).read();
    return resource;
  },

  // Update a document
  async updateDocument(containerName: keyof typeof cosmosContainers, id: string, document: any, partitionKey?: string) {
    const container = cosmosContainers[containerName]();
    const { resource } = await container.item(id, partitionKey).replace(document);
    return resource;
  },

  // Delete a document
  async deleteDocument(containerName: keyof typeof cosmosContainers, id: string, partitionKey?: string) {
    const container = cosmosContainers[containerName]();
    const { resource } = await container.item(id, partitionKey).delete();
    return resource;
  },

  // Query documents
  async queryDocuments(containerName: keyof typeof cosmosContainers, query: string, parameters?: any[]) {
    const container = cosmosContainers[containerName]();
    const { resources } = await container.items.query({ query, parameters }).fetchAll();
    return resources;
  },

  // Count documents
  async countDocuments(containerName: keyof typeof cosmosContainers) {
    const container = cosmosContainers[containerName]();
    const { resources } = await container.items.query('SELECT VALUE COUNT(1) FROM c').fetchAll();
    return resources[0] || 0;
  },
};

// Example usage functions for your specific models
export const cosmosModels = {
  // User operations
  users: {
    async create(userData: any) {
      // Add ID and ensure proper structure
      const user = {
        id: userData.id || generateId(),
        ...userData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return cosmosUtils.createDocument('users', user);
    },

    async findByEmail(email: string) {
      const results = await cosmosUtils.queryDocuments(
        'users',
        'SELECT * FROM c WHERE c.email = @email',
        [{ name: '@email', value: email }]
      );
      return results[0] || null;
    },

    async findById(id: string) {
      return cosmosUtils.readDocument('users', id);
    },

    async count() {
      return cosmosUtils.countDocuments('users');
    },
  },

  // Property operations
  properties: {
    async create(propertyData: any) {
      const property = {
        id: propertyData.id || generateId(),
        ...propertyData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return cosmosUtils.createDocument('properties', property);
    },

    async findAvailable() {
      return cosmosUtils.queryDocuments(
        'properties',
        'SELECT * FROM c WHERE c.isAvailable = true ORDER BY c.createdAt DESC'
      );
    },

    async findById(id: string) {
      return cosmosUtils.readDocument('properties', id);
    },

    async count() {
      return cosmosUtils.countDocuments('properties');
    },
  },

  // Page content operations
  pageContents: {
    async findByPageType(pageType: string) {
      return cosmosUtils.queryDocuments(
        'pageContents',
        'SELECT * FROM c WHERE c.pageType = @pageType AND c.isActive = true ORDER BY c.order',
        [{ name: '@pageType', value: pageType }]
      );
    },

    async count() {
      return cosmosUtils.countDocuments('pageContents');
    },
  },

  // Site settings operations
  siteSettings: {
    async findByKey(key: string) {
      const results = await cosmosUtils.queryDocuments(
        'siteSettings',
        'SELECT * FROM c WHERE c.key = @key',
        [{ name: '@key', value: key }]
      );
      return results[0] || null;
    },

    async count() {
      return cosmosUtils.countDocuments('siteSettings');
    },
  },
};

// Helper function to generate IDs (Cosmos DB requires string IDs)
function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

const cosmosClient = {
  getCosmosClient,
  getCosmosDatabase,
  cosmosContainers,
  cosmosUtils,
  cosmosModels,
};

export default cosmosClient;