import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/userSchema.js';

dotenv.config({ path: '.env' });

async function checkUsers() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check for users with name "Bhupathi"
    const usersWithName = await User.find({ name: "Bhupathi" });
    console.log(`\n🔍 Found ${usersWithName.length} users with name "Bhupathi":`);
    
    usersWithName.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user._id}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log('   ---');
    });

    // Check database indexes
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    console.log('\n📋 Current database indexes:');
    const indexes = await usersCollection.listIndexes().toArray();
    indexes.forEach((index, i) => {
      console.log(`${i + 1}. ${index.name}:`, JSON.stringify(index.key), index.unique ? '(UNIQUE)' : '');
    });

    // Check if name index still exists
    const nameIndex = indexes.find(index => 
      index.key && index.key.name === 1 && index.unique === true
    );

    if (nameIndex) {
      console.log('\n❌ PROBLEM: Unique index on name field still exists!');
      console.log('   This is causing the duplicate name error.');
      console.log('   You need to remove this index.');
    } else {
      console.log('\n✅ Good: No unique index on name field found.');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

checkUsers();
