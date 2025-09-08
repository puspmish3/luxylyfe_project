import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

    // Build where clause
    const where: any = {}
    
    if (featured) {
      where.isFeature = true
    }
    
    if (propertyType) {
      where.propertyType = propertyType
    }
    
    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = parseFloat(minPrice)
      if (maxPrice) where.price.lte = parseFloat(maxPrice)
    }

    // Get total count for pagination
    const totalProperties = await prisma.property.count({ where })

    // Get properties with pagination
    const properties = await prisma.property.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: [
        { isFeature: 'desc' }, // Featured properties first
        { createdAt: 'desc' }  // Then by newest
      ],
      select: {
        id: true,
        propertyId: true,
        title: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        propertyType: true,
        bedrooms: true,
        bathrooms: true,
        sqft: true,
        price: true,
        description: true,
        amenities: true,
        images: true,
        email: true,
        phone: true,
        isFeature: true,
        isAvailable: true
      }
    })

    // Calculate pagination info
    const totalPages = Math.ceil(totalProperties / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return NextResponse.json({
      properties,
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
