const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('📄 Viewing LuxyLyfe Page Content Database\n');
    
    const content = await prisma.pageContent.findMany({
      orderBy: [
        { pageType: 'asc' },
        { sectionType: 'asc' },
        { order: 'asc' }
      ],
      select: {
        id: true,
        pageType: true,
        sectionType: true,
        title: true,
        isActive: true,
        order: true,
        createdAt: true
      }
    });

    console.log(`📊 Total Content Items: ${content.length}\n`);

    if (content.length === 0) {
      console.log('❌ No content found in database. You may need to run seeding scripts.\n');
      console.log('Try running:');
      console.log('  npm run prisma:seed');
      console.log('  npx ts-node seed-footer-content.js');
      return;
    }

    // Group by page type
    const groupedContent = content.reduce((acc, item) => {
      if (!acc[item.pageType]) {
        acc[item.pageType] = [];
      }
      acc[item.pageType].push(item);
      return acc;
    }, {});

    Object.entries(groupedContent).forEach(([pageType, items]) => {
      console.log(`📄 ${pageType} PAGE (${items.length} items):`);
      items.forEach((item, index) => {
        const activeStatus = item.isActive ? '✅' : '❌';
        const orderInfo = item.order !== null ? `[Order: ${item.order}]` : '[No Order]';
        console.log(`  ${index + 1}. ${activeStatus} ${item.sectionType} - "${item.title}" ${orderInfo}`);
      });
      console.log('');
    });

    console.log('📈 Content Statistics:');
    Object.entries(groupedContent).forEach(([pageType, items]) => {
      const activeCount = items.filter(item => item.isActive).length;
      const inactiveCount = items.length - activeCount;
      console.log(`   ${pageType}: ${activeCount} active, ${inactiveCount} inactive`);
    });

  } catch (error) {
    console.error('❌ Error fetching page content:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
