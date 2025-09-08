import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedContent() {
  try {
    console.log('🌱 Seeding content management data...')

    // Clear existing content
    await prisma.pageContent.deleteMany()
    await prisma.siteSettings.deleteMany()

    // Home page content
    await prisma.pageContent.createMany({
      data: [
        // Home Hero Section
        {
          pageType: 'HOME',
          sectionType: 'HERO',
          title: 'LuxyLyfe',
          subtitle: 'Where Luxury Meets Lifestyle',
          content: 'Discover extraordinary homes that redefine modern living. Each property is a masterpiece of design, comfort, and sophistication.',
          images: [
            'https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80',
            'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
            'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2075&q=80',
            'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2053&q=80'
          ],
          order: 1,
          isActive: true
        },
        // Home Features
        {
          pageType: 'HOME',
          sectionType: 'FEATURES',
          title: 'Why Choose LuxyLyfe',
          content: 'We don\'t just sell homes – we curate exceptional living experiences that exceed your highest expectations.',
          images: [],
          order: 1,
          isActive: true
        },
        {
          pageType: 'HOME',
          sectionType: 'FEATURES',
          title: 'Premium Locations',
          content: 'Exclusive properties in the most desirable neighborhoods and pristine locations.',
          images: [],
          order: 2,
          isActive: true
        },
        {
          pageType: 'HOME',
          sectionType: 'FEATURES',
          title: 'Luxury Amenities',
          content: 'State-of-the-art facilities and world-class amenities in every property.',
          images: [],
          order: 3,
          isActive: true
        },
        {
          pageType: 'HOME',
          sectionType: 'FEATURES',
          title: 'Personalized Service',
          content: 'Dedicated support and personalized assistance throughout your journey.',
          images: [],
          order: 4,
          isActive: true
        }
      ]
    })

    // Projects page content
    await prisma.pageContent.createMany({
      data: [
        {
          pageType: 'PROJECTS',
          sectionType: 'HERO',
          title: 'Luxury Property Portfolio',
          content: 'Discover our exquisite collection of luxury homes and estates, each crafted with meticulous attention to detail and premium materials.',
          images: [
            'https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80'
          ],
          order: 1,
          isActive: true
        }
      ]
    })

    // Site settings
    await prisma.siteSettings.createMany({
      data: [
        {
          key: 'site_name',
          value: 'LuxyLyfe - Luxury Homes',
          dataType: 'string',
          isPublic: true
        },
        {
          key: 'contact_email',
          value: 'contact@luxylyfe.com',
          dataType: 'string',
          isPublic: true
        },
        {
          key: 'contact_phone',
          value: '+1 (555) 123-4567',
          dataType: 'string',
          isPublic: true
        },
        {
          key: 'company_address',
          value: '123 Luxury Lane, Premium City, PC 12345',
          dataType: 'string',
          isPublic: true
        },
        {
          key: 'hero_rotation_speed',
          value: '4000',
          dataType: 'number',
          isPublic: true
        },
        {
          key: 'properties_per_page',
          value: '6',
          dataType: 'number',
          isPublic: false
        },
        {
          key: 'admin_notification_email',
          value: 'admin@luxylyfe.com',
          dataType: 'string',
          isPublic: false
        }
      ]
    })

    console.log('✅ Content management data seeded successfully!')
  } catch (error) {
    console.error('❌ Error seeding content:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  seedContent().catch((error) => {
    console.error('Seeding failed:', error)
    process.exit(1)
  })
}

export default seedContent
