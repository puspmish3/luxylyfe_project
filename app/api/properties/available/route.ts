import { NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function GET() {
  try {
    // Get all available properties with basic info for signup reference
    const properties = await db.property.findMany({
      isAvailable: true
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
