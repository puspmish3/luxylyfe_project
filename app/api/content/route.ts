import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// GET - Get public page content and settings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pageType = searchParams.get('pageType')
    const includeSettings = searchParams.get('includeSettings') === 'true'

    let result: any = {}

    // Get page content
    if (pageType) {
      const content = await db.pageContent.findMany({
        pageType,
        isActive: true
      })

      // Sort content by order
      content.sort((a, b) => {
        if (a.order !== b.order) return a.order - b.order
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })

      // Clean the response
      const cleanContent = content.map(item => ({
        id: item.id,
        sectionType: item.sectionType,
        title: item.title,
        subtitle: item.subtitle,
        content: item.content,
        images: item.images,
        order: item.order
      }))

      result.content = cleanContent
    }

    // Get public settings if requested
    if (includeSettings) {
      const allSettings = await db.siteSettings.findMany()
      const publicSettings = allSettings.filter(setting => setting.isPublic)

      // Convert to key-value object for easier access
      result.settings = publicSettings.reduce((acc: any, setting: any) => {
        let value: any = setting.value
        
        // Convert data types
        if (setting.dataType === 'number') {
          value = Number(setting.value)
        } else if (setting.dataType === 'boolean') {
          value = setting.value === 'true'
        } else if (setting.dataType === 'json') {
          try {
            value = JSON.parse(setting.value)
          } catch (error) {
            console.error('Error parsing JSON setting:', setting.key, error)
          }
        }
        
        acc[setting.key] = value
        return acc
      }, {})
    }

    return NextResponse.json({
      ...result,
      message: 'Public content retrieved successfully'
    })

  } catch (error) {
    console.error('Error fetching public content:', error)
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    )
  }
}
