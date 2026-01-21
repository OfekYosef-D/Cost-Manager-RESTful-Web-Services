// Admin service: provides metadata and team information endpoints
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { createLogger } = require('../shared/logger-factory');
const MiddlewareBuilder = require('../shared/middleware-builder');
const { handleServiceError } = require('../shared/error-handler');
const path = require('path');
const Logs = require('./models/logs.model');
const { teamMembers } = require('../config/identity');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const server = express();
// Use PORT from environment (for deployment) or fallback to service-specific port or default
const SERVER_PORT = process.env.PORT || process.env.ADMIN_SERVICE_PORT || 3004;

// Create logger instance using factory
const logger = createLogger(Logs, 'info');

// Build request tracking middleware
const requestTracker = MiddlewareBuilder.create(logger).buildRequestTracker();

// Apply middleware
server.use(cors());
server.use(express.json());
server.use(requestTracker);

// API Routes

// GET /api/about - Returns team member information
// Handle both /api/about and /api/about/ for compatibility with test script
server.get('/api/about', async (req, res) => {
  try {
    res.json(teamMembers);
  } catch (error) {
    const errorResponse = handleServiceError(logger, error, 'ABOUT_FETCH_ERROR', 'Failed to fetch team information');
    res.status(errorResponse.statusCode).json(errorResponse.response);
  }
});
server.get('/api/about/', async (req, res) => {
  try {
    res.json(teamMembers);
  } catch (error) {
    const errorResponse = handleServiceError(logger, error, 'ABOUT_FETCH_ERROR', 'Failed to fetch team information');
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
  logger.info(`Admin service started on port ${SERVER_PORT}`);
  console.log(`Admin service running on port ${SERVER_PORT}`);
});
