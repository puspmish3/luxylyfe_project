/**
 * Quick API Test - Check if Cosmos DB APIs are working
 */

const fetch = require('node-fetch');

async function quickAPITest() {
  console.log('🚀 Testing Cosmos DB APIs...\n');
  
  const baseUrl = 'http://localhost:3000';
  
  try {
    // Test 1: Properties API
    console.log('1. Testing Properties API...');
    const propertiesResponse = await fetch(`${baseUrl}/api/properties`);
    console.log(`   Status: ${propertiesResponse.status}`);
    
    if (propertiesResponse.status === 200) {
      const propertiesData = await propertiesResponse.json();
      console.log(`   ✅ Properties API working - found ${propertiesData.properties?.length || 0} properties`);
    } else {
      const errorText = await propertiesResponse.text();
      console.log(`   ❌ Properties API failed: ${errorText}`);
    }
    
    // Test 2: Content API
    console.log('\n2. Testing Content API...');
    const contentResponse = await fetch(`${baseUrl}/api/content?pageType=HOME`);
    console.log(`   Status: ${contentResponse.status}`);
    
    if (contentResponse.status === 200) {
      const contentData = await contentResponse.json();
      console.log(`   ✅ Content API working - found ${contentData.content?.length || 0} content sections`);
    } else {
      const errorText = await contentResponse.text();
      console.log(`   ❌ Content API failed: ${errorText}`);
    }
    
    // Test 3: Database Status API
    console.log('\n3. Testing Database Status API...');
    const dbStatusResponse = await fetch(`${baseUrl}/api/database-status`);
    console.log(`   Status: ${dbStatusResponse.status}`);
    
    if (dbStatusResponse.status === 200) {
      const dbStatusData = await dbStatusResponse.json();
      console.log(`   ✅ Database Status API working`);
      console.log(`   📊 Cosmos DB Status: ${dbStatusData.databases?.cosmos?.status || 'unknown'}`);
      console.log(`   📊 Cosmos Users: ${dbStatusData.databases?.cosmos?.userCount || 0}`);
      console.log(`   📊 Cosmos Properties: ${dbStatusData.databases?.cosmos?.propertyCount || 0}`);
    } else {
      const errorText = await dbStatusResponse.text();
      console.log(`   ❌ Database Status API failed: ${errorText}`);
    }
    
    console.log('\n🎉 API tests completed!');
    
  } catch (error) {
    console.error('\n❌ API test failed:', error.message);
  }
}

quickAPITest();