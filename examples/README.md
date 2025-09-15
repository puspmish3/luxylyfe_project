# Database Examples

This folder contains practical examples of how to use the hybrid database approach in your LuxyLyfe application.

## Files

### `hybrid-database-usage.ts`

- **Purpose**: Demonstrates how to use both MongoDB Atlas (via Prisma) and Azure Cosmos DB SQL API together
- **Key Features**:
  - Database comparison utilities
  - User creation in both databases
  - Migration helper functions
  - Real-world usage patterns

### API Routes

#### `/api/database-status`

- **Purpose**: Health check endpoint for both databases
- **Returns**: Status, connection state, and record counts for both databases
- **Usage**: Visit `http://localhost:3000/api/database-status` to check database connectivity

## Quick Start

1. **Configure your databases** (see `COSMOS_DB_SETUP.md`)
2. **Test connectivity**: `npm run db:test-cosmos-sql`
3. **Check API status**: Visit `/api/database-status` in your browser
4. **Use hybrid approach** in your application code

## Usage Patterns

### Primary Database (MongoDB Atlas via Prisma)

```typescript
import { prisma } from "../lib/prisma";

// Continue using existing Prisma patterns
const users = await prisma.user.findMany();
```

### Secondary Database (Cosmos DB SQL API)

```typescript
import { cosmosModels } from "../lib/cosmos";

// Use new Cosmos DB patterns for specific features
const analytics = await cosmosModels.users.getAnalytics();
```

### Hybrid Operations

```typescript
// Get data from both databases for comparison
const atlasCount = await prisma.user.count();
const cosmosCount = await cosmosModels.users.count();
```

## Migration Strategy

Choose your approach:

- **Gradual**: Keep both databases, migrate features one by one
- **Complete**: Full migration to Cosmos DB SQL API
- **Alternative**: Switch to Cosmos DB for MongoDB API

See `COSMOS_DB_SETUP.md` for detailed guidance.
