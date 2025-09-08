import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

// Verify admin authentication
async function verifyAdmin(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return null
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, name: true }
    })

    if (user?.role !== 'ADMIN' && user?.role !== 'SUPERADMIN') {
      return null
    }

    return user
  } catch (error) {
    return null
  }
}

// GET - Get site settings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')
    const publicOnly = searchParams.get('public') === 'true'

    let whereClause: any = {}
    
    if (key) {
      whereClause.key = key
    }
    
    if (publicOnly) {
      whereClause.isPublic = true
    }

    const settings = await prisma.siteSettings.findMany({
      where: whereClause,
      select: {
        id: true,
        key: true,
        value: true,
        description: true,
        dataType: true,
        isPublic: true,
        updatedAt: true
      },
      orderBy: { key: 'asc' }
    })

    return NextResponse.json({
      settings,
      message: 'Site settings retrieved successfully'
    })

  } catch (error) {
    console.error('Error fetching site settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch site settings' },
      { status: 500 }
    )
  }
}

// POST - Create or update site setting (Admin only)
export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request)
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      )
    }

    const { 
      key, 
      value, 
      description, 
      dataType, 
      isPublic 
    } = await request.json()

    // Validate required fields
    if (!key || value === undefined) {
      return NextResponse.json(
        { error: 'Key and value are required' },
        { status: 400 }
      )
    }

    // Upsert setting (create or update)
    const setting = await prisma.siteSettings.upsert({
      where: { key },
      update: {
        value,
        description: description || null,
        dataType: dataType || 'string',
        isPublic: isPublic || false,
        updatedBy: admin.id
      },
      create: {
        key,
        value,
        description: description || null,
        dataType: dataType || 'string',
        isPublic: isPublic || false,
        updatedBy: admin.id
      }
    })

    return NextResponse.json({
      message: 'Site setting saved successfully',
      setting
    })

  } catch (error) {
    console.error('Error saving site setting:', error)
    return NextResponse.json(
      { error: 'Failed to save site setting' },
      { status: 500 }
    )
  }
}
