import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('=== DEBUG: /api/auth/debug called ===')
    
    // Check all cookies
    const allCookies = request.cookies.getAll()
    console.log('All cookies received:', allCookies)
    
    const token = request.cookies.get('auth-token')?.value
    console.log('Auth token cookie:', token ? `Present (${token.length} chars)` : 'Missing')
    
    // Check headers
    console.log('Request headers:', Object.fromEntries(request.headers.entries()))
    
    return NextResponse.json({
      message: 'Debug info',
      cookies: allCookies,
      authToken: token ? `Present (${token.length} chars)` : 'Missing',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Debug endpoint error:', error)
    return NextResponse.json(
      { error: 'Debug endpoint error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}