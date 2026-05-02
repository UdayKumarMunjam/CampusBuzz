import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

async function removeNameIndex() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // List all current indexes
    console.log('\n📋 Current indexes:');
    const indexes = await usersCollection.listIndexes().toArray();
    indexes.forEach((index, i) => {
      console.log(`${i + 1}. ${index.name}:`, JSON.stringify(index.key), index.unique ? '(UNIQUE)' : '');
    });

    // Check for name index
    const nameIndex = indexes.find(index => 
      index.key && index.key.name === 1
    );

    if (nameIndex) {
      console.log(`\n🔍 Found index on 'name' field: ${nameIndex.name}`);
      
      if (nameIndex.unique) {
        console.log('❌ This index is UNIQUE - removing it...');
        await usersCollection.dropIndex(nameIndex.name);
        console.log('✅ Successfully removed unique index on name field');
      } else {
        console.log('ℹ️ Index exists but is not unique - this is fine');
      }
    } else {
      console.log('\nℹ️ No index found on name field');
    }

    // Show final indexes
    console.log('\n📋 Final indexes:');
    const finalIndexes = await usersCollection.listIndexes().toArray();
    finalIndexes.forEach((index, i) => {
      console.log(`${i + 1}. ${index.name}:`, JSON.stringify(index.key), index.unique ? '(UNIQUE)' : '');
    });

    console.log('\n🎉 Database fix completed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

removeNameIndex();
