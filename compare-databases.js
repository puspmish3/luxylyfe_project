// Compare MongoDB Atlas and Cosmos DB collection counts & sample docs
// Requires two env vars: ATLAS_URL and COSMOS_URL (MongoDB connection strings)

const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function compare() {
  const atlasUrl = process.env.ATLAS_URL || process.env.ATLAS_CONNECTION_STRING;
  const cosmosUrl = process.env.COSMOS_URL || process.env.COSMOS_CONNECTION_STRING;

  if (!atlasUrl || !cosmosUrl) {
    console.error('❌ Missing ATLAS_URL or COSMOS_URL in environment (.env.local)');
    console.log('\nAdd lines like:');
    console.log('ATLAS_URL="mongodb+srv://user:pass@cluster.mongodb.net/luxylyfe_db"');
    console.log('COSMOS_URL="mongodb://acct:key@acct.mongo.cosmos.azure.com:10255/luxylyfe_db?ssl=true&replicaSet=globaldb&retrywrites=false"');
    process.exit(1);
  }

  console.log('🔍 Comparing Atlas vs Cosmos DB');
  console.log('================================\n');

  const atlasClient = new MongoClient(atlasUrl, { serverSelectionTimeoutMS: 8000 });
  const cosmosClient = new MongoClient(cosmosUrl, { serverSelectionTimeoutMS: 8000 });

  try {
    await atlasClient.connect();
    await cosmosClient.connect();
    console.log('✅ Connected to both databases');

    const dbName = (new URL(atlasUrl)).pathname.replace('/', '') || 'luxylyfe_db';
    const atlasDb = atlasClient.db(dbName);
    const cosmosDb = cosmosClient.db(dbName);

    const collections = ['User', 'Property', 'PageContent', 'SiteSettings'];

    const results = [];
    for (const col of collections) {
      const [atlasCount, cosmosCount, atlasSample, cosmosSample] = await Promise.all([
        atlasDb.collection(col).countDocuments().catch(() => -1),
        cosmosDb.collection(col).countDocuments().catch(() => -1),
        atlasDb.collection(col).find({}).limit(1).toArray().catch(() => []),
        cosmosDb.collection(col).find({}).limit(1).toArray().catch(() => [])
      ]);

      results.push({
        collection: col,
        atlasCount,
        cosmosCount,
        match: atlasCount === cosmosCount && atlasCount !== -1,
        sampleIdAtlas: atlasSample[0]?._id,
        sampleIdCosmos: cosmosSample[0]?._id
      });
    }

    console.log('\n📊 Collection Counts:');
    results.forEach(r => {
      const status = r.match ? '✅' : '⚠️';
      console.log(`${status} ${r.collection}: Atlas=${r.atlasCount} Cosmos=${r.cosmosCount}`);
    });

    const mismatches = results.filter(r => !r.match);
    if (mismatches.length) {
      console.log('\n⚠️ Mismatched collections:');
      mismatches.forEach(m => console.log(` - ${m.collection} (Atlas ${m.atlasCount} vs Cosmos ${m.cosmosCount})`));
    } else {
      console.log('\n🎉 All collection counts match');
    }

    console.log('\n🧪 Field Presence Check (first document each)');
    for (const col of collections) {
      const atlasDoc = await atlasDb.collection(col).findOne();
      const cosmosDoc = await cosmosDb.collection(col).findOne();
      if (!atlasDoc || !cosmosDoc) {
        console.log(`- ${col}: Skipping (empty in one side)`);
        continue;
      }
      const atlasFields = Object.keys(atlasDoc).sort();
      const cosmosFields = Object.keys(cosmosDoc).sort();
      const missingInCosmos = atlasFields.filter(f => !cosmosFields.includes(f));
      const extraInCosmos = cosmosFields.filter(f => !atlasFields.includes(f));
      if (!missingInCosmos.length && !extraInCosmos.length) {
        console.log(`- ${col}: ✅ Field sets match (${atlasFields.length} fields)`);
      } else {
        console.log(`- ${col}: ⚠️ Field differences`);
        if (missingInCosmos.length) console.log(`   Missing in Cosmos: ${missingInCosmos.join(', ')}`);
        if (extraInCosmos.length) console.log(`   Extra in Cosmos: ${extraInCosmos.join(', ')}`);
      }
    }

    console.log('\n✅ Comparison complete');
    console.log('\nNext steps:');
    console.log('1. If mismatches exist, run: npm run db:sync:incremental');
    console.log('2. Re-run comparison until all counts match');
    console.log('3. Switch DATABASE_URL to Cosmos when ready');
  } catch (e) {
    console.error('❌ Comparison failed:', e.message);
  } finally {
    await atlasClient.close();
    await cosmosClient.close();
  }
}

compare();
