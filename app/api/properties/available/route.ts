import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get all available properties with basic info for signup reference
    const properties = await prisma.property.findMany({
      where: {
        isAvailable: true
      },
      select: {
        propertyId: true,
        title: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        price: true,
        propertyType: true,
        email: true,
        phone: true
      },
      orderBy: {
        propertyId: 'asc'
      }
    })

    return NextResponse.json({
      properties,
      message: 'Available properties retrieved successfully'
    })

  } catch (error) {
    console.error('Error fetching available properties:', error)
    return NextResponse.json(
      { error: 'Failed to fetch available properties' },
      { status: 500 }
    )
  }
}
