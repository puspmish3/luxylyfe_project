/**
 * Cosmos DB Primary Test Suite
 * 
 * This script tests the application after switching to Cosmos DB as primary database
 */

const { db } = require('./lib/database');
require('dotenv').config({ path: '.env.local' });

/**
 * Test basic database operations
 */
async function testBasicOperations() {
  console.log('🧪 Testing basic Cosmos DB operations...\n');
  
  try {
    // Test user operations
    console.log('👤 Testing User operations...');
    const userCount = await db.user.count();
    console.log(`   ✅ User count: ${userCount}`);
    
    const users = await db.user.findMany();
    console.log(`   ✅ Found ${users.length} users`);
    
    if (users.length > 0) {
      const firstUser = await db.user.findUnique({ email: users[0].email });
      console.log(`   ✅ User lookup by email: ${firstUser?.name || 'Found'}`);
    }
    
    // Test property operations
    console.log('\n🏠 Testing Property operations...');
    const propertyCount = await db.property.count();
    console.log(`   ✅ Property count: ${propertyCount}`);
    
    const properties = await db.property.findMany({ isAvailable: true });
    console.log(`   ✅ Available properties: ${properties.length}`);
    
    const featuredProperties = await db.property.findMany({ isFeature: true });
    console.log(`   ✅ Featured properties: ${featuredProperties.length}`);
    
    // Test content operations
    console.log('\n📄 Testing Content operations...');
    const contentCount = await db.pageContent.count();
    console.log(`   ✅ Page content count: ${contentCount}`);
    
    const homeContent = await db.pageContent.findMany({ pageType: 'HOME', isActive: true });
    console.log(`   ✅ Home page content: ${homeContent.length} sections`);
    
    // Test settings operations
    console.log('\n⚙️ Testing Settings operations...');
    const settingsCount = await db.siteSettings.count();
    console.log(`   ✅ Site settings count: ${settingsCount}`);
    
    const settings = await db.siteSettings.findMany();
    console.log(`   ✅ Total settings: ${settings.length}`);
    
    // Test session operations
    console.log('\n🔐 Testing Session operations...');
    const sessionCount = await db.session.count();
    console.log(`   ✅ Session count: ${sessionCount}`);
    
    // Test login attempt operations
    console.log('\n📊 Testing Login Attempt operations...');
    const loginAttemptCount = await db.loginAttempt.count();
    console.log(`   ✅ Login attempt count: ${loginAttemptCount}`);
    
    console.log('\n🎉 All basic operations completed successfully!');
    return true;
    
  } catch (error) {
    console.error('\n❌ Basic operations test failed:', error.message);
    return false;
  }
}

/**
 * Test API-like operations
 */
async function testAPIOperations() {
  console.log('\n🌐 Testing API-like operations...\n');
  
  try {
    // Test user authentication flow
    console.log('🔐 Testing authentication operations...');
    
    const adminUsers = await db.user.findMany({ role: 'ADMIN' });
    console.log(`   ✅ Admin users: ${adminUsers.length}`);
    
    const memberUsers = await db.user.findMany({ role: 'MEMBER' });
    console.log(`   ✅ Member users: ${memberUsers.length}`);
    
    // Test property queries (similar to API requests)
    console.log('\n🏠 Testing property API operations...');
    
    const allProperties = await db.property.findMany();
    const availableProperties = allProperties.filter(p => p.isAvailable);
    const featuredProperties = allProperties.filter(p => p.isFeature);
    
    console.log(`   ✅ All properties: ${allProperties.length}`);
    console.log(`   ✅ Available properties: ${availableProperties.length}`);
    console.log(`   ✅ Featured properties: ${featuredProperties.length}`);
    
    // Test property lookup by propertyId
    if (allProperties.length > 0) {
      const firstProperty = allProperties[0];
      const foundProperty = await db.property.findUnique({ propertyId: firstProperty.propertyId });
      console.log(`   ✅ Property lookup by ID: ${foundProperty ? 'Success' : 'Failed'}`);
    }
    
    // Test content operations
    console.log('\n📄 Testing content API operations...');
    
    const pageTypes = ['HOME', 'ABOUT', 'PROJECTS', 'MISSION', 'VISION', 'CONTACT'];
    for (const pageType of pageTypes) {
      const content = await db.pageContent.findMany({ pageType, isActive: true });
      console.log(`   ✅ ${pageType} content: ${content.length} sections`);
    }
    
    // Test settings lookup
    console.log('\n⚙️ Testing settings API operations...');
    const allSettings = await db.siteSettings.findMany();
    const publicSettings = allSettings.filter(s => s.isPublic);
    console.log(`   ✅ Public settings: ${publicSettings.length}/${allSettings.length}`);
    
    if (allSettings.length > 0) {
      const firstSetting = allSettings[0];
      const foundSetting = await db.siteSettings.findUnique({ key: firstSetting.key });
      console.log(`   ✅ Setting lookup by key: ${foundSetting ? 'Success' : 'Failed'}`);
    }
    
    console.log('\n🎉 All API operations completed successfully!');
    return true;
    
  } catch (error) {
    console.error('\n❌ API operations test failed:', error.message);
    return false;
  }
}

