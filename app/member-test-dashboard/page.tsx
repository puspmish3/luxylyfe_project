// Temporary minimal member dashboard for testing authentication
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  role: string
  name?: string
}

export default function MinimalMemberDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [authError, setAuthError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Checking authentication...')
        const response = await fetch('/api/auth/me')
        console.log('Auth response status:', response.status)
        
        if (response.ok) {
          const data = await response.json()
          console.log('Auth data:', data)
          
          if (data.user.role !== 'MEMBER') {
            console.log('User is not a member, redirecting to home')
            router.push('/')
            return
          }
          setUser(data.user)
          console.log('User authenticated successfully')
        } else {
          const errorText = await response.text()
          console.log('Auth failed:', errorText)
          setAuthError(`Authentication failed: ${response.status} - ${errorText}`)
          setTimeout(() => {
            router.push('/member-login')
          }, 3000)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        setAuthError(`Network error: ${error.message}`)
        setTimeout(() => {
          router.push('/member-login')
        }, 3000)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  if (authError) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Authentication Error</h2>
          <p className="text-red-600 mb-4">{authError}</p>
          <p className="text-sm text-gray-600">Redirecting to login page...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Member Portal - Test Mode</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.name || user?.email}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-green-600 mb-4">🎉 Authentication Successful!</h2>
          <div className="space-y-2">
            <p><strong>User ID:</strong> {user?.id}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Name:</strong> {user?.name || 'Not set'}</p>
            <p><strong>Role:</strong> {user?.role}</p>
          </div>
          
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-green-800">Test Status</h3>
            <p className="text-green-700">
              ✅ Login successful<br/>
              ✅ Session verification working<br/>
              ✅ Member dashboard loaded<br/>
              ✅ Cosmos DB authentication flow functional
            </p>
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            <p>This is a minimal dashboard to test authentication without content loading issues.</p>
          </div>
        </div>
      </main>
    </div>
  )
}