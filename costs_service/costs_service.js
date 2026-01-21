// Costs service: manages cost entries and generates monthly reports
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { createLogger } = require('../shared/logger-factory');
const MiddlewareBuilder = require('../shared/middleware-builder');
const { handleServiceError } = require('../shared/error-handler');
const {
  validateRequiredFields,
  validateStringValue,
  validateEnumValue,
  validateNumericValue,
  validatePositiveNumber
} = require('../shared/validators');
const path = require('path');
const Costs = require('./models/costs.model');
const Reports = require('./models/reports.model');
const Users = require('./models/users.model');
const Logs = require('./models/logs.model');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const server = express();
// Use PORT from environment (for deployment) or fallback to service-specific port or default
const SERVER_PORT = process.env.PORT || process.env.COSTS_SERVICE_PORT || 3003;

// Initialize logger
const logger = createLogger(Logs, 'info');

// Build request tracking middleware
const apiCallLogger = MiddlewareBuilder.create(logger).buildRequestTracker();

// Apply middleware
server.use(cors());
server.use(express.json());
server.use(apiCallLogger);

// Validation functions
const VALID_CATEGORIES = ['food', 'health', 'housing', 'sports', 'education'];

function validateCostInput(data) {
  // Check required fields
  const requiredCheck = validateRequiredFields(data, ['description', 'category', 'userid', 'sum']);
  if (!requiredCheck.isValid) {
    return requiredCheck;
  }

  // Validate description
  const descCheck = validateStringValue(data.description, 'description');
  if (!descCheck.isValid) {
    return descCheck;
  }

  // Validate category
  const categoryCheck = validateEnumValue(data.category, VALID_CATEGORIES, 'category');
  if (!categoryCheck.isValid) {
    return categoryCheck;
  }

  // Validate userid
  if (typeof data.userid !== 'number') {
    return {
      isValid: false,
      error: {
        id: 'INVALID_USERID_TYPE',
        message: 'userid must be a number'
      }
    };
  }

  // Validate sum
  const sumCheck = validatePositiveNumber(data.sum, 'sum');
  if (!sumCheck.isValid) {
    return sumCheck;
  }

  return { isValid: true };
}

function validateReportParameters(queryParams) {
  const { id, year, month } = queryParams;

  // Check required parameters
  const requiredCheck = validateRequiredFields({ id, year, month }, ['id', 'year', 'month']);
  if (!requiredCheck.isValid) {
    return {
      isValid: false,
      error: {
        id: 'MISSING_PARAMETERS',
        message: 'Missing required parameters: id, year, month'
      }
    };
  }

  // Validate numeric values
  const userId = parseInt(id);
  const reportYear = parseInt(year);
  const reportMonth = parseInt(month);

  if (isNaN(userId) || isNaN(reportYear) || isNaN(reportMonth)) {
    return {
      isValid: false,
      error: {
        id: 'INVALID_PARAMETER_TYPE',
        message: 'id, year, and month must be numbers'
      }
    };
  }

  // Validate month range
  if (reportMonth < 1 || reportMonth > 12) {
    return {
      isValid: false,
      error: {
        id: 'INVALID_MONTH',
        message: 'month must be between 1 and 12'
      }
    };
  }

  return {
    isValid: true,
    userId,
    reportYear,
    reportMonth
  };
}

function isDateInPast(dateToCheck) {
  // Compare dates without time component to check if date is in the past
  const currentDate = new Date();
  const today = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
  const checkDateOnly = new Date(dateToCheck.getFullYear(), dateToCheck.getMonth(), dateToCheck.getDate());
  return checkDateOnly < today;
}

function generateReportData(costsList, userId, year, month) {
  // Category order matches the example format in requirements: food, education, health, housing, sports
  const categoryList = ['food', 'education', 'health', 'housing', 'sports'];
  const categorizedCosts = {};

  // Initialize all categories
  categoryList.forEach(cat => {
    categorizedCosts[cat] = [];
  });

  // Group costs by category
  costsList.forEach(costItem => {
    categorizedCosts[costItem.category].push({
      sum: costItem.sum,
      description: costItem.description,
      day: costItem.date.getDate()
    });
  });

  // Build response array
  const reportCostsArray = categoryList.map(category => {
    const categoryObject = {};
    categoryObject[category] = categorizedCosts[category];
    return categoryObject;
  });

  return {
    userid: userId,
    year: year,
    month: month,
    costs: reportCostsArray
  };
}

