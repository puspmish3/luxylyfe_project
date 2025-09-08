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

// GET - Get page content
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pageType = searchParams.get('pageType')
    const sectionType = searchParams.get('sectionType')

    let whereClause: any = { isActive: true }
    
    if (pageType) {
      whereClause.pageType = pageType
    }
    
    if (sectionType) {
      whereClause.sectionType = sectionType
    }

    const content = await prisma.pageContent.findMany({
      where: whereClause,
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json({
      content,
      message: 'Page content retrieved successfully'
    })

  } catch (error) {
    console.error('Error fetching page content:', error)
    return NextResponse.json(
      { error: 'Failed to fetch page content' },
      { status: 500 }
    )
  }
}

// POST - Create new page content (Admin only)
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
      pageType, 
      sectionType, 
      title, 
      subtitle, 
      content, 
      images, 
      order 
    } = await request.json()

    // Validate required fields
    if (!pageType || !sectionType) {
      return NextResponse.json(
        { error: 'Page type and section type are required' },
        { status: 400 }
      )
    }

    // Create new content
    const newContent = await prisma.pageContent.create({
      data: {
        pageType,
        sectionType,
        title: title || null,
        subtitle: subtitle || null,
        content: content || null,
        images: images || [],
        order: order || 0,
        createdBy: admin.id,
        updatedBy: admin.id
      }
    })

    return NextResponse.json({
      message: 'Page content created successfully',
      content: newContent
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating page content:', error)
    return NextResponse.json(
      { error: 'Failed to create page content' },
      { status: 500 }
    )
  }
}

// PUT - Update page content (Admin only)
export async function PUT(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request)
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      )
    }

    const { 
      id,
      pageType, 
      sectionType, 
      title, 
      subtitle, 
      content, 
      images, 
      order,
      isActive
    } = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'Content ID is required' },
        { status: 400 }
      )
    }

    // Update content
    const updatedContent = await prisma.pageContent.update({
      where: { id },
      data: {
        pageType: pageType || undefined,
        sectionType: sectionType || undefined,
        title: title !== undefined ? title : undefined,
        subtitle: subtitle !== undefined ? subtitle : undefined,
        content: content !== undefined ? content : undefined,
        images: images !== undefined ? images : undefined,
        order: order !== undefined ? order : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
        updatedBy: admin.id
      }
    })

    return NextResponse.json({
      message: 'Page content updated successfully',
      content: updatedContent
    })

  } catch (error) {
    console.error('Error updating page content:', error)
    return NextResponse.json(
      { error: 'Failed to update page content' },
      { status: 500 }
    )
  }
}
