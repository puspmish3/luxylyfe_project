// Script to add sample images to properties
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Sample luxury property images from Unsplash (free to use)
const sampleImages = {
  "LUX-001": [
    "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80", // Luxury mansion
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80", // Beverly Hills style
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80"  // Pool area
  ],
  "LUX-002": [
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80", // Manhattan penthouse
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80", // City views
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80"  // Modern interior
  ],
  "LUX-003": [
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80", // Ocean front villa
    "https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800&q=80", // Beach house
    "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&q=80"  // Ocean view
  ],
  "LUX-004": [
    "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&q=80", // Mountain retreat
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80", // Ski chalet
    "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80"  // Mountain views
  ],
  "LUX-005": [
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80", // Miami modern
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80", // Waterfront estate
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80"  // Pool area
  ],
  "LUX-006": [
    "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80", // Hamptons estate
    "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&q=80", // Summer house
    "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&q=80"  // Garden view
  ],
  "LUX-007": [
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80", // Victorian mansion
    "https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800&q=80", // Historic home
    "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=800&q=80"  // San Francisco style
  ],
  "LUX-008": [
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80", // Chicago penthouse
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80", // Lake views
    "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&q=80"  // Modern luxury
  ],
  "LUX-009": [
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80", // Nashville estate
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80", // Southern mansion
    "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80"  // Recording studio
  ],
  "LUX-010": [
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80", // Seattle waterfront
    "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&q=80", // Lake Washington
    "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&q=80"  // Modern design
  ]
};

async function addSampleImages() {
  console.log('🖼️ Adding sample images to properties...\n');

  try {
    for (const [propertyId, imageUrls] of Object.entries(sampleImages)) {
      const updatedProperty = await prisma.property.update({
        where: { propertyId },
        data: {
          images: imageUrls
        }
      });

      console.log(`✅ Updated ${propertyId} - ${updatedProperty.title}`);
      console.log(`   📸 Added ${imageUrls.length} images\n`);
    }

    console.log('🎉 All property images updated successfully!\n');

    // Verify the updates
    console.log('📋 Verification - Properties with images:');
    const propertiesWithImages = await prisma.property.findMany({
      where: {
        images: {
          isEmpty: false
        }
      },
      select: {
        propertyId: true,
        title: true,
        images: true
      },
      orderBy: { propertyId: 'asc' }
    });

    propertiesWithImages.forEach(property => {
      console.log(`   ${property.propertyId}: ${property.images.length} images`);
    });

    console.log(`\n📊 Total properties with images: ${propertiesWithImages.length}`);

  } catch (error) {
    console.error('❌ Error updating property images:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

addSampleImages();
