'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { fetchPageContent, getContentBySection, getContentsBySection, getFirstImage, PageContent, SiteSettings } from '@/lib/content'

export default function Home() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showSchedulingModal, setShowSchedulingModal] = useState(false)
  const [pageContent, setPageContent] = useState<PageContent[]>([])
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({})
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    preferredDate: '',
    timeWindow: '',
    message: ''
  })

  // Fallback images in case database content is not available
  const fallbackImages = [
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2075&q=80',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2053&q=80'
  ]

  useEffect(() => {
    const loadContent = async () => {
      try {
        const response = await fetchPageContent('HOME', true)
        if (response.content) {
          setPageContent(response.content)
        }
        if (response.settings) {
          setSiteSettings(response.settings)
        }
      } catch (error) {
        console.error('Error loading page content:', error)
      } finally {
        setLoading(false)
      }
    }

    loadContent()
  }, [])

  // Get content sections
  const heroContent = getContentBySection(pageContent, 'HERO')
  const featuresContent = getContentsBySection(pageContent, 'FEATURES')
  const galleryContent = getContentBySection(pageContent, 'GALLERY')

  // Get hero images from database or use fallback
  const heroImages = heroContent?.images && heroContent.images.length > 0 ? heroContent.images : fallbackImages

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === heroImages.length - 1 ? 0 : prevIndex + 1
      )
    }, 4000)

    return () => clearInterval(interval)
  }, [heroImages.length])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSchedulingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Add form submission logic here
    console.log('Scheduling request:', formData)
    alert('Thank you! Your viewing request has been submitted. We will contact you soon to confirm your appointment.')
    setShowSchedulingModal(false)
    setFormData({
      name: '',
      email: '',
      phone: '',
      preferredDate: '',
      timeWindow: '',
      message: ''
    })
  }

  const closeModal = () => {
    setShowSchedulingModal(false)
  }

  return (
    <>
      {/* Hero Section with Scrolling Images */}
      <section className="relative h-screen overflow-hidden">
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              backgroundImage: `url(${image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          />
        ))}
        
        {/* Soft gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/40 via-blue-900/30 to-purple-900/40"></div>
        
        {/* Hero Content */}
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="text-center text-white px-4 max-w-4xl">
            <h1 className="text-7xl md:text-8xl font-bold mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                {heroContent?.title || 'LuxyLyfe'}
              </span>
            </h1>
            <p className="text-2xl md:text-3xl mb-8 font-light tracking-wide text-blue-50">
              {heroContent?.subtitle || 'Where Luxury Meets Lifestyle'}
            </p>
            <p className="text-lg md:text-xl mb-12 text-blue-100/90 max-w-2xl mx-auto leading-relaxed">
              {heroContent?.content || 'Discover extraordinary homes that redefine modern living. Each property is a masterpiece of design, comfort, and sophistication.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/projects">
                <button className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-2xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25">
                  Explore Properties
                </button>
              </Link>
              <button 
                onClick={() => setShowSchedulingModal(true)}
                className="px-8 py-4 border-2 border-blue-200/80 text-blue-50 font-semibold rounded-2xl hover:bg-blue-200/20 hover:border-blue-100 transition-all duration-300 backdrop-blur-sm"
              >
                Schedule Viewing
              </button>
            </div>
            
            {/* Login Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Link href="/admin-login">
                <button className="px-6 py-3 bg-gradient-to-r from-rose-400 to-pink-400 text-white font-medium rounded-xl hover:from-rose-500 hover:to-pink-500 hover:shadow-lg hover:shadow-rose-500/25 transition-all duration-300 transform hover:scale-105">
                  Admin Login
                </button>
              </Link>
              <Link href="/member-login">
                <button className="px-6 py-3 bg-gradient-to-r from-emerald-400 to-teal-400 text-white font-medium rounded-xl hover:from-emerald-500 hover:to-teal-500 hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 transform hover:scale-105">
                  Member Login
                </button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-blue-100 animate-bounce">
          <div className="w-6 h-10 border-2 border-blue-200/60 rounded-full flex justify-center backdrop-blur-sm">
            <div className="w-1 h-3 bg-blue-200 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
        
        {/* Image Indicators */}
        <div className="absolute bottom-8 right-8 flex space-x-2">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentImageIndex ? 'bg-blue-200' : 'bg-blue-200/50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-6">
              {featuresContent.length > 0 ? featuresContent[0]?.title || 'Why Choose LuxyLyfe' : 'Why Choose LuxyLyfe'}
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              {featuresContent.length > 0 ? featuresContent[0]?.content || 'We don\'t just sell homes – we curate exceptional living experiences that exceed your highest expectations.' : 'We don\'t just sell homes – we curate exceptional living experiences that exceed your highest expectations.'}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            {featuresContent.length > 0 ? (
              featuresContent.slice(0, 3).map((feature, index) => (
                <div key={feature.id} className="text-center group">
                  <div className={`w-20 h-20 ${
                    index === 0 ? 'bg-gradient-to-br from-blue-400 to-blue-500 group-hover:from-blue-500 group-hover:to-blue-600' :
                    index === 1 ? 'bg-gradient-to-br from-emerald-400 to-emerald-500 group-hover:from-emerald-500 group-hover:to-emerald-600' :
                    'bg-gradient-to-br from-purple-400 to-purple-500 group-hover:from-purple-500 group-hover:to-purple-600'
                  } rounded-2xl flex items-center justify-center mx-auto mb-6 transition-all duration-300 transform group-hover:scale-110 shadow-lg group-hover:shadow-xl`}>
                    {feature.images.length > 0 ? (
                      <Image 
                        src={feature.images[0]} 
                        alt={feature.title} 
                        width={40}
                        height={40}
                        className="object-contain" 
                      />
                    ) : (
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-4">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{feature.content}</p>
                </div>
              ))
            ) : (
              // Fallback content
              <>
                <div className="text-center group">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:from-blue-500 group-hover:to-blue-600 transition-all duration-300 transform group-hover:scale-110 shadow-lg group-hover:shadow-xl">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-4">Premium Locations</h3>
                  <p className="text-slate-600 leading-relaxed">Exclusive properties in the most desirable neighborhoods and pristine locations.</p>
                </div>
                
                <div className="text-center group">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:from-emerald-500 group-hover:to-emerald-600 transition-all duration-300 transform group-hover:scale-110 shadow-lg group-hover:shadow-xl">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-4">Luxury Amenities</h3>
                  <p className="text-slate-600 leading-relaxed">State-of-the-art facilities and world-class amenities in every property.</p>
                </div>
                
                <div className="text-center group">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:from-purple-500 group-hover:to-purple-600 transition-all duration-300 transform group-hover:scale-110 shadow-lg group-hover:shadow-xl">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-4">Personalized Service</h3>
                  <p className="text-slate-600 leading-relaxed">Dedicated support and personalized assistance throughout your journey.</p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-gradient-to-br from-slate-800 via-slate-900 to-blue-900">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="group">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2 group-hover:from-blue-300 group-hover:to-purple-300 transition-all duration-300">Luxury Properties</div>
              <p className="text-slate-300">Curated Collection</p>
            </div>
            <div className="group">
              <div className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-2 group-hover:from-emerald-300 group-hover:to-teal-300 transition-all duration-300">Customer Satisfaction</div>
              <p className="text-slate-300">Exceptional Service</p>
            </div>
            <div className="group">
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2 group-hover:from-purple-300 group-hover:to-pink-300 transition-all duration-300">Prime Locations</div>
              <p className="text-slate-300">Exclusive Areas</p>
            </div>
            <div className="group">
              <div className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent mb-2 group-hover:from-amber-300 group-hover:to-orange-300 transition-all duration-300">Concierge Service</div>
              <p className="text-slate-300">24/7 Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Scheduling Modal */}
      {showSchedulingModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Schedule a Viewing</h2>
                <button
                  onClick={closeModal}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-100 rounded-full"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSchedulingSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all duration-200 hover:border-slate-300"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all duration-200 hover:border-slate-300"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
                    Contact Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all duration-200 hover:border-slate-300"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <label htmlFor="preferredDate" className="block text-sm font-medium text-slate-700 mb-2">
                    Preferred Date *
                  </label>
                  <input
                    type="date"
                    id="preferredDate"
                    name="preferredDate"
                    value={formData.preferredDate}
                    onChange={handleInputChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all duration-200 hover:border-slate-300"
                  />
                </div>

                <div>
                  <label htmlFor="timeWindow" className="block text-sm font-medium text-slate-700 mb-2">
                    Preferred Time Window *
                  </label>
                  <select
                    id="timeWindow"
                    name="timeWindow"
                    value={formData.timeWindow}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all duration-200 hover:border-slate-300"
                  >
                    <option value="">Select time window</option>
                    <option value="9:00 AM - 11:00 AM">9:00 AM - 11:00 AM</option>
                    <option value="11:00 AM - 1:00 PM">11:00 AM - 1:00 PM</option>
                    <option value="1:00 PM - 3:00 PM">1:00 PM - 3:00 PM</option>
                    <option value="3:00 PM - 5:00 PM">3:00 PM - 5:00 PM</option>
                    <option value="5:00 PM - 7:00 PM">5:00 PM - 7:00 PM</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">
                    Additional Message (Optional)
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all duration-200 resize-none hover:border-slate-300"
                    placeholder="Any specific requirements or questions..."
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 font-semibold shadow-lg hover:shadow-blue-500/25"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
