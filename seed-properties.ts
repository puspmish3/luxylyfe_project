import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const luxuryProperties = [
  {
    propertyId: "LUX-001",
    title: "Majestic Beverly Hills Estate",
    address: "1234 Rodeo Drive",
    city: "Beverly Hills",
    state: "California",
    zipCode: "90210",
    propertyType: "MANSION" as const,
    bedrooms: 8,
    bathrooms: 10.5,
    sqft: 12500,
    lotSize: 2.3,
    price: 25000000,
    description: "Stunning Mediterranean-style mansion with panoramic city views, infinity pool, wine cellar, and state-of-the-art home theater.",
    amenities: ["Infinity Pool", "Wine Cellar", "Home Theater", "Gym", "Tennis Court", "Guest House", "Chef's Kitchen", "Library"],
    images: ["https://example.com/property1-1.jpg", "https://example.com/property1-2.jpg"],
    isFeature: true
  },
  {
    propertyId: "LUX-002",
    title: "Manhattan Penthouse Paradise",
    address: "432 Park Avenue, Penthouse",
    city: "New York",
    state: "New York",
    zipCode: "10022",
    propertyType: "PENTHOUSE",
    bedrooms: 4,
    bathrooms: 4.5,
    sqft: 4200,
    lotSize: null,
    price: 18500000,
    description: "Luxurious penthouse with 360-degree city views, private elevator, and rooftop terrace overlooking Central Park.",
    amenities: ["Private Elevator", "Rooftop Terrace", "Central Park Views", "Concierge Service", "Gym Access", "Smart Home Technology"],
    images: ["https://example.com/property2-1.jpg", "https://example.com/property2-2.jpg"],
    isFeature: true
  },
  {
    propertyId: "LUX-003",
    title: "Malibu Oceanfront Villa",
    address: "789 Pacific Coast Highway",
    city: "Malibu",
    state: "California",
    zipCode: "90265",
    propertyType: "WATERFRONT",
    bedrooms: 6,
    bathrooms: 7,
    sqft: 8500,
    lotSize: 1.8,
    price: 32000000,
    description: "Breathtaking oceanfront villa with private beach access, infinity pool merging with the ocean, and floor-to-ceiling windows.",
    amenities: ["Private Beach", "Infinity Pool", "Ocean Views", "Outdoor Kitchen", "Wine Cellar", "Spa", "Private Dock"],
    images: ["https://example.com/property3-1.jpg", "https://example.com/property3-2.jpg"],
    isFeature: false
  },
  {
    propertyId: "LUX-004",
    title: "Aspen Mountain Retreat",
    address: "567 Snowmass Drive",
    city: "Aspen",
    state: "Colorado",
    zipCode: "81611",
    propertyType: "MOUNTAIN_RETREAT",
    bedrooms: 7,
    bathrooms: 8,
    sqft: 9200,
    lotSize: 3.5,
    price: 22000000,
    description: "Luxury ski-in/ski-out chalet with panoramic mountain views, heated outdoor pool, and rustic yet modern design.",
    amenities: ["Ski-In/Ski-Out", "Heated Pool", "Mountain Views", "Fireplace", "Sauna", "Game Room", "Gourmet Kitchen"],
    images: ["https://example.com/property4-1.jpg", "https://example.com/property4-2.jpg"],
    isFeature: false
  },
  {
    propertyId: "LUX-005",
    title: "Miami Beach Modern Estate",
    address: "345 Star Island Drive",
    city: "Miami Beach",
    state: "Florida",
    zipCode: "33139",
    propertyType: "ESTATE",
    bedrooms: 9,
    bathrooms: 11,
    sqft: 15000,
    lotSize: 1.2,
    price: 28500000,
    description: "Ultra-modern waterfront estate with private marina, rooftop pool, and smart home automation throughout.",
    amenities: ["Private Marina", "Rooftop Pool", "Smart Home", "Wine Room", "Home Office", "Guest Suites", "Outdoor Cinema"],
    images: ["https://example.com/property5-1.jpg", "https://example.com/property5-2.jpg"],
    isFeature: true
  },
  {
    propertyId: "LUX-006",
    title: "Hamptons Summer Estate",
    address: "123 Meadow Lane",
    city: "Southampton",
    state: "New York",
    zipCode: "11968",
    propertyType: "ESTATE",
    bedrooms: 10,
    bathrooms: 12,
    sqft: 18000,
    lotSize: 5.2,
    price: 35000000,
    description: "Magnificent Hamptons estate with private beach, tennis court, pool house, and beautifully manicured gardens.",
    amenities: ["Private Beach", "Tennis Court", "Pool House", "Gardens", "Guest Cottage", "Wine Cellar", "Formal Dining"],
    images: ["https://example.com/property6-1.jpg", "https://example.com/property6-2.jpg"],
    isFeature: false
  },
  {
    propertyId: "LUX-007",
    title: "San Francisco Victorian Mansion",
    address: "2468 Pacific Heights Boulevard",
    city: "San Francisco",
    state: "California",
    zipCode: "94115",
    propertyType: "HISTORIC_HOME",
    bedrooms: 6,
    bathrooms: 7.5,
    sqft: 7800,
    lotSize: 0.8,
    price: 16500000,
    description: "Restored Victorian mansion in Pacific Heights with Golden Gate views, original architectural details, and modern amenities.",
    amenities: ["Golden Gate Views", "Historic Details", "Modern Kitchen", "Library", "Wine Storage", "Garden Terrace", "Garage"],
    images: ["https://example.com/property7-1.jpg", "https://example.com/property7-2.jpg"],
    isFeature: false
  },
  {
    propertyId: "LUX-008",
    title: "Chicago Luxury Penthouse",
    address: "875 North Michigan Avenue, PH",
    city: "Chicago",
    state: "Illinois",
    zipCode: "60611",
    propertyType: "PENTHOUSE",
    bedrooms: 5,
    bathrooms: 6,
    sqft: 6500,
    lotSize: null,
    price: 12800000,
    description: "Spectacular penthouse with Lake Michigan views, private terrace, and access to world-class building amenities.",
    amenities: ["Lake Views", "Private Terrace", "Concierge", "Fitness Center", "Valet Parking", "Storage", "High-End Finishes"],
    images: ["https://example.com/property8-1.jpg", "https://example.com/property8-2.jpg"],
    isFeature: false
  },
  {
    propertyId: "LUX-009",
    title: "Nashville Music Estate",
    address: "456 Belle Meade Boulevard",
    city: "Nashville",
    state: "Tennessee",
    zipCode: "37205",
    propertyType: "ESTATE",
    bedrooms: 8,
    bathrooms: 10,
    sqft: 14000,
    lotSize: 4.1,
    price: 19500000,
    description: "Elegant Southern estate with recording studio, pool pavilion, and extensive outdoor entertaining spaces.",
    amenities: ["Recording Studio", "Pool Pavilion", "Outdoor Kitchen", "Stables", "Guest House", "Wine Cellar", "Home Theater"],
    images: ["https://example.com/property9-1.jpg", "https://example.com/property9-2.jpg"],
    isFeature: false
  },
  {
    propertyId: "LUX-010",
    title: "Seattle Waterfront Modern Home",
    address: "789 Lake Washington Boulevard",
    city: "Seattle",
    state: "Washington",
    zipCode: "98144",
    propertyType: "WATERFRONT",
    bedrooms: 5,
    bathrooms: 6,
    sqft: 6800,
    lotSize: 1.1,
    price: 14200000,
    description: "Contemporary waterfront home with private dock, floor-to-ceiling windows, and sustainable design features.",
    amenities: ["Private Dock", "Lake Views", "Sustainable Design", "Home Office", "Wine Storage", "Outdoor Fire Pit", "Guest Suite"],
    images: ["https://example.com/property10-1.jpg", "https://example.com/property10-2.jpg"],
    isFeature: true
  }
]

async function seedProperties() {
  console.log('🏡 Seeding luxury properties...')

  for (const property of luxuryProperties) {
    await prisma.property.upsert({
      where: { propertyId: property.propertyId },
      update: {},
      create: property
    })
    console.log(`✅ Created property: ${property.propertyId} - ${property.title}`)
  }

  console.log('\n🎉 Property seeding completed!')
  console.log(`📊 Total properties: ${luxuryProperties.length}`)
  
  // Display summary
  const totalProperties = await prisma.property.count()
  const featuredProperties = await prisma.property.count({ where: { isFeature: true } })
  
  console.log(`\n📈 Database Summary:`)
  console.log(`   Total Properties: ${totalProperties}`)
  console.log(`   Featured Properties: ${featuredProperties}`)
  console.log(`   Property Types: ${new Set(luxuryProperties.map(p => p.propertyType)).size}`)
  console.log(`   Price Range: $${Math.min(...luxuryProperties.map(p => p.price)).toLocaleString()} - $${Math.max(...luxuryProperties.map(p => p.price)).toLocaleString()}`)
}

seedProperties()
  .catch((e) => {
    console.error('❌ Error seeding properties:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
