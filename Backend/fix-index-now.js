import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

async function fixIndexNow() {
  try {
    console.log('🔧 Fixing database indexes...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('users');

    // Get all indexes
    const indexes = await collection.listIndexes().toArray();
    console.log('\n📋 Current indexes:');
    indexes.forEach(index => {
      console.log(`- ${index.name}: ${JSON.stringify(index.key)} ${index.unique ? '(UNIQUE)' : ''}`);
    });

    // Find and remove unique name index
    const nameIndex = indexes.find(index => 
      index.key && index.key.name === 1 && index.unique === true
    );

    if (nameIndex) {
      console.log(`\n🗑️ Removing unique index: ${nameIndex.name}`);
      await collection.dropIndex(nameIndex.name);
      console.log('✅ Successfully removed unique name index');
    } else {
      console.log('\n✅ No unique name index found - already fixed!');
    }

    // Verify final state
    const finalIndexes = await collection.listIndexes().toArray();
    console.log('\n📋 Final indexes:');
    finalIndexes.forEach(index => {
      console.log(`- ${index.name}: ${JSON.stringify(index.key)} ${index.unique ? '(UNIQUE)' : ''}`);
    });

    console.log('\n🎉 Database fix completed! You can now add users with duplicate names.');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

fixIndexNow();