// API Endpoints

// POST /api/add - Create a new cost entry
// Handle both /api/add and /api/add/ for compatibility with test script
server.post('/api/add', async (req, res) => {
  try {
    const { description, category, userid, sum, date } = req.body;

    // Validate input
    const validationResult = validateCostInput({ description, category, userid, sum });
    if (!validationResult.isValid) {
      return res.status(400).json(validationResult.error);
    }

    // Verify user exists
    const userRecord = await Users.findOne({ id: userid });
    if (!userRecord) {
      return res.status(404).json({
        id: 'USER_NOT_FOUND',
        message: 'User not found'
      });
    }

    // Handle date validation
    const costEntryDate = date ? new Date(date) : new Date();
    
    if (isDateInPast(costEntryDate)) {
      return res.status(400).json({
        id: 'PAST_DATE_NOT_ALLOWED',
        message: 'Cannot add costs with dates in the past'
      });
    }

    // Create cost entry
    const newCostEntry = new Costs({
      description: description,
      category: category,
      userid: userid,
      sum: sum,
      date: costEntryDate
    });

    const savedCostEntry = await newCostEntry.save();

    // Invalidate cached reports for past months if needed
    const entryYear = costEntryDate.getFullYear();
    const entryMonth = costEntryDate.getMonth() + 1;
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    if (entryYear < currentYear || (entryYear === currentYear && entryMonth < currentMonth)) {
      await Reports.deleteOne({
        userid: userid,
        year: entryYear,
        month: entryMonth
      });
    }

    res.status(201).json({
      description: savedCostEntry.description,
      category: savedCostEntry.category,
      userid: savedCostEntry.userid,
      sum: savedCostEntry.sum,
      date: savedCostEntry.date
    });
  } catch (error) {
    const errorResponse = handleServiceError(logger, error, 'COST_ADD_ERROR', 'Failed to add cost');
    res.status(errorResponse.statusCode).json(errorResponse.response);
  }
});
server.post('/api/add/', async (req, res) => {
  try {
    const { description, category, userid, sum, date } = req.body;

    // Validate input
    const validationResult = validateCostInput({ description, category, userid, sum });
    if (!validationResult.isValid) {
      return res.status(400).json(validationResult.error);
    }

    // Verify user exists
    const userRecord = await Users.findOne({ id: userid });
    if (!userRecord) {
      return res.status(404).json({
        id: 'USER_NOT_FOUND',
        message: 'User not found'
      });
    }

    // Handle date validation
    const costEntryDate = date ? new Date(date) : new Date();
    
    if (isDateInPast(costEntryDate)) {
      return res.status(400).json({
        id: 'PAST_DATE_NOT_ALLOWED',
        message: 'Cannot add costs with dates in the past'
      });
    }

    // Create cost entry
    const newCostEntry = new Costs({
      description: description,
      category: category,
      userid: userid,
      sum: sum,
      date: costEntryDate
    });

    const savedCostEntry = await newCostEntry.save();

    // Invalidate cached reports for past months if needed
    const entryYear = costEntryDate.getFullYear();
    const entryMonth = costEntryDate.getMonth() + 1;
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    if (entryYear < currentYear || (entryYear === currentYear && entryMonth < currentMonth)) {
      await Reports.deleteOne({
        userid: userid,
        year: entryYear,
        month: entryMonth
      });
    }

    res.status(201).json({
      description: savedCostEntry.description,
      category: savedCostEntry.category,
      userid: savedCostEntry.userid,
      sum: savedCostEntry.sum,
      date: savedCostEntry.date
    });
  } catch (error) {
    const errorResponse = handleServiceError(logger, error, 'COST_ADD_ERROR', 'Failed to add cost');
    res.status(errorResponse.statusCode).json(errorResponse.response);
  }
});

