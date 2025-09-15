/**
 * MongoDB Atlas Data Backup Script
 * 
 * This script creates a backup of all data from MongoDB Atlas before migration
 * Exports data to JSON files for safety
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

// Create backup directory
const BACKUP_DIR = path.join(__dirname, 'mongodb-backup');

/**
 * Create backup directory if it doesn't exist
 */
async function createBackupDirectory() {
  try {
    await fs.mkdir(BACKUP_DIR, { recursive: true });
    console.log(`✅ Backup directory created: ${BACKUP_DIR}`);
  } catch (error) {
    console.error('❌ Failed to create backup directory:', error.message);
    throw error;
  }
}

/**
 * Backup a collection to JSON file
 */
async function backupCollection(collectionName, data) {
  try {
    const filename = `${collectionName}_backup_${new Date().toISOString().split('T')[0]}.json`;
    const filepath = path.join(BACKUP_DIR, filename);
    
    await fs.writeFile(filepath, JSON.stringify(data, null, 2));
    console.log(`✅ ${collectionName}: ${data.length} records backed up to ${filename}`);
    
    return { collection: collectionName, count: data.length, file: filename };
  } catch (error) {
    console.error(`❌ Failed to backup ${collectionName}:`, error.message);
    throw error;
  }
}

/**
 * Main backup function
 */
async function backupAllData() {
  console.log('💾 Starting MongoDB Atlas data backup...\n');
  
  const backupResults = [];
  
  try {
    await createBackupDirectory();
    
    // Backup all collections
    const collections = [
      { name: 'users', getData: () => prisma.user.findMany() },
      { name: 'sessions', getData: () => prisma.session.findMany() },
      { name: 'loginAttempts', getData: () => prisma.loginAttempt.findMany() },
      { name: 'properties', getData: () => prisma.property.findMany() },
      { name: 'pageContents', getData: () => prisma.pageContent.findMany() },
      { name: 'siteSettings', getData: () => prisma.siteSettings.findMany() }
    ];
    
    for (const collection of collections) {
      console.log(`📊 Backing up ${collection.name}...`);
      
      try {
        const data = await collection.getData();
        const result = await backupCollection(collection.name, data);
        backupResults.push(result);
      } catch (error) {
        console.error(`❌ Failed to backup ${collection.name}:`, error.message);
        backupResults.push({ 
          collection: collection.name, 
          error: error.message 
        });
      }
    }
    
    // Create summary file
    const summary = {
      backupDate: new Date().toISOString(),
      totalCollections: collections.length,
      successfulBackups: backupResults.filter(r => !r.error).length,
      failedBackups: backupResults.filter(r => r.error).length,
      results: backupResults
    };
    
    await fs.writeFile(
      path.join(BACKUP_DIR, 'backup_summary.json'),
      JSON.stringify(summary, null, 2)
    );
    
    // Display results
    console.log('\n📋 Backup Summary:');
    console.log('==================');
    
    let totalRecords = 0;
    for (const result of backupResults) {
      if (result.error) {
        console.log(`❌ ${result.collection.padEnd(15)} | FAILED: ${result.error}`);
      } else {
        console.log(`✅ ${result.collection.padEnd(15)} | ${result.count} records → ${result.file}`);
        totalRecords += result.count;
      }
    }
    
    console.log('==================');
    console.log(`📊 Total: ${totalRecords} records backed up`);
    console.log(`💾 Backup location: ${BACKUP_DIR}`);
    
    if (summary.failedBackups === 0) {
      console.log('\n🎉 Backup completed successfully!');
      console.log('✅ Safe to proceed with migration');
    } else {
      console.log(`\n⚠️ Backup completed with ${summary.failedBackups} failures`);
      console.log('⚠️ Review errors before proceeding with migration');
    }
    
  } catch (error) {
    console.error('\n❌ Backup failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// Run backup
backupAllData();