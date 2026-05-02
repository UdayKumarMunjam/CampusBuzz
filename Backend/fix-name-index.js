import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const fixNameIndex = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("MongoDB connected successfully");

    const db = mongoose.connection.db;
    const collection = db.collection('users');

    // Check existing indexes
    console.log("Checking existing indexes on users collection...");
    const indexes = await collection.indexes();
    console.log("Current indexes:", JSON.stringify(indexes, null, 2));

    // Check if there's a unique index on 'name' field
    const nameIndex = indexes.find(index => 
      index.key && index.key.name === 1 && index.unique === true
    );

    if (nameIndex) {
      console.log("Found unique index on 'name' field:", nameIndex);
      console.log("Dropping the unique index on 'name' field...");
      
      // Drop the unique index on name field
      await collection.dropIndex({ name: 1 });
      console.log("Successfully dropped unique index on 'name' field");
    } else {
      console.log("No unique index found on 'name' field");
    }

    // Verify indexes after potential drop
    console.log("\nFinal indexes after fix:");
    const finalIndexes = await collection.indexes();
    console.log(JSON.stringify(finalIndexes, null, 2));

    console.log("\n✅ Database index fix completed successfully!");
    
  } catch (error) {
    console.error("Error fixing database indexes:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Database connection closed");
  }
};

// Run the fix
fixNameIndex();
