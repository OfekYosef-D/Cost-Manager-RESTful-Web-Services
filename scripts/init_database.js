// Database initialization script - seeds initial user data
const path = require('path');
const DatabaseConnector = require('../shared/database-connector');
const Users = require('../users_service/models/users.model');
const { initialUser } = require('../config/identity');

// Load environment variables (prefer service-level, fallback to root)
require('dotenv').config({ path: path.join(__dirname, '../users_service/.env') });
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function initializeDatabase() {
  const dbManager = new DatabaseConnector(process.env.MONGODB_URI, {
    maxRetries: 3,
    retryDelay: 2000
  });

  try {
    // Establish connection
    await dbManager.establishConnection();
    
    // Wait for connection to stabilize
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if initial user already exists
    const existingUserRecord = await Users.findOne({ id: initialUser.id });
    
    if (existingUserRecord) {
      console.log('Initial user already exists in database');
      await dbManager.closeConnection();
      return;
    }

    // Create initial user
    const newUserRecord = new Users({
      id: initialUser.id,
      first_name: initialUser.first_name,
      last_name: initialUser.last_name,
      birthday: new Date(initialUser.birthday)
    });

    await newUserRecord.save();
    console.log('Initial user created successfully');
    
    // Close connection
    await dbManager.closeConnection();
  } catch (initError) {
    console.error('Database initialization failed:', initError);
    process.exit(1);
  }
}

// Execute initialization
initializeDatabase();
