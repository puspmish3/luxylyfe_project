'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { fetchPageContent, getContentBySection, PageContent } from '@/lib/content'

interface Property {
  id: string
  propertyId: string
  title: string
  address: string
  city: string
  state: string
  zipCode: string
  propertyType: string
  bedrooms: number | null
  bathrooms: number | null
  sqft: number | null
  price: number
  description: string | null
  amenities: string[]
  images: string[]
  email: string | null
  phone: string | null
  isFeature: boolean
  isAvailable: boolean
}

interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalProperties: number
  limit: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export default function Projects() {
  const [properties, setProperties] = useState<Property[]>([])
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [pageContent, setPageContent] = useState<PageContent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [filters, setFilters] = useState({
    featured: false,
    propertyType: '',
    minPrice: '',
    maxPrice: ''
  })

  const fetchProperties = async (page: number = 1) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '6'
      })

      if (filters.featured) params.append('featured', 'true')
      if (filters.propertyType) params.append('type', filters.propertyType)
      if (filters.minPrice) params.append('minPrice', filters.minPrice)
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice)

      const response = await fetch(`/api/properties?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch properties')
      }

      setProperties(data.properties)
      setPagination(data.pagination)
      setCurrentPage(page)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const loadPageContent = async () => {
    try {
      const response = await fetchPageContent('PROJECTS')
      if (response.content) {
        setPageContent(response.content)
      }
    } catch (error) {
      console.error('Error loading page content:', error)
    }
  }

  useEffect(() => {
    loadPageContent()
  }, [])

  useEffect(() => {
    fetchProperties(1)
  }, [filters])

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(price)
  }

  const formatPropertyType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  if (loading && properties.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading luxury properties...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-purple-900 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4">
              {getContentBySection(pageContent, 'HERO')?.title || 'Luxury Property Portfolio'}
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              {getContentBySection(pageContent, 'HERO')?.content || 'Discover our exquisite collection of luxury homes and estates, each crafted with meticulous attention to detail and premium materials.'}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Filter Properties</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.featured}
                  onChange={(e) => handleFilterChange('featured', e.target.checked)}
                  className="mr-2"
                />
                Featured Properties Only
              </label>
            </div>
            <div>
              <select
                value={filters.propertyType}
                onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">All Property Types</option>
                <option value="MANSION">Mansion</option>
                <option value="PENTHOUSE">Penthouse</option>
                <option value="ESTATE">Estate</option>
                <option value="WATERFRONT">Waterfront</option>
                <option value="MOUNTAIN_RETREAT">Mountain Retreat</option>
                <option value="HISTORIC_HOME">Historic Home</option>
              </select>
            </div>
            <div>
              <input
                type="number"
                placeholder="Min Price"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <input
                type="number"
                placeholder="Max Price"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>

        {/* Results Summary */}
        {pagination && (
          <div className="mb-6">
            <p className="text-gray-600">
              Showing {((pagination.currentPage - 1) * pagination.limit) + 1} - {Math.min(pagination.currentPage * pagination.limit, pagination.totalProperties)} of {pagination.totalProperties} properties
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {properties.map((property) => (
            <div key={property.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              {property.isFeature && (
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-center py-2 text-sm font-semibold">
                  ⭐ FEATURED PROPERTY
                </div>
              )}
              
              {/* Property Image */}
              <div className="h-64 relative overflow-hidden">
                {property.images && property.images.length > 0 ? (
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      // Fallback to gradient if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.className = "h-64 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center";
                        parent.innerHTML = `
                          <div class="text-white text-center">
                            <div class="text-4xl mb-2">🏠</div>
                            <p class="text-sm">${property.propertyId}</p>
                          </div>
                        `;
                      }
                    }}
                  />
                ) : (
                  // Fallback gradient for properties without images
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="text-4xl mb-2">🏠</div>
                      <p className="text-sm">{property.propertyId}</p>
                    </div>
                  </div>
                )}
                
                {/* Image count indicator */}
                {property.images && property.images.length > 1 && (
                  <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full">
                    📷 {property.images.length}
                  </div>
                )}
                
                {/* Availability status */}
                <div className={`absolute top-2 left-2 text-xs px-2 py-1 rounded-full ${
                  property.isAvailable 
                    ? 'bg-green-500 text-white' 
                    : 'bg-red-500 text-white'
                }`}>
                  {property.isAvailable ? 'Available' : 'Sold'}
                </div>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-gray-800 leading-tight">{property.title}</h3>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {formatPropertyType(property.propertyType)}
                  </span>
                </div>

                <p className="text-gray-600 mb-3">
                  📍 {property.address}, {property.city}, {property.state} {property.zipCode}
                </p>

                <div className="flex justify-between text-sm text-gray-500 mb-3">
                  <span>🛏️ {property.bedrooms || 'N/A'} BR</span>
                  <span>🛁 {property.bathrooms || 'N/A'} BA</span>
                  <span>📐 {property.sqft?.toLocaleString() || 'N/A'} sqft</span>
                </div>

                <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                  {property.description || 'Luxury property with premium amenities and finishes.'}
                </p>

                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-1">Key Amenities:</p>
                  <div className="flex flex-wrap gap-1">
                    {property.amenities.slice(0, 3).map((amenity, index) => (
                      <span key={index} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                        {amenity}
                      </span>
                    ))}
                    {property.amenities.length > 3 && (
                      <span className="text-gray-500 text-xs">+{property.amenities.length - 3} more</span>
                    )}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-2xl font-bold text-green-600">{formatPrice(property.price)}</p>
                    <div className="text-right text-sm">
                      {property.email && <p className="text-gray-600">📧 {property.email}</p>}
                      {property.phone && <p className="text-gray-600">📞 {property.phone}</p>}
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setSelectedProperty(property)}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
                  >
                    View Details & Gallery
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {properties.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏠</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No properties found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your filters to see more results.</p>
            <button
              onClick={() => setFilters({ featured: false, propertyType: '', minPrice: '', maxPrice: '' })}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center items-center space-x-4">
            <button
              onClick={() => fetchProperties(currentPage - 1)}
              disabled={!pagination.hasPrevPage || loading}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              ← Previous
            </button>

            <div className="flex space-x-2">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => fetchProperties(page)}
                  className={`px-3 py-2 rounded-lg ${
                    page === currentPage
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => fetchProperties(currentPage + 1)}
              disabled={!pagination.hasNextPage || loading}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next →
            </button>
          </div>
        )}

        {/* Back to Home */}
        <div className="text-center mt-12">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-500 font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>

      {/* Property Details Modal */}
      {selectedProperty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold">{selectedProperty.title}</h2>
              <button
                onClick={() => setSelectedProperty(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="p-6">
              {/* Image Gallery */}
              {selectedProperty.images && selectedProperty.images.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Property Gallery</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedProperty.images.map((image, index) => (
                      <div key={index} className="aspect-video rounded-lg overflow-hidden">
                        <img
                          src={image}
                          alt={`${selectedProperty.title} - Image ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Property Details */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Property Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Property ID:</strong> {selectedProperty.propertyId}</p>
                    <p><strong>Type:</strong> {formatPropertyType(selectedProperty.propertyType)}</p>
                    <p><strong>Address:</strong> {selectedProperty.address}, {selectedProperty.city}, {selectedProperty.state} {selectedProperty.zipCode}</p>
                    <p><strong>Bedrooms:</strong> {selectedProperty.bedrooms || 'N/A'}</p>
                    <p><strong>Bathrooms:</strong> {selectedProperty.bathrooms || 'N/A'}</p>
                    <p><strong>Square Feet:</strong> {selectedProperty.sqft?.toLocaleString() || 'N/A'}</p>
                    <p><strong>Price:</strong> <span className="text-green-600 font-semibold">{formatPrice(selectedProperty.price)}</span></p>
                    <p><strong>Status:</strong> <span className={selectedProperty.isAvailable ? 'text-green-600' : 'text-red-600'}>{selectedProperty.isAvailable ? 'Available' : 'Sold'}</span></p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
                  <div className="space-y-2 text-sm mb-4">
                    {selectedProperty.email && <p><strong>Email:</strong> {selectedProperty.email}</p>}
                    {selectedProperty.phone && <p><strong>Phone:</strong> {selectedProperty.phone}</p>}
                  </div>

                  <h3 className="text-lg font-semibold mb-3">Description</h3>
                  <p className="text-sm text-gray-700 mb-4">
                    {selectedProperty.description || 'Luxury property with premium amenities and finishes.'}
                  </p>

                  <h3 className="text-lg font-semibold mb-3">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProperty.amenities.map((amenity, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-4">
                <button
                  onClick={() => setSelectedProperty(null)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700">
                  Schedule Viewing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
