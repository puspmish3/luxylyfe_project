// Quick test to verify content API works
const { db } = require('./lib/database');

async function testContentAPI() {
  try {
    console.log('Testing content API...');
    
    // Test page content fetch
    const pageContents = await db.pageContent.findMany({ 
      pageType: 'HOME',
      isActive: true 
    });
    console.log('Page contents fetched:', pageContents.length);
    
    // Test site settings fetch  
    const siteSettings = await db.siteSettings.findMany();
    console.log('Site settings fetched:', siteSettings.length);
    
    console.log('Content API test completed successfully!');
  } catch (error) {
    console.error('Content API test failed:', error.message);
  }
}

testContentAPI();