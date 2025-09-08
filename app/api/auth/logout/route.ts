import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (token) {
      // Delete session from database
      try {
        await prisma.session.deleteMany({
          where: { token }
        })
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
