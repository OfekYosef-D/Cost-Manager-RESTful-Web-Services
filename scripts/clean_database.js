// Database cleanup script - resets database to initial state
const mongoose = require('mongoose');
const path = require('path');
const { initialUser } = require('../config/identity');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../users_service/.env') });
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function resetDatabase() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Database connection established successfully');

    const dbInstance = mongoose.connection.db;

    // Delete all collections except users (which we'll handle separately)
    const costsDeleteResult = await dbInstance.collection('costs').deleteMany({});
    console.log(`Deleted ${costsDeleteResult.deletedCount} cost entries`);

    const logsDeleteResult = await dbInstance.collection('logs').deleteMany({});
    console.log(`Deleted ${logsDeleteResult.deletedCount} log entries`);

    const reportsDeleteResult = await dbInstance.collection('reports').deleteMany({});
    console.log(`Deleted ${reportsDeleteResult.deletedCount} report entries`);

    // Delete all users except the initial user
    const usersDeleteResult = await dbInstance.collection('users').deleteMany({ 
      id: { $ne: initialUser.id } 
    });
    console.log(`Deleted ${usersDeleteResult.deletedCount} users (kept initial user)`);

    // Ensure initial user exists
    const existingInitialUser = await dbInstance.collection('users').findOne({ id: initialUser.id });
    if (!existingInitialUser) {
      await dbInstance.collection('users').insertOne({
        id: initialUser.id,
        first_name: initialUser.first_name,
        last_name: initialUser.last_name,
        birthday: new Date(initialUser.birthday)
      });
      console.log('Initial user created');
    } else {
      console.log(`Initial user (id: ${initialUser.id}) verified`);
    }

    console.log('\nDatabase reset completed successfully!');
    console.log(`Database now contains only the initial user (id: ${initialUser.id})`);
    
    // Close connection
    await mongoose.connection.close();
  } catch (resetError) {
    console.error('Database reset failed:', resetError);
    process.exit(1);
  }
}

// Execute reset
resetDatabase();
