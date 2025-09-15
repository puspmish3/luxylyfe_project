import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { cosmosModels } from '../../../lib/cosmos';

// GET /api/database-status
// Returns status of both MongoDB Atlas and Cosmos DB SQL API
export async function GET(request: NextRequest) {
  try {
    const status = {
      timestamp: new Date().toISOString(),
      databases: {
        atlas: {
          status: 'disconnected',
          provider: 'MongoDB Atlas (Prisma ORM)',
          userCount: 0,
          propertyCount: 0,
          error: null
        },
        cosmos: {
          status: 'disconnected',
          provider: 'Azure Cosmos DB SQL API',
          userCount: 0,
          propertyCount: 0,
          error: null
        }
      }
    };

    // Test MongoDB Atlas connection
    try {
      const atlasUserCount = await prisma.user.count();
      const atlasPropertyCount = await prisma.property.count();
      
      status.databases.atlas = {
        ...status.databases.atlas,
        status: 'connected',
        userCount: atlasUserCount,
        propertyCount: atlasPropertyCount
      };
    } catch (atlasError: any) {
      status.databases.atlas.error = atlasError.message;
    }

    // Test Cosmos DB SQL API connection
    try {
      const cosmosUserCount = await cosmosModels.users.count();
      const cosmosPropertyCount = await cosmosModels.properties.count();
      
      status.databases.cosmos = {
        ...status.databases.cosmos,
        status: 'connected',
        userCount: cosmosUserCount,
        propertyCount: cosmosPropertyCount
      };
    } catch (cosmosError: any) {
      status.databases.cosmos.error = cosmosError.message;
    }

    // Determine overall status
    const hasConnectedDB = 
      status.databases.atlas.status === 'connected' || 
      status.databases.cosmos.status === 'connected';

    return NextResponse.json({
      ...status,
      overall: hasConnectedDB ? 'operational' : 'error',
      message: hasConnectedDB 
        ? 'At least one database is operational'
        : 'No database connections available'
    });

  } catch (error: any) {
    return NextResponse.json(
      { 
        error: 'Failed to check database status',
        details: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}