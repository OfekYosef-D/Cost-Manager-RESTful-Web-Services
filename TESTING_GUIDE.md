# Testing Guide

This guide provides comprehensive instructions for testing the Expense Management Microservices system both locally and in deployment environments.

## Local Testing

### Prerequisites

Before testing, ensure you have:
- Node.js (v14 or higher) installed
- MongoDB connection configured
- All dependencies installed
- Environment variables properly configured

### Step 1: Install Dependencies

Install root dependencies:
```bash
npm install
```

Install dependencies for each service:
```bash
cd logs_service && npm install && cd ..
cd users_service && npm install && cd ..
cd costs_service && npm install && cd ..
cd admin_service && npm install && cd ..
```

### Step 2: Configure Environment

1. Copy `env.template` to `.env` in the project root:
   ```bash
   cp env.template .env
   ```

2. Update the `.env` file:
   - Set `MONGODB_URI` with your MongoDB connection string
   - Configure initial user:
     - `INITIAL_USER_ID=123123`
     - `INITIAL_USER_FIRST_NAME=mosh`
     - `INITIAL_USER_LAST_NAME=israeli`
     - `INITIAL_USER_BIRTHDAY=1994-01-01`
   - Set `TEAM_MEMBERS_JSON` with team member information

### Step 3: Initialize Database

Clean and initialize the database:
```bash
npm run clean-db
```

This ensures the database contains only the initial user (id: 123123).

### Step 4: Start All Services

Open 4 separate terminal windows:

**Terminal 1 - Logs Service:**
```bash
npm run start:logs
```
Expected output: `Logs service running on port 3001`

**Terminal 2 - Users Service:**
```bash
npm run start:users
```
Expected output: `Users service running on port 3002`

**Terminal 3 - Costs Service:**
```bash
npm run start:costs
```
Expected output: `Costs service running on port 3003`

**Terminal 4 - Admin Service:**
```bash
npm run start:admin
```
Expected output: `Admin service running on port 3004`

### Step 5: Run Automated Tests

Execute the test suite:
```bash
npm test
```

All tests should pass successfully. The test suite includes:
- User management tests
- Cost entry tests
- Report generation tests
- Error handling tests
- Validation tests

### Step 6: Manual API Testing

#### Test Users Service

**List all users:**
```bash
curl http://localhost:3002/api/users
```

**Get specific user:**
```bash
curl http://localhost:3002/api/users/123123
```

**Add new user:**
```bash
curl -X POST http://localhost:3002/api/add \
  -H "Content-Type: application/json" \
  -d '{"id": 999999, "first_name": "Test", "last_name": "User", "birthday": "1995-05-15"}'
```

#### Test Costs Service

**Add cost entry:**
```bash
curl -X POST http://localhost:3003/api/add \
  -H "Content-Type: application/json" \
  -d '{"description": "Lunch", "category": "food", "userid": 123123, "sum": 45.5}'
```

**Get monthly report:**
```bash
curl "http://localhost:3003/api/report?id=123123&year=2025&month=1"
```

#### Test Admin Service

**Get team information:**
```bash
curl http://localhost:3004/api/about
```

#### Test Logs Service

**Get all logs:**
```bash
curl http://localhost:3001/api/logs
```

### Step 7: Verify Database State

Before submission, verify the database contains only the initial user:
```bash
npm run clean-db
```

This should output:
- Deleted cost entries
- Deleted log entries
- Deleted report entries
- Deleted users (except initial user)
- Initial user verified/created

## Deployment Testing

### Step 1: Deploy Services

Deploy all services to your hosting platform (Render, Railway, Heroku, etc.). Ensure:
- Environment variables are configured in the deployment platform
- MongoDB connection string is accessible
- All services are running and accessible

### Step 2: Test Deployed Endpoints

Replace `BASE_URL` with your deployment URL:

**Test Logs Service:**
```bash
curl https://your-service.onrender.com:3001/api/logs
```

**Test Users Service:**
```bash
curl https://your-service.onrender.com:3002/api/users
curl https://your-service.onrender.com:3002/api/users/123123
```

**Test Costs Service:**
```bash
curl "https://your-service.onrender.com:3003/api/report?id=123123&year=2025&month=1"
```

**Test Admin Service:**
```bash
curl https://your-service.onrender.com:3004/api/about
```

### Step 3: Submit Deployment URL

Fill out the Google Form at https://forms.gle/H31okSipL2nARKv28 with:
- Your deployment URL
- Ensure all services are accessible and functioning

## Common Issues and Solutions

### Issue: Services fail to start
**Solution:** 
- Verify MongoDB connection string is correct
- Check that ports are not already in use
- Ensure all dependencies are installed

### Issue: Tests fail
**Solution:**
- Ensure all 4 services are running
- Verify initial user ID matches `INITIAL_USER_ID` in `.env`
- Check database connection

### Issue: Database connection errors
**Solution:**
- Verify `MONGODB_URI` is correct
- Check network connectivity
- Ensure MongoDB instance is running

### Issue: Port already in use
**Solution:**
- Change port in `.env` file
- Or stop the process using the port

## Test Checklist

Before submission, verify:

- [ ] All dependencies installed
- [ ] Environment variables configured
- [ ] Database initialized with initial user (id: 123123)
- [ ] All 4 services start successfully
- [ ] All automated tests pass
- [ ] Manual API tests work correctly
- [ ] Database contains only initial user
- [ ] Deployment (if applicable) is accessible
- [ ] Google Form submitted with deployment URL
