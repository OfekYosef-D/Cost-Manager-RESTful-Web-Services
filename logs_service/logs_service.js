// Logs service: provides log retrieval and querying endpoints
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { createLogger } = require('../shared/logger-factory');
const MiddlewareBuilder = require('../shared/middleware-builder');
const path = require('path');
const { handleServiceError } = require('../shared/error-handler');
const Logs = require('./models/logs.model');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const server = express();
// Use PORT from environment (for deployment) or fallback to service-specific port or default
const SERVER_PORT = process.env.PORT || process.env.LOGS_SERVICE_PORT || 3001;

// Initialize logger
const logger = createLogger(Logs, 'info');

// Configure request tracking middleware
const apiCallLogger = MiddlewareBuilder.create(logger).buildRequestTracker();

// Middleware configuration
server.use(cors());
server.use(express.json());
server.use(apiCallLogger);

// API Endpoints

// GET /api/logs - Retrieve all log entries sorted by time (newest first)
server.get('/api/logs', async (req, res) => {
  try {
    const allLogs = await Logs.find({}).sort({ time: -1 });
    res.json(allLogs);
  } catch (error) {
    const errorResponse = handleServiceError(logger, error, 'LOGS_FETCH_ERROR', 'Failed to fetch logs');
    res.status(errorResponse.statusCode).json(errorResponse.response);
  }
});

// Database connection helper
async function establishConnection() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// Initialize database connection
establishConnection();

// Start the service
server.listen(SERVER_PORT, () => {
  logger.info(`Logs service started on port ${SERVER_PORT}`);
  console.log(`Logs service running on port ${SERVER_PORT}`);
});
