import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get public page content and settings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pageType = searchParams.get('pageType')
    const includeSettings = searchParams.get('includeSettings') === 'true'

    let result: any = {}

    // Get page content
    if (pageType) {
      const content = await prisma.pageContent.findMany({
        where: {
          pageType: pageType as any,
          isActive: true
        },
        select: {
          id: true,
          sectionType: true,
          title: true,
          subtitle: true,
          content: true,
          images: true,
          order: true
        },
        orderBy: [
          { order: 'asc' },
          { createdAt: 'desc' }
        ]
      })

      result.content = content
    }

    // Get public settings if requested
    if (includeSettings) {
      const settings = await prisma.siteSettings.findMany({
        where: { isPublic: true },
        select: {
          key: true,
          value: true,
          dataType: true
        }
      })

      // Convert to key-value object for easier access
      result.settings = settings.reduce((acc: any, setting: any) => {
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
