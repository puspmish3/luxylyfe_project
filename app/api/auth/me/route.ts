import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { verifyToken } from '@/lib/auth'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('=== /api/auth/me called ===')
    
    // Get auth token from cookie
    const token = request.cookies.get('auth-token')?.value
    console.log('Token from cookie:', token ? `Present (${token.length} chars)` : 'Missing')

    if (!token) {
      console.log('No token found in cookies')
      return NextResponse.json(
        { error: 'No authentication token found' },
        { status: 401 }
      )
    }

    // Verify JWT token first
    console.log('Verifying JWT token...')
    let decoded;
    try {
      decoded = verifyToken(token)
      console.log('JWT decoded successfully:', { userId: decoded.userId, email: decoded.email, role: decoded.role })
    } catch (jwtError) {
      console.log('JWT verification failed:', jwtError instanceof Error ? jwtError.message : String(jwtError))
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }
    
    // Look up session in Cosmos DB
    console.log('Looking up session by token...')
    const session = await db.session.findUnique({ token })
    console.log('Session found:', session ? 'Yes' : 'No')

    if (!session) {
      console.log('Session not found in database')
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      )
    }

    // Check session expiry
    const expiresAt = new Date(session.expiresAt)
    const now = new Date()
    console.log('Session expires at:', expiresAt.toISOString())
    console.log('Current time:', now.toISOString())
    console.log('Session expired?', expiresAt <= now)
    
    if (expiresAt <= now) {
      console.log('Session is expired')
      // Clean up expired session
      try {
        await db.session.delete({ id: session.id })
        console.log('Expired session deleted')
      } catch (deleteError) {
        console.log('Failed to delete expired session:', deleteError)
      }
      return NextResponse.json(
        { error: 'Session expired' },
        { status: 401 }
      )
    }

    // Get user details from Cosmos DB
    console.log('Looking up user by ID:', session.userId)
    const user = await db.user.findUnique({ email: decoded.email })
    console.log('User found by email:', user ? 'Yes' : 'No')

    if (!user) {
      console.log('User not found in database')
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      )
    }

    // Verify user ID matches session
    if (user.id !== session.userId) {
      console.log('User ID mismatch between session and user record')
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      )
    }

    // Remove password from response
    const { password, ...userResponse } = user

    console.log('Authentication successful for user:', user.email)
    return NextResponse.json({
      user: userResponse,
      isAuthenticated: true,
      sessionExpiresAt: expiresAt.toISOString()
    })

  } catch (error) {
    console.error('Session verification error:', error)
    return NextResponse.json(
      { error: 'Authentication failed', details: error instanceof Error ? error.message : String(error) },
      { status: 401 }
    )
  }
}
