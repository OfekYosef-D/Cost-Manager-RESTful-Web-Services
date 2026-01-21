// Database connection manager using class-based approach with retry mechanism
const mongoose = require('mongoose');

class DatabaseConnector {
  constructor(connectionUri, options = {}) {
    this.connectionUri = connectionUri;
    this.maxRetries = options.maxRetries || 3;
    this.retryDelay = options.retryDelay || 2000;
    this.isConnected = false;
  }

  async establishConnection() {
    let attemptCount = 0;
    
    // Retry connection up to maxRetries times
    while (attemptCount < this.maxRetries) {
      try {
        // Attempt to connect with timeout settings
        await mongoose.connect(this.connectionUri, {
          serverSelectionTimeoutMS: 30000,
          socketTimeoutMS: 45000,
        });
        
        this.isConnected = true;
        console.log('Database connection established successfully');
        
        // Verify connection with ping to ensure it's actually working
        await mongoose.connection.db.admin().ping();
        console.log('Database connection verified');
        
        return true;
      } catch (connectionError) {
        attemptCount++;
        console.error(`Connection attempt ${attemptCount} failed:`, connectionError.message);
        
        // Exit if max retries reached
        if (attemptCount >= this.maxRetries) {
          console.error('Maximum retry attempts reached. Exiting...');
          process.exit(1);
        }
        
        // Wait before retrying to avoid immediate retry loops
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
      }
    }
    
    return false;
  }

  getConnectionStatus() {
    return mongoose.connection.readyState === 1;
  }

  async closeConnection() {
    if (this.isConnected) {
      await mongoose.connection.close();
      this.isConnected = false;
      console.log('Database connection closed');
    }
  }
}

module.exports = DatabaseConnector;
