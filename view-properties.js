// Test script to view created properties
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function viewProperties() {
  try {
    console.log('🏡 Viewing LuxyLyfe Properties Database\n');
    
    // Get all properties
    const properties = await prisma.property.findMany({
      orderBy: {
        propertyId: 'asc'
      }
    });
    
    console.log(`📊 Total Properties: ${properties.length}\n`);
    
    // Display each property
    properties.forEach((property, index) => {
      console.log(`${index + 1}. ${property.propertyId} - ${property.title}`);
      console.log(`   📍 ${property.address}, ${property.city}, ${property.state} ${property.zipCode}`);
      console.log(`   🏠 ${property.propertyType} | ${property.bedrooms}BR/${property.bathrooms}BA | ${property.sqft?.toLocaleString()} sqft`);
      console.log(`   💰 $${property.price.toLocaleString()}`);
      console.log(`   📧 Email: ${property.email || 'Not provided'}`);
      console.log(`   📞 Phone: ${property.phone || 'Not provided'}`);
      console.log(`   ⭐ Featured: ${property.isFeature ? 'Yes' : 'No'}`);
      console.log(`   🎯 Amenities: ${property.amenities.slice(0, 3).join(', ')}${property.amenities.length > 3 ? '...' : ''}`);
      console.log('');
    });
    
    // Property type breakdown
    const propertyTypes = {};
    properties.forEach(p => {
      propertyTypes[p.propertyType] = (propertyTypes[p.propertyType] || 0) + 1;
    });
    
    console.log('📈 Property Type Breakdown:');
    Object.entries(propertyTypes).forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`);
    });
    
    // Featured properties
    const featuredProperties = properties.filter(p => p.isFeature);
    console.log(`\n⭐ Featured Properties (${featuredProperties.length}):`);
    featuredProperties.forEach(p => {
      console.log(`   • ${p.propertyId} - ${p.title} ($${p.price.toLocaleString()})`);
    });
    
    // Price statistics
    const prices = properties.map(p => p.price);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    console.log(`\n💰 Price Statistics:`);
    console.log(`   Minimum: $${Math.min(...prices).toLocaleString()}`);
    console.log(`   Maximum: $${Math.max(...prices).toLocaleString()}`);
    console.log(`   Average: $${Math.round(avgPrice).toLocaleString()}`);
    
  } catch (error) {
    console.error('❌ Error viewing properties:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

viewProperties();
