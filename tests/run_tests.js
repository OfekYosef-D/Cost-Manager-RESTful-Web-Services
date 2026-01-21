// Integration test suite for all microservices
const request = require('supertest');
const { initialUser } = require('../config/identity');

// Service endpoint configuration
const LOGS_SERVICE_URL = process.env.LOGS_SERVICE_URL || 'http://localhost:3001';
const USERS_SERVICE_URL = process.env.USERS_SERVICE_URL || 'http://localhost:3002';
const COSTS_SERVICE_URL = process.env.COSTS_SERVICE_URL || 'http://localhost:3003';
const ADMIN_SERVICE_URL = process.env.ADMIN_SERVICE_URL || 'http://localhost:3004';

// Test execution tracker
let testsPassed = 0;
let testsFailed = 0;

// Test runner wrapper
async function executeTest(testName, testFunction) {
  try {
    await testFunction();
    console.log(`✓ ${testName}`);
    testsPassed++;
  } catch (testError) {
    console.error(`✗ ${testName}: ${testError.message}`);
    if (testError.response && testError.response.body) {
      console.error(`  Response: ${JSON.stringify(testError.response.body)}`);
    }
    testsFailed++;
  }
}

// Main test execution
async function runAllTests() {
  console.log('Starting integration tests...\n');

  const primaryUserId = initialUser.id;
  const nonExistentUserId = primaryUserId + 999999;

  // Users Service Tests
  await executeTest('GET /api/users - List all users', async () => {
    const response = await request(USERS_SERVICE_URL)
      .get('/api/users')
      .expect(200);
    
    if (!Array.isArray(response.body)) {
      throw new Error('Response should be an array');
    }
  });

  await executeTest(`GET /api/users/${primaryUserId} - Get specific user`, async () => {
    const response = await request(USERS_SERVICE_URL)
      .get(`/api/users/${primaryUserId}`)
      .expect(200);
    
    if (!response.body.id || !response.body.first_name || !response.body.last_name || response.body.total === undefined) {
      throw new Error('Response should include id, first_name, last_name, and total');
    }
  });

  await executeTest('POST /api/add - Add new user', async () => {
    const randomUserId = Math.floor(Math.random() * 1000000) + 100000;
    const newUserData = {
      id: randomUserId,
      first_name: 'Test',
      last_name: 'User',
      birthday: '1995-05-15'
    };

    const response = await request(USERS_SERVICE_URL)
      .post('/api/add')
      .send(newUserData)
      .expect(201);
    
    if (response.body.id !== newUserData.id || 
        response.body.first_name !== newUserData.first_name ||
        response.body.last_name !== newUserData.last_name) {
      throw new Error('Response should include all user fields');
    }
  });

  // Costs Service Tests
  await executeTest('POST /api/add - Add cost item', async () => {
    const newCostData = {
      description: 'Test cost',
      category: 'food',
      userid: primaryUserId,
      sum: 50.5
    };

    const response = await request(COSTS_SERVICE_URL)
      .post('/api/add')
      .send(newCostData)
      .expect(201);
    
    if (response.body.description !== newCostData.description) {
      throw new Error('Response should include the created cost');
    }
  });

  await executeTest('GET /api/report - Get monthly report', async () => {
    const currentDate = new Date();
    const reportYear = currentDate.getFullYear();
    const reportMonth = currentDate.getMonth() + 1;

    const response = await request(COSTS_SERVICE_URL)
      .get(`/api/report?id=${primaryUserId}&year=${reportYear}&month=${reportMonth}`)
      .expect(200);
    
    if (!response.body.userid || !response.body.year || !response.body.month || !Array.isArray(response.body.costs)) {
      throw new Error('Response should include userid, year, month, and costs array');
    }
  });

  // Admin Service Tests
  await executeTest('GET /api/about - Get developers team', async () => {
    const response = await request(ADMIN_SERVICE_URL)
      .get('/api/about')
      .expect(200);
    
    if (!Array.isArray(response.body)) {
      throw new Error('Response should be an array');
    }
  });

  // Logs Service Tests
  await executeTest('GET /api/logs - Get all logs', async () => {
    const response = await request(LOGS_SERVICE_URL)
      .get('/api/logs')
      .expect(200);
    
    if (!Array.isArray(response.body)) {
      throw new Error('Response should be an array');
    }
  });

  // Error Handling Tests
  await executeTest('GET /api/users/invalid - Error handling', async () => {
    const response = await request(USERS_SERVICE_URL)
      .get('/api/users/invalid')
      .expect(400);
    
    if (!response.body.id || !response.body.message) {
      throw new Error('Error response should include id and message');
    }
  });

  await executeTest('POST /api/add - Add user validation error', async () => {
    const response = await request(USERS_SERVICE_URL)
      .post('/api/add')
      .send({ id: 123 })
      .expect(400);
    
    if (!response.body.id || !response.body.message) {
      throw new Error('Error response should include id and message');
    }
  });

  await executeTest('POST /api/add - Add cost validation error', async () => {
    const response = await request(COSTS_SERVICE_URL)
      .post('/api/add')
      .send({
        description: 'Test',
        category: 'invalid',
        userid: primaryUserId,
        sum: 10
      })
      .expect(400);
    
    if (!response.body.id || !response.body.message) {
      throw new Error('Error response should include id and message');
    }
  });

  await executeTest('GET /api/report - Missing parameters error', async () => {
    const response = await request(COSTS_SERVICE_URL)
      .get('/api/report')
      .expect(400);
    
    if (!response.body.id || !response.body.message) {
      throw new Error('Error response should include id and message');
    }
  });

  await executeTest('GET /api/report - Invalid month error', async () => {
    const response = await request(COSTS_SERVICE_URL)
      .get(`/api/report?id=${primaryUserId}&year=2025&month=13`)
      .expect(400);
    
    if (!response.body.id || !response.body.message) {
      throw new Error('Error response should include id and message');
    }
  });

  await executeTest(`GET /api/users/${nonExistentUserId} - Non-existent user`, async () => {
    const response = await request(USERS_SERVICE_URL)
      .get(`/api/users/${nonExistentUserId}`)
      .expect(404);
    
    if (!response.body.id || !response.body.message) {
      throw new Error('Error response should include id and message');
    }
  });

  await executeTest('POST /api/add - Add cost with past date error', async () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 2);
    
    const response = await request(COSTS_SERVICE_URL)
      .post('/api/add')
      .send({
        description: 'Test',
        category: 'food',
        userid: primaryUserId,
        sum: 10,
        date: pastDate.toISOString()
      })
      .expect(400);
    
    if (!response.body.id || !response.body.message) {
      throw new Error('Error response should include id and message');
    }
  });

  // Print test summary
  console.log(`\nTest Summary:`);
  console.log(`Passed: ${testsPassed}`);
  console.log(`Failed: ${testsFailed}`);
  console.log(`Total: ${testsPassed + testsFailed}`);

  process.exit(testsFailed > 0 ? 1 : 0);
}

// Execute all tests
runAllTests();
