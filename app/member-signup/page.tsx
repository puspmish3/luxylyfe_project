'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Property {
  propertyId: string
  title: string
  address: string
  city: string
  state: string
  zipCode: string
  price: number
  propertyType: string
  email?: string
  phone?: string
}

export default function MemberSignup() {
  const [availableProperties, setAvailableProperties] = useState<Property[]>([])
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    propertyId: '',
    propertyAddress: '',
    propertyNumber: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  // Fetch available properties on component mount
  useEffect(() => {
    fetchAvailableProperties()
  }, [])

  const fetchAvailableProperties = async () => {
    try {
      const response = await fetch('/api/properties/available')
      const data = await response.json()
      if (response.ok) {
        setAvailableProperties(data.properties)
      }
    } catch (error) {
      console.error('Error fetching properties:', error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    setFormData({
      ...formData,
      [name]: value
    })
    
    // If property ID is selected, auto-fill related information
    if (name === 'propertyId') {
      const property = availableProperties.find(p => p.propertyId === value)
      setSelectedProperty(property || null)
      
      if (property) {
        setFormData(prev => ({
          ...prev,
          propertyId: value,
          propertyAddress: `${property.address}, ${property.city}, ${property.state} ${property.zipCode}`,
          email: property.email || prev.email,
          phone: property.phone || prev.phone
        }))
      }
    }
    
    // Clear error when user starts typing
    if (error) setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    // Validate password strength
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          propertyId: formData.propertyId,
          propertyAddress: formData.propertyAddress,
          propertyNumber: formData.propertyNumber,
          role: 'MEMBER'
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      // Registration successful
      setSuccess('Registration successful! You can now log in with your credentials.')
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        propertyId: '',
        propertyAddress: '',
        propertyNumber: ''
      })

      // Redirect to login page after 2 seconds
      setTimeout(() => {
        router.push('/member-login')
      }, 2000)
      
    } catch (error) {
      console.error('Registration error:', error)
      setError(error instanceof Error ? error.message : 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-800 to-teal-900 flex flex-col">
      {/* Back to Home Link */}
      <div className="p-6">
        <Link
          href="/"
          className="inline-flex items-center text-white hover:text-green-200 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>
      </div>

      {/* Registration Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
              Member Registration
            </h1>
            <p className="text-gray-600">Join LuxyLyfe and discover luxury living</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                {success}
              </div>
            )}
            
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Personal Information</h3>
              
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors disabled:bg-gray-100"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors disabled:bg-gray-100"
                  placeholder="your.email@example.com"
                />
                {selectedProperty?.email && (
                  <p className="text-sm text-amber-600 mt-1">
                    ⚠️ This email must match the property contact email: {selectedProperty.email}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors disabled:bg-gray-100"
                  placeholder="+1 (555) 123-4567"
                />
                {selectedProperty?.phone && (
                  <p className="text-sm text-amber-600 mt-1">
                    ⚠️ This phone must match the property contact phone: {selectedProperty.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Property Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Property Information</h3>
              
              <div>
                <label htmlFor="propertyId" className="block text-sm font-medium text-gray-700 mb-2">
                  Property ID *
                </label>
                <select
                  id="propertyId"
                  name="propertyId"
                  value={formData.propertyId}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors disabled:bg-gray-100"
                >
                  <option value="">Select a Property ID</option>
                  {availableProperties.map((property) => (
                    <option key={property.propertyId} value={property.propertyId}>
                      {property.propertyId} - {property.title} ({property.city}, {property.state})
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  Select the Property ID you&apos;re interested in purchasing or viewing
                </p>
              </div>

              {/* Show property details when selected */}
              {selectedProperty && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Selected Property Details:</h4>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p><strong>Title:</strong> {selectedProperty.title}</p>
                    <p><strong>Address:</strong> {selectedProperty.address}, {selectedProperty.city}, {selectedProperty.state} {selectedProperty.zipCode}</p>
                    <p><strong>Type:</strong> {selectedProperty.propertyType.replace(/_/g, ' ')}</p>
                    <p><strong>Price:</strong> ${selectedProperty.price.toLocaleString()}</p>
                    {selectedProperty.email && <p><strong>Contact Email:</strong> {selectedProperty.email}</p>}
                    {selectedProperty.phone && <p><strong>Contact Phone:</strong> {selectedProperty.phone}</p>}
                  </div>
                </div>
              )}
              
              <div>
                <label htmlFor="propertyAddress" className="block text-sm font-medium text-gray-700 mb-2">
                  Property Address *
                </label>
                <textarea
                  id="propertyAddress"
                  name="propertyAddress"
                  value={formData.propertyAddress}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors disabled:bg-gray-100 resize-none"
                  placeholder="Enter complete property address including city, state, and ZIP code"
                />
              </div>

              <div>
                <label htmlFor="propertyNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Property Number/Unit *
                </label>
                <input
                  type="text"
                  id="propertyNumber"
                  name="propertyNumber"
                  value={formData.propertyNumber}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors disabled:bg-gray-100"
                  placeholder="Unit number, apartment number, or house number"
                />
              </div>
            </div>

            {/* Account Security */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Account Security</h3>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors disabled:bg-gray-100"
                  placeholder="Create a secure password (min. 6 characters)"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors disabled:bg-gray-100"
                  placeholder="Confirm your password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-lg hover:from-green-700 hover:to-emerald-700 focus:ring-4 focus:ring-green-300 focus:outline-none transition-all duration-300 transform hover:scale-105 font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating Account...
                </div>
              ) : (
                'Create Member Account'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link href="/member-login" className="text-green-600 hover:text-green-500 font-medium">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
