'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface PageContent {
  id: string
  pageType: string
  sectionType: string
  title: string
  subtitle?: string
  content?: string
  images: string[]
  order: number
  isActive: boolean
}

interface SiteSettings {
  key: string
  value: string
  dataType: string
  isPublic: boolean
}

export default function ContentManagement() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [contents, setContents] = useState<PageContent[]>([])
  const [settings, setSettings] = useState<SiteSettings[]>([])
  const [selectedPageType, setSelectedPageType] = useState('HOME')
  const [editingContent, setEditingContent] = useState<PageContent | null>(null)
  const [editingSettings, setEditingSettings] = useState<SiteSettings | null>(null)
  const [showContentForm, setShowContentForm] = useState(false)
  const [showSettingsForm, setShowSettingsForm] = useState(false)
  const [loading, setLoading] = useState(true)

  const pageTypes = ['HOME', 'PROJECTS', 'ABOUT', 'MISSION', 'VISION', 'CONTACT']
  const sectionTypes = ['HERO', 'SECTION', 'GALLERY', 'FEATURES', 'TESTIMONIALS']
  const dataTypes = ['string', 'number', 'boolean', 'json']

  const [formData, setFormData] = useState({
    pageType: 'HOME',
    sectionType: 'HERO',
    title: '',
    subtitle: '',
    content: '',
    images: [] as string[],
    order: 0,
    isActive: true
  })

  const [settingsFormData, setSettingsFormData] = useState({
    key: '',
    value: '',
    dataType: 'string',
    isPublic: false
  })

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const userData = await response.json()
          if (userData.user && (userData.user.role === 'ADMIN' || userData.user.role === 'SUPERADMIN')) {
            setUser(userData.user)
          } else {
            router.push('/admin-login')
          }
        } else {
          router.push('/admin-login')
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/admin-login')
      } finally {
        setLoading(false)
      }
    }

    const fetchContents = async () => {
      try {
        const response = await fetch('/api/admin/content')
        if (response.ok) {
          const data = await response.json()
          setContents(data.contents || [])
        }
      } catch (error) {
        console.error('Error fetching contents:', error)
      }
    }

    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/admin/settings')
        if (response.ok) {
          const data = await response.json()
          setSettings(data.settings || [])
        }
      } catch (error) {
        console.error('Error fetching settings:', error)
      }
    }

    const initializeData = async () => {
      await checkAuth()
      await fetchContents()
      await fetchSettings()
    }
    initializeData()
  }, [router])

  const fetchContents = async () => {
    try {
      const response = await fetch('/api/admin/content')
      if (response.ok) {
        const data = await response.json()
        setContents(data.contents || [])
      }
    } catch (error) {
      console.error('Error fetching contents:', error)
    }
  }

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data.settings || [])
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    }
  }

  const handleContentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const method = editingContent ? 'PUT' : 'POST'
      const url = editingContent 
        ? `/api/admin/content?id=${editingContent.id}`
        : '/api/admin/content'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchContents()
        setShowContentForm(false)
        setEditingContent(null)
        resetContentForm()
        alert(editingContent ? 'Content updated successfully!' : 'Content created successfully!')
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error saving content:', error)
      alert('Failed to save content')
    }
  }

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settingsFormData),
      })

      if (response.ok) {
        await fetchSettings()
        setShowSettingsForm(false)
        setEditingSettings(null)
        resetSettingsForm()
        alert('Settings updated successfully!')
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings')
    }
  }

  const editContent = (content: PageContent) => {
    setEditingContent(content)
    setFormData({
      pageType: content.pageType,
      sectionType: content.sectionType,
      title: content.title,
      subtitle: content.subtitle || '',
      content: content.content || '',
      images: content.images,
      order: content.order,
      isActive: content.isActive
    })
    setShowContentForm(true)
  }

  const editSettings = (setting: SiteSettings) => {
    setEditingSettings(setting)
    setSettingsFormData({
      key: setting.key,
      value: setting.value,
      dataType: setting.dataType,
      isPublic: setting.isPublic
    })
    setShowSettingsForm(true)
  }

  const resetContentForm = () => {
    setFormData({
      pageType: 'HOME',
      sectionType: 'HERO',
      title: '',
      subtitle: '',
      content: '',
      images: [],
      order: 0,
      isActive: true
    })
  }

  const resetSettingsForm = () => {
    setSettingsFormData({
      key: '',
      value: '',
      dataType: 'string',
      isPublic: false
    })
  }

  const addImage = () => {
    const imageUrl = prompt('Enter image URL:')
    if (imageUrl) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, imageUrl]
      }))
    }
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const filteredContents = contents.filter(content => content.pageType === selectedPageType)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
              <p className="text-gray-600">Manage page content and site settings</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Back to Dashboard
              </button>
              <button
                onClick={() => {
                  resetContentForm()
                  setShowContentForm(true)
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add Content
              </button>
              <button
                onClick={() => {
                  resetSettingsForm()
                  setShowSettingsForm(true)
                }}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Add Setting
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Page Content Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Page Content</h2>
                <select
                  value={selectedPageType}
                  onChange={(e) => setSelectedPageType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                >
                  {pageTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-4">
                {filteredContents.map(content => (
                  <div key={content.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                            {content.sectionType}
                          </span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 text-sm rounded">
                            Order: {content.order}
                          </span>
                          <span className={`px-2 py-1 text-sm rounded ${
                            content.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {content.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">{content.title}</h3>
                        {content.subtitle && (
                          <p className="text-gray-600 mt-1">{content.subtitle}</p>
                        )}
                        {content.content && (
                          <p className="text-gray-700 mt-2 text-sm">{content.content.substring(0, 150)}...</p>
                        )}
                        {content.images.length > 0 && (
                          <p className="text-sm text-gray-500 mt-2">{content.images.length} image(s)</p>
                        )}
                      </div>
                      <button
                        onClick={() => editContent(content)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))}

                {filteredContents.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No content found for {selectedPageType} page
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Site Settings Section */}
          <div>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Site Settings</h2>
              
              <div className="space-y-3">
                {settings.map(setting => (
                  <div key={setting.key} className="border border-gray-200 rounded p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">{setting.key}</span>
                          <span className="px-1 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                            {setting.dataType}
                          </span>
                          {setting.isPublic && (
                            <span className="px-1 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                              Public
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 truncate">{setting.value}</p>
                      </div>
                      <button
                        onClick={() => editSettings(setting)}
                        className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))}

                {settings.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    No settings configured
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Form Modal */}
      {showContentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {editingContent ? 'Edit Content' : 'Add New Content'}
            </h3>
            
            <form onSubmit={handleContentSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Page Type
                  </label>
                  <select
                    value={formData.pageType}
                    onChange={(e) => setFormData(prev => ({ ...prev, pageType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    {pageTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Section Type
                  </label>
                  <select
                    value={formData.sectionType}
                    onChange={(e) => setFormData(prev => ({ ...prev, sectionType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    {sectionTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subtitle (Optional)
                </label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content (Optional)
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Images
                </label>
                <div className="space-y-2">
                  {formData.images.map((image, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={image}
                        onChange={(e) => {
                          const newImages = [...formData.images]
                          newImages[index] = e.target.value
                          setFormData(prev => ({ ...prev, images: newImages }))
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="Image URL"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addImage}
                    className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Add Image
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div className="flex items-center">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Active</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowContentForm(false)
                    setEditingContent(null)
                    resetContentForm()
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {editingContent ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Settings Form Modal */}
      {showSettingsForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              {editingSettings ? 'Edit Setting' : 'Add New Setting'}
            </h3>
            
            <form onSubmit={handleSettingsSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Key
                </label>
                <input
                  type="text"
                  value={settingsFormData.key}
                  onChange={(e) => setSettingsFormData(prev => ({ ...prev, key: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                  disabled={!!editingSettings}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Value
                </label>
                <textarea
                  value={settingsFormData.value}
                  onChange={(e) => setSettingsFormData(prev => ({ ...prev, value: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Type
                </label>
                <select
                  value={settingsFormData.dataType}
                  onChange={(e) => setSettingsFormData(prev => ({ ...prev, dataType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  {dataTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settingsFormData.isPublic}
                    onChange={(e) => setSettingsFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Public (accessible via public API)</span>
                </label>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowSettingsForm(false)
                    setEditingSettings(null)
                    resetSettingsForm()
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  {editingSettings ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