/**
 * Test data integrity
 */
async function testDataIntegrity() {
  console.log('\n🔍 Testing data integrity...\n');
  
  try {
    // Check required fields
    console.log('✅ Testing required fields...');
    
    const users = await db.user.findMany();
    for (const user of users) {
      if (!user.email || !user.password || !user.role) {
        throw new Error(`User ${user.id} missing required fields`);
      }
    }
    console.log(`   ✅ All ${users.length} users have required fields`);
    
    const properties = await db.property.findMany();
    for (const property of properties) {
      if (!property.title || !property.address || !property.price) {
        throw new Error(`Property ${property.id} missing required fields`);
      }
    }
    console.log(`   ✅ All ${properties.length} properties have required fields`);
    
    // Check data types
    console.log('\n📊 Testing data types...');
    
    for (const property of properties) {
      if (typeof property.price !== 'number') {
        throw new Error(`Property ${property.id} has invalid price type`);
      }
      if (property.bedrooms && typeof property.bedrooms !== 'number') {
        throw new Error(`Property ${property.id} has invalid bedrooms type`);
      }
    }
    console.log(`   ✅ All property data types are correct`);
    
    // Check relationships
    console.log('\n🔗 Testing data relationships...');
    
    const sessions = await db.session.findMany();
    for (const session of sessions) {
      const user = await db.user.findUnique({ id: session.userId });
      if (!user) {
        console.warn(`   ⚠️ Session ${session.id} references non-existent user ${session.userId}`);
      }
    }
    console.log(`   ✅ Session relationships checked`);
    
    console.log('\n🎉 Data integrity test completed successfully!');
    return true;
    
  } catch (error) {
    console.error('\n❌ Data integrity test failed:', error.message);
    return false;
  }
}

/**
 * Performance test
 */
async function testPerformance() {
  console.log('\n⚡ Testing performance...\n');
  
  try {
    // Test query performance
    const startTime = Date.now();
    
    await Promise.all([
      db.user.count(),
      db.property.count(),
      db.pageContent.count(),
      db.siteSettings.count(),
      db.session.count(),
      db.loginAttempt.count()
    ]);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`   ✅ Parallel queries completed in ${duration}ms`);
    
    if (duration > 5000) {
      console.warn(`   ⚠️ Performance warning: Queries took ${duration}ms (>5s)`);
    }
    
    // Test large query
    const queryStart = Date.now();
    const allProperties = await db.property.findMany();
    const queryEnd = Date.now();
    const queryDuration = queryEnd - queryStart;
    
    console.log(`   ✅ Property query (${allProperties.length} records) completed in ${queryDuration}ms`);
    
    console.log('\n🎉 Performance test completed successfully!');
    return true;
    
  } catch (error) {
    console.error('\n❌ Performance test failed:', error.message);
    return false;
  }
}

/**
 * Main test function
 */
async function runFullTest() {
  console.log('🚀 Starting Cosmos DB Primary Database Test Suite\n');
  console.log('================================================\n');
  
  const results = {
    basicOperations: false,
    apiOperations: false,
    dataIntegrity: false,
    performance: false
  };
  
  try {
    results.basicOperations = await testBasicOperations();
    results.apiOperations = await testAPIOperations();
    results.dataIntegrity = await testDataIntegrity();
    results.performance = await testPerformance();
    
    // Summary
    console.log('\n================================================');
    console.log('🏁 Test Suite Summary');
    console.log('================================================\n');
    
    const tests = [
      { name: 'Basic Operations', result: results.basicOperations },
      { name: 'API Operations', result: results.apiOperations },
      { name: 'Data Integrity', result: results.dataIntegrity },
      { name: 'Performance', result: results.performance }
    ];
    
    let allPassed = true;
    for (const test of tests) {
      const status = test.result ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} ${test.name}`);
      if (!test.result) allPassed = false;
    }
    
    console.log('\n================================================');
    if (allPassed) {
      console.log('🎉 ALL TESTS PASSED!');
      console.log('✅ Cosmos DB is working as primary database');
      console.log('✅ Your application is ready to use Cosmos DB');
    } else {
      console.log('❌ SOME TESTS FAILED');
      console.log('⚠️ Review the errors above before proceeding');
    }
    console.log('================================================\n');
    
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await db.$disconnect();
  }
}

// Run tests
runFullTest();