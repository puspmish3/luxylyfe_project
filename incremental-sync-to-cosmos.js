// Incremental sync new/updated docs from Atlas -> Cosmos using updatedAt (and createdAt fallback)
// Requires env: ATLAS_URL, COSMOS_URL

const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function incrementalSync() {
  const atlasUrl = process.env.ATLAS_URL || process.env.ATLAS_CONNECTION_STRING;
  const cosmosUrl = process.env.COSMOS_URL || process.env.COSMOS_CONNECTION_STRING;
  if (!atlasUrl || !cosmosUrl) {
    console.error('❌ Missing ATLAS_URL or COSMOS_URL in environment');
    process.exit(1);
  }

  const sinceArg = process.argv.find(a => a.startsWith('--since='));
  const since = sinceArg ? new Date(sinceArg.split('=')[1]) : null;
  if (sinceArg && isNaN(since.getTime())) {
    console.error('❌ Invalid --since value. Use ISO date e.g. --since=2025-09-01T00:00:00Z');
    process.exit(1);
  }

  console.log('🔄 Incremental Sync Atlas -> Cosmos');
  console.log('=================================');
  console.log(`Source: Atlas`);
  console.log(`Target: Cosmos DB`);
  if (since) console.log(`Filtering updated docs since: ${since.toISOString()}`);

  const atlasClient = new MongoClient(atlasUrl);
  const cosmosClient = new MongoClient(cosmosUrl);

  const collections = [
    { name: 'User', dateFields: ['updatedAt', 'createdAt'] },
    { name: 'Property', dateFields: ['updatedAt', 'createdAt'] },
    { name: 'PageContent', dateFields: ['updatedAt', 'createdAt'] },
    { name: 'SiteSettings', dateFields: ['updatedAt', 'createdAt'] }
  ];

  try {
    await atlasClient.connect();
    await cosmosClient.connect();
    const dbName = (new URL(atlasUrl)).pathname.replace('/', '') || 'luxylyfe_db';
    const atlasDb = atlasClient.db(dbName);
    const cosmosDb = cosmosClient.db(dbName);

    for (const col of collections) {
      console.log(`\n📁 Collection: ${col.name}`);
      const filter = since ? { $or: col.dateFields.map(f => ({ [f]: { $gte: since } })) } : {};
      const docs = await atlasDb.collection(col.name).find(filter).toArray();
      if (!docs.length) {
        console.log('   No new/updated docs to sync');
        continue;
      }
      let upserts = 0;
      for (const doc of docs) {
        const id = doc._id;
        // Clean any forbidden fields if necessary
        await cosmosDb.collection(col.name).updateOne(
          { _id: id },
          { $set: doc },
          { upsert: true }
        );
        upserts++;
      }
      console.log(`   Upserted ${upserts} document(s)`);
    }

    console.log('\n✅ Incremental sync complete');
    console.log('Run `npm run db:compare` to verify');
  } catch (e) {
    console.error('❌ Incremental sync failed:', e.message);
  } finally {
    await atlasClient.close();
    await cosmosClient.close();
  }
}

incrementalSync();
