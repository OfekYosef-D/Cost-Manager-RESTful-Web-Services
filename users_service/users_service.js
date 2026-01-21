// Users service: handles user profile management and cost aggregation
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { createLogger } = require('../shared/logger-factory');
const MiddlewareBuilder = require('../shared/middleware-builder');
const { handleServiceError } = require('../shared/error-handler');
const { validateNumericValue, validateRequiredFields, validateStringValue } = require('../shared/validators');
const path = require('path');
const Users = require('./models/users.model');
const Costs = require('./models/costs.model');
const Logs = require('./models/logs.model');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const server = express();
// Use PORT from environment (for deployment) or fallback to service-specific port or default
const SERVER_PORT = process.env.PORT || process.env.USERS_SERVICE_PORT || 3002;

// Create logger instance
const logger = createLogger(Logs, 'info');

// Build request tracking middleware
const httpRequestTracker = MiddlewareBuilder.create(logger).buildRequestTracker();

// Apply middleware
server.use(cors());
server.use(express.json());
server.use(httpRequestTracker);

// API Routes

// GET /api/users - Retrieve all users
server.get('/api/users', async (req, res) => {
  try {
    const allUsers = await Users.find({});
    res.json(allUsers);
  } catch (error) {
    const errorResponse = handleServiceError(logger, error, 'USERS_FETCH_ERROR', 'Failed to fetch users');
    res.status(errorResponse.statusCode).json(errorResponse.response);
  }
});

// GET /api/users/:id - Get user details with aggregated total costs
server.get('/api/users/:id', async (req, res) => {
  try {
    const userIdentifier = parseInt(req.params.id);

    // Validate user ID format
    const idValidation = validateNumericValue(userIdentifier, 'User ID');
    if (!idValidation.isValid) {
      return res.status(400).json(idValidation.error);
    }

    // Find user by ID
    const userRecord = await Users.findOne({ id: userIdentifier });

    if (!userRecord) {
      return res.status(404).json({
        id: 'USER_NOT_FOUND',
        message: 'User not found'
      });
    }

    // Aggregate total costs for the user using MongoDB aggregation
    const costAggregation = await Costs.aggregate([
      { $match: { userid: userIdentifier } },
      { $group: { _id: null, total: { $sum: '$sum' } } }
    ]);

    // Extract total from aggregation result or default to 0
    const totalCost = costAggregation.length > 0 ? costAggregation[0].total : 0;

    res.json({
      id: userRecord.id,
      first_name: userRecord.first_name,
      last_name: userRecord.last_name,
      total: totalCost
    });
  } catch (error) {
    const errorResponse = handleServiceError(logger, error, 'USER_FETCH_ERROR', 'Failed to fetch user details');
    res.status(errorResponse.statusCode).json(errorResponse.response);
  }
});

// POST /api/add - Create a new user
server.post('/api/add', async (req, res) => {
  try {
    const { id, first_name, last_name, birthday } = req.body;

    // Validate required fields
    const requiredFieldsCheck = validateRequiredFields(
      { id, first_name, last_name, birthday },
      ['id', 'first_name', 'last_name', 'birthday']
    );
    
    if (!requiredFieldsCheck.isValid) {
      return res.status(400).json(requiredFieldsCheck.error);
    }

    // Validate ID type
    if (typeof id !== 'number') {
      return res.status(400).json({
        id: 'INVALID_ID_TYPE',
        message: 'id must be a number'
      });
    }

    // Validate name fields
    const firstNameCheck = validateStringValue(first_name, 'first_name');
    const lastNameCheck = validateStringValue(last_name, 'last_name');
    
    if (!firstNameCheck.isValid) {
      return res.status(400).json(firstNameCheck.error);
    }
    
    if (!lastNameCheck.isValid) {
      return res.status(400).json(lastNameCheck.error);
    }

    // Check if user already exists
    const existingUserRecord = await Users.findOne({ id: id });
    if (existingUserRecord) {
      return res.status(400).json({
        id: 'USER_EXISTS',
        message: 'User with this id already exists'
      });
    }

    // Create new user
    const newUserRecord = new Users({
      id: id,
      first_name: firstNameCheck.value,
      last_name: lastNameCheck.value,
      birthday: new Date(birthday)
    });

    const savedUserRecord = await newUserRecord.save();

    res.status(201).json({
      id: savedUserRecord.id,
      first_name: savedUserRecord.first_name,
      last_name: savedUserRecord.last_name,
      birthday: savedUserRecord.birthday
    });
  } catch (error) {
    const errorResponse = handleServiceError(logger, error, 'USER_ADD_ERROR', 'Failed to add user');
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
  logger.info(`Users service started on port ${SERVER_PORT}`);
  console.log(`Users service running on port ${SERVER_PORT}`);
});
