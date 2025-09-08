import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password, role } = await request.json()

    // Validate input
    if (!email || !password || !role) {
      return NextResponse.json(
        { error: 'Email, password, and role are required' },
        { status: 400 }
      )
    }

    // Validate role
    if (role !== 'ADMIN' && role !== 'MEMBER' && role !== 'SUPERADMIN') {
      return NextResponse.json(
        { error: 'Invalid role specified' },
        { status: 400 }
      )
    }

    // Log login attempt
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown'

    try {
      await prisma.loginAttempt.create({
        data: {
          email,
          ipAddress: clientIP,
          success: false, // Will update if successful
        }
      })
    } catch (error) {
      console.error('Failed to log login attempt:', error)
    }

    // Find user by email and role
    const user = await prisma.user.findFirst({
      where: {
        email,
        role
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password)
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    })

    // Create session
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24) // 24 hour expiry

    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt
      }
    })

    // Update login attempt as successful
    try {
      await prisma.loginAttempt.updateMany({
        where: {
          email,
          ipAddress: clientIP,
          success: false
        },
        data: {
          success: true
        }
      })
    } catch (error) {
      console.error('Failed to update login attempt:', error)
    }

    // Return success response with token
    const response = NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      }
    })

    // Set HTTP-only cookie with the token
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 // 24 hours
    })

    return response

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
