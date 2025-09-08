export interface PageContent {
  id: string
  sectionType: string
  title: string
  subtitle?: string
  content?: string
  images: string[]
  order: number
}

export interface SiteSettings {
  [key: string]: any
}

export interface ContentResponse {
  content?: PageContent[]
  settings?: SiteSettings
  message: string
}

export async function fetchPageContent(
  pageType: string, 
  includeSettings: boolean = false
): Promise<ContentResponse> {
  try {
    const params = new URLSearchParams({
      pageType,
      ...(includeSettings && { includeSettings: 'true' })
    })

    const response = await fetch(`/api/content?${params}`)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch content: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching page content:', error)
    return {
      content: [],
      settings: {},
      message: 'Failed to load content'
    }
  }
}

export function getContentBySection(
  content: PageContent[], 
  sectionType: string
): PageContent | undefined {
  return content.find(item => item.sectionType === sectionType)
}

export function getContentsBySection(
  content: PageContent[], 
  sectionType: string
): PageContent[] {
  return content
    .filter(item => item.sectionType === sectionType)
    .sort((a, b) => a.order - b.order)
}

export function getFirstImage(content: PageContent): string | undefined {
  return content.images && content.images.length > 0 ? content.images[0] : undefined
}

export function getAllImages(content: PageContent[]): string[] {
  return content.reduce((images: string[], item) => {
    return [...images, ...item.images]
  }, [])
}
