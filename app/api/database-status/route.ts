import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

// GET /api/database-status
// Returns status of Cosmos DB SQL API
export async function GET(request: NextRequest) {
  try {
    const status = {
      timestamp: new Date().toISOString(),
      database: {
        status: 'disconnected',
        provider: 'Azure Cosmos DB SQL API',
        userCount: 0,
        propertyCount: 0,
        error: null
      }
    }

    // Test Cosmos DB SQL API connection
    try {
      const userCount = await db.user.count()
      const propertyCount = await db.property.count()
      
      status.database = {
        ...status.database,
        status: 'connected',
        userCount,
        propertyCount
      }
    } catch (cosmosError: any) {
      status.database.error = cosmosError.message
    }

    return NextResponse.json({
      ...status,
      overall: status.database.status === 'connected' ? 'operational' : 'error',
      message: status.database.status === 'connected' 
        ? 'Database is operational'
        : 'No database connection available'
    })

  } catch (error: any) {
    return NextResponse.json(
      { 
        error: 'Failed to check database status',
        details: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}