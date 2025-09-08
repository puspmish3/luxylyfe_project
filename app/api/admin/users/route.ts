import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import jwt from 'jsonwebtoken'

// Verify superadmin authentication
async function verifySuperAdmin(request: NextRequest) {
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

    if (user?.role !== 'SUPERADMIN') {
      return null
    }

    return user
  } catch (error) {
    return null
  }
}

// GET - Get all users (Superadmin only)
export async function GET(request: NextRequest) {
  try {
    const admin = await verifySuperAdmin(request)
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized. Superadmin access required.' },
        { status: 403 }
      )
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        phone: true,
        propertyAddress: true,
        propertyNumber: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      users,
      message: 'Users retrieved successfully'
    })

  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

// POST - Create new user (Superadmin only)
export async function POST(request: NextRequest) {
  try {
    const admin = await verifySuperAdmin(request)
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized. Superadmin access required.' },
        { status: 403 }
      )
    }

    const { name, email, phone, password, role, propertyAddress, propertyNumber } = await request.json()

    // Validate required fields
    if (!email || !password || !role || !name) {
      return NextResponse.json(
        { error: 'Name, email, password, and role are required' },
        { status: 400 }
      )
    }

    // Validate role
    const validRoles = ['SUPERADMIN', 'ADMIN', 'MEMBER']
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role specified' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        password: hashedPassword,
        role,
        propertyAddress: propertyAddress || null,
        propertyNumber: propertyNumber || null
      },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        phone: true,
        propertyAddress: true,
        propertyNumber: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      message: 'User created successfully',
      user: newUser
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}
