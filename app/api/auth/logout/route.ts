import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (token) {
      // Delete session from database
      try {
        const session = await db.session.findUnique({ token })
        if (session) {
          await db.session.delete({ id: session.id })
        }
      } catch (error) {
        console.error('Failed to delete session:', error)
      }
    }

    // Create response
    const response = NextResponse.json({
      message: 'Logout successful'
    })

    // Clear the auth cookie
    response.cookies.delete('auth-token')

    return response

  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
