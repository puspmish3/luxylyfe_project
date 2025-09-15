import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { verifyPassword, generateToken } from '@/lib/auth'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    console.log('=== LOGIN API CALLED ===')
    const { email, password } = await request.json()
    console.log('Login attempt for:', email)

    // Validate input
    if (!email || !password) {
      console.log('Missing required fields')
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Log login attempt for tracking
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown'

    try {
      await db.loginAttempt.create({
        email,
        ipAddress: clientIP,
        success: false,
      })
      console.log('Login attempt logged')
    } catch (error) {
      console.error('Failed to log login attempt:', error)
    }

    // Find user by email only (Cosmos DB implementation)
    console.log('Looking up user by email:', email)
    const user = await db.user.findUnique({ email })
    
    if (!user) {
      console.log('User not found for email:', email)
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    console.log('User found:', user.email, 'Role in DB:', user.role)

    // Verify password
    console.log('Verifying password...')
    const isValidPassword = await verifyPassword(password, user.password)
    console.log('Password valid:', isValidPassword)
    
    if (!isValidPassword) {
      console.log('Invalid password for user:', email)
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Generate JWT token
    console.log('=== Generating JWT token ===')
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    })
    console.log('Token generated successfully, length:', token.length)

    // Create session with proper expiry
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24) // 24 hour expiry
    
    console.log('=== Creating session ===')
    console.log('Current time:', new Date().toISOString())
    console.log('Session expires at:', expiresAt.toISOString())
    console.log('User ID for session:', user.id)

    const session = await db.session.create({
      userId: user.id,
      token,
      expiresAt: expiresAt.toISOString()
    })

    console.log('Session created successfully with ID:', session.id)

    // Prepare response
    const response = NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      },
      sessionId: session.id,
      expiresAt: expiresAt.toISOString()
    })

    // Set secure HTTP-only cookie
    console.log('=== Setting secure cookie ===')
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours in seconds
      path: '/'
    })

    console.log('=== Login completed successfully ===')
    return response

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
