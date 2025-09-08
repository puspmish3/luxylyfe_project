// Script to update existing properties with email and phone contact information
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Sample contact data for properties
const contactUpdates = [
  {
    propertyId: "LUX-001",
    email: "contact@beverlyhillsestate.com",
    phone: "+1-310-555-0101"
  },
  {
    propertyId: "LUX-002",
    email: "inquiries@manhattanpenthouse.com",
    phone: "+1-212-555-0102"
  },
  {
    propertyId: "LUX-003",
    email: "info@malibuoceanfront.com",
    phone: "+1-310-555-0103"
  },
  {
    propertyId: "LUX-004",
    email: "reservations@aspenmountain.com",
    phone: "+1-970-555-0104"
  },
  {
    propertyId: "LUX-005",
    email: "luxury@miamibeachestate.com",
    phone: "+1-305-555-0105"
  },
  {
    propertyId: "LUX-006",
    email: "hamptons@summerestate.com",
    phone: "+1-631-555-0106"
  },
  {
    propertyId: "LUX-007",
    email: "historic@sfvictorian.com",
    phone: "+1-415-555-0107"
  },
  {
    propertyId: "LUX-008",
    email: "penthouse@chicagoluxury.com",
    phone: "+1-312-555-0108"
  },
  {
    propertyId: "LUX-009",
    email: "music@nashvilleestate.com",
    phone: "+1-615-555-0109"
  },
  {
    propertyId: "LUX-010",
    email: "waterfront@seattlehome.com",
    phone: "+1-206-555-0110"
  }
];

async function updatePropertyContacts() {
  console.log('📞 Updating property contact information...\n');

  try {
    for (const update of contactUpdates) {
      const updatedProperty = await prisma.property.update({
        where: { propertyId: update.propertyId },
        data: {
          email: update.email,
          phone: update.phone
        }
      });

      console.log(`✅ Updated ${update.propertyId} - ${updatedProperty.title}`);
      console.log(`   📧 Email: ${update.email}`);
      console.log(`   📞 Phone: ${update.phone}\n`);
    }

    console.log('🎉 All property contacts updated successfully!\n');

    // Verify the updates
    console.log('📋 Verification - Properties with contact info:');
    const propertiesWithContacts = await prisma.property.findMany({
      where: {
        OR: [
          { email: { not: null } },
          { phone: { not: null } }
        ]
      },
      select: {
        propertyId: true,
        title: true,
        email: true,
        phone: true
      },
      orderBy: { propertyId: 'asc' }
    });

    propertiesWithContacts.forEach(property => {
      console.log(`   ${property.propertyId}: ${property.email || 'No email'} | ${property.phone || 'No phone'}`);
    });

    console.log(`\n📊 Total properties with contact info: ${propertiesWithContacts.length}`);

  } catch (error) {
    console.error('❌ Error updating property contacts:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updatePropertyContacts();