// GET /api/report - Generate or retrieve monthly cost report
// Handle both /api/report and /api/report/ for compatibility with test script
server.get('/api/report', async (req, res) => {
  try {
    // Validate query parameters
    const paramValidation = validateReportParameters(req.query);
    if (!paramValidation.isValid) {
      return res.status(400).json(paramValidation.error);
    }

    const { userId, reportYear, reportMonth } = paramValidation;

    // Verify user exists
    const userRecord = await Users.findOne({ id: userId });
    if (!userRecord) {
      return res.status(404).json({
        id: 'USER_NOT_FOUND',
        message: 'User not found'
      });
    }

    // Computed: Caching mechanism for historical reports
    // Past months are cached in the Reports collection to improve performance
    // Future and current months are computed on-demand without caching
    // This approach ensures data accuracy for current/future periods while
    // optimizing retrieval speed for historical data that doesn't change
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const isHistoricalMonth = reportYear < currentYear || 
                             (reportYear === currentYear && reportMonth < currentMonth);

    // Try to retrieve cached report for past months
    if (isHistoricalMonth) {
      const cachedReportDoc = await Reports.findOne({
        userid: userId,
        year: reportYear,
        month: reportMonth
      });

      if (cachedReportDoc) {
        return res.json(cachedReportDoc.report);
      }
    }

    // Calculate date range for the report period
    const periodStart = new Date(reportYear, reportMonth - 1, 1);
    const periodEnd = new Date(reportYear, reportMonth, 0, 23, 59, 59, 999);

    // Fetch costs for the period
    const periodCosts = await Costs.find({
      userid: userId,
      date: {
        $gte: periodStart,
        $lte: periodEnd
      }
    }).sort({ date: 1 });

    // Generate report data
    const reportData = generateReportData(periodCosts, userId, reportYear, reportMonth);

    // Cache report for past months (non-blocking)
    if (isHistoricalMonth) {
      try {
        await Reports.findOneAndUpdate(
          {
            userid: userId,
            year: reportYear,
            month: reportMonth
          },
          {
            userid: userId,
            year: reportYear,
            month: reportMonth,
            report: reportData
          },
          {
            upsert: true,
            new: true
          }
        );
      } catch (cacheError) {
        logger.error({ error: cacheError.message }, 'Report caching failed');
      }
    }

    res.json(reportData);
  } catch (error) {
    const errorResponse = handleServiceError(logger, error, 'REPORT_GENERATION_ERROR', 'Failed to generate report');
    res.status(errorResponse.statusCode).json(errorResponse.response);
  }
});
server.get('/api/report/', async (req, res) => {
  try {
    // Validate query parameters
    const paramValidation = validateReportParameters(req.query);
    if (!paramValidation.isValid) {
      return res.status(400).json(paramValidation.error);
    }

    const { userId, reportYear, reportMonth } = paramValidation;

    // Verify user exists
    const userRecord = await Users.findOne({ id: userId });
    if (!userRecord) {
      return res.status(404).json({
        id: 'USER_NOT_FOUND',
        message: 'User not found'
      });
    }

    // Computed: Caching mechanism for historical reports
    // Past months are cached in the Reports collection to improve performance
    // Future and current months are computed on-demand without caching
    // This approach ensures data accuracy for current/future periods while
    // optimizing retrieval speed for historical data that doesn't change
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const isHistoricalMonth = reportYear < currentYear || 
                             (reportYear === currentYear && reportMonth < currentMonth);

    // Try to retrieve cached report for past months
    if (isHistoricalMonth) {
      const cachedReportDoc = await Reports.findOne({
        userid: userId,
        year: reportYear,
        month: reportMonth
      });

      if (cachedReportDoc) {
        return res.json(cachedReportDoc.report);
      }
    }

    // Calculate date range for the report period
    const periodStart = new Date(reportYear, reportMonth - 1, 1);
    const periodEnd = new Date(reportYear, reportMonth, 0, 23, 59, 59, 999);

    // Fetch costs for the period
    const periodCosts = await Costs.find({
      userid: userId,
      date: {
        $gte: periodStart,
        $lte: periodEnd
      }
    }).sort({ date: 1 });

    // Generate report data
    const reportData = generateReportData(periodCosts, userId, reportYear, reportMonth);

    // Cache report for past months (non-blocking)
    if (isHistoricalMonth) {
      try {
        await Reports.findOneAndUpdate(
          {
            userid: userId,
            year: reportYear,
            month: reportMonth
          },
          {
            userid: userId,
            year: reportYear,
            month: reportMonth,
            report: reportData
          },
          {
            upsert: true,
            new: true
          }
        );
      } catch (cacheError) {
        logger.error({ error: cacheError.message }, 'Report caching failed');
      }
    }

    res.json(reportData);
  } catch (error) {
    const errorResponse = handleServiceError(logger, error, 'REPORT_GENERATION_ERROR', 'Failed to generate report');
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
  logger.info(`Costs service started on port ${SERVER_PORT}`);
  console.log(`Costs service running on port ${SERVER_PORT}`);
});
