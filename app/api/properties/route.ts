import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '6')
    const featured = searchParams.get('featured') === 'true'
    const propertyType = searchParams.get('type')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')

    // Calculate offset for pagination
    const offset = (page - 1) * limit

    // Build where clause for Cosmos DB
    const where: any = {}
    
    if (featured) {
      where.isFeature = true
    }

    // Get all properties first (Cosmos DB doesn't have built-in pagination like SQL)
    let allProperties = await db.property.findMany(where)

    // Apply client-side filtering for price and type
    if (propertyType) {
      allProperties = allProperties.filter(p => p.propertyType === propertyType)
    }

    if (minPrice) {
      allProperties = allProperties.filter(p => p.price >= parseFloat(minPrice))
    }

    if (maxPrice) {
      allProperties = allProperties.filter(p => p.price <= parseFloat(maxPrice))
    }

    // Sort properties (featured first, then by newest)
    allProperties.sort((a, b) => {
      if (a.isFeature && !b.isFeature) return -1
      if (!a.isFeature && b.isFeature) return 1
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    // Apply pagination
    const totalProperties = allProperties.length
    const properties = allProperties.slice(offset, offset + limit)

    // Calculate pagination info
    const totalPages = Math.ceil(totalProperties / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    // Remove sensitive information
    const cleanProperties = properties.map(property => {
      const { password, ...cleanProperty } = property as any
      return cleanProperty
    })

    return NextResponse.json({
      properties: cleanProperties,
      pagination: {
        currentPage: page,
        totalPages,
        totalProperties,
        limit,
        hasNextPage,
        hasPrevPage
      }
    })

  } catch (error) {
    console.error('Properties API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    )
  }
}
