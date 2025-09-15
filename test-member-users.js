/**
 * Test script to check if we have any member users in Cosmos DB
 */

const { CosmosClient } = require('@azure/cosmos');

async function testMemberUsers() {
  try {
    // Read environment variables
    require('dotenv').config({ path: '.env.local' });
    
    const endpoint = process.env.COSMOS_DB_ENDPOINT;
    const key = process.env.COSMOS_DB_KEY;
    const databaseName = process.env.COSMOS_DB_DATABASE_NAME || 'luxylyfe';
    
    if (!endpoint || !key) {
      console.error('❌ Missing Cosmos DB configuration');
      return;
    }
    
    console.log('🔍 Connecting to Cosmos DB...');
    const client = new CosmosClient({ endpoint, key });
    const database = client.database(databaseName);
    const container = database.container('users');
    
    // Query for MEMBER users
    const query = {
      query: "SELECT * FROM c WHERE c.role = @role",
      parameters: [
        { name: "@role", value: "MEMBER" }
      ]
    };
    
    console.log('🔍 Searching for MEMBER users...');
    const { resources: members } = await container.items.query(query).fetchAll();
    
    console.log(`\n📊 Found ${members.length} member users:`);
    
    if (members.length === 0) {
      console.log('❌ No MEMBER users found in database');
      console.log('💡 You may need to sign up a member first or check if existing users have the correct role');
      return;
    }
    
    members.forEach((member, index) => {
      console.log(`\n${index + 1}. Member User:`);
      console.log(`   📧 Email: ${member.email}`);
      console.log(`   🏷️  Role: ${member.role}`);
      console.log(`   👤 Name: ${member.name || 'Not set'}`);
      console.log(`   🆔 ID: ${member.id}`);
      console.log(`   📅 Created: ${member.createdAt || 'Unknown'}`);
      
      // Don't show password hash for security
      console.log(`   🔐 Password: ${member.password ? '[SET]' : '[NOT SET]'}`);
    });
    
    console.log('\n💡 You can test login with any of these email addresses');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testMemberUsers();