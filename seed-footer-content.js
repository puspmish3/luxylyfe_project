const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function seedFooterContent() {
  console.log('🌱 Seeding footer content...')

  try {
    // Navigation Links Section
    const navigationContent = await prisma.pageContent.create({
      data: {
        pageType: 'FOOTER',
        sectionType: 'NAVIGATION',
        title: 'Quick Links',
        subtitle: 'Site Navigation',
        content: JSON.stringify([
          { title: 'Home', url: '/' },
          { title: 'Mission', url: '/mission' },
          { title: 'Vision', url: '/vision' },
          { title: 'Projects', url: '/projects' },
          { title: 'About Us', url: '/about-us' },
          { title: 'Contact Us', url: '/contact-us' },
          { title: 'Login', url: '/login' }
        ]),
        order: 1,
        isActive: true
      }
    })

    // Services Section
    const servicesContent = await prisma.pageContent.create({
      data: {
        pageType: 'FOOTER',
        sectionType: 'SERVICES',
        title: 'Our Services',
        subtitle: 'What we offer',
        content: JSON.stringify([
          { title: 'Luxury Property Sales', url: '#' },
          { title: 'Property Management', url: '#' },
          { title: 'Investment Consulting', url: '#' },
          { title: 'Concierge Services', url: '#' },
          { title: 'Property Valuation', url: '#' }
        ]),
        order: 2,
        isActive: true
      }
    })

    // Contact Info Section
    const contactInfoContent = await prisma.pageContent.create({
      data: {
        pageType: 'FOOTER',
        sectionType: 'CONTACT_INFO',
        title: 'Contact Info',
        subtitle: 'Get in touch',
        content: JSON.stringify({
          address: '123 Luxury Avenue\nBeverly Hills, CA 90210',
          phone: '(555) 123-4567',
          email: 'info@luxylyfe.biz'
        }),
        order: 3,
        isActive: true
      }
    })

    // Legal Links Section
    const legalContent = await prisma.pageContent.create({
      data: {
        pageType: 'FOOTER',
        sectionType: 'LEGAL',
        title: 'Legal',
        subtitle: 'Legal information',
        content: JSON.stringify([
          { title: 'Privacy Policy', url: '/privacy' },
          { title: 'Terms of Service', url: '/terms' },
          { title: 'Cookie Policy', url: '/cookies' }
        ]),
        order: 4,
        isActive: true
      }
    })

    console.log('✅ Footer content seeded successfully!')
    console.log('📍 Navigation:', navigationContent.id)
    console.log('🛠️ Services:', servicesContent.id)
    console.log('📞 Contact Info:', contactInfoContent.id)
    console.log('⚖️ Legal:', legalContent.id)

  } catch (error) {
    console.error('❌ Error seeding footer content:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the seed function
if (require.main === module) {
  seedFooterContent()
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

module.exports = { seedFooterContent }
