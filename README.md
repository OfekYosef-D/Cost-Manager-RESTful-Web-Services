# Expense Management Microservices

A distributed microservices architecture built with Node.js for managing user profiles, expense tracking, application logging, and administrative metadata.

## Architecture Overview

The system consists of four independent microservices:

- **Logs Service** - Application logging and log retrieval (port 3001)
- **Users Service** - User profile management and cost aggregation (port 3002)
- **Costs Service** - Expense entry management and monthly reporting (port 3003)
- **Admin Service** - Team metadata and administrative information (port 3004)

## System Requirements

- Node.js version 14 or higher
- MongoDB (Atlas or local instance)
- npm package manager

## Installation and Setup

### Step 1: Install Dependencies

Install root-level dependencies:
```bash
npm install
```

Install service-specific dependencies:
```bash
cd logs_service && npm install && cd ..
cd users_service && npm install && cd ..
cd costs_service && npm install && cd ..
cd admin_service && npm install && cd ..
```

### Step 2: Environment Configuration

1. Copy the environment template:
   ```bash
   cp env.template .env
   ```

2. Update the `.env` file with your configuration:
   - Set `MONGODB_URI` to your MongoDB connection string
   - Configure `INITIAL_USER_*` variables for the default user
   - Set `TEAM_MEMBERS_JSON` with team member information
   - Adjust service ports if needed (defaults provided)

### Step 3: Database Initialization

Initialize the database with the default user:
```bash
npm run init-db
```

### Step 4: Start Services

Launch each service in a separate terminal window:

**Terminal 1 - Logs Service:**
```bash
npm run start:logs
```

**Terminal 2 - Users Service:**
```bash
npm run start:users
```

**Terminal 3 - Costs Service:**
```bash
npm run start:costs
```

**Terminal 4 - Admin Service:**
```bash
npm run start:admin
```

## Environment Variables Reference

### Required Variables

- `MONGODB_URI` - Complete MongoDB connection string

### User Configuration

- `INITIAL_USER_ID` - Numeric identifier for the default user
- `INITIAL_USER_FIRST_NAME` - First name of the default user
- `INITIAL_USER_LAST_NAME` - Last name of the default user
- `INITIAL_USER_BIRTHDAY` - Birth date in ISO format (YYYY-MM-DD)

### Team Configuration

- `TEAM_MEMBERS_JSON` - JSON array containing team member objects with `first_name` and `last_name` fields

### Service Ports (Optional)

- `LOGS_SERVICE_PORT` - Default: 3001
- `USERS_SERVICE_PORT` - Default: 3002
- `COSTS_SERVICE_PORT` - Default: 3003
- `ADMIN_SERVICE_PORT` - Default: 3004

### Testing Configuration (Optional)

- `LOGS_SERVICE_URL` - Base URL for logs service in tests
- `USERS_SERVICE_URL` - Base URL for users service in tests
- `COSTS_SERVICE_URL` - Base URL for costs service in tests
- `ADMIN_SERVICE_URL` - Base URL for admin service in tests

## API Documentation

### Users Service (Port 3002)

#### Retrieve All Users
```
GET /api/users
```

Returns an array of all user records.

#### Get User Details
```
GET /api/users/:id
```

Returns user information including aggregated total expenses.

**Example Request:**
```
GET http://localhost:3002/api/users/123123
```

**Example Response:**
```json
{
  "id": 123123,
  "first_name": "mosh",
  "last_name": "israeli",
  "total": 150.5
}
```

#### Create New User
```
POST /api/add
```

**Request Body:**
```json
{
  "id": 123456,
  "first_name": "John",
  "last_name": "Doe",
  "birthday": "1995-05-15"
}
```

### Costs Service (Port 3003)

#### Add Expense Entry
```
POST /api/add
```

**Request Body:**
```json
{
  "description": "Grocery shopping",
  "category": "food",
  "userid": 123123,
  "sum": 85.50
}
```

**Valid Categories:** `food`, `health`, `housing`, `sports`, `education`

#### Get Monthly Report
```
GET /api/report?id=USER_ID&year=YEAR&month=MONTH
```

**Example Request:**
```
GET http://localhost:3003/api/report?id=123123&year=2025&month=1
```

**Example Response:**
```json
{
  "userid": 123123,
  "year": 2025,
  "month": 1,
  "costs": [
    { "food": [ { "sum": 12, "description": "snack", "day": 17 } ] },
    { "education": [ { "sum": 82, "description": "book", "day": 10 } ] },
    { "health": [] },
    { "housing": [] },
    { "sports": [] }
  ]
}
```

### Admin Service (Port 3004)

#### Get Team Information
```
GET /api/about
```

Returns team members configured via `TEAM_MEMBERS_JSON`.

**Example Response:**
```json
[
  {
    "first_name": "Ofek",
    "last_name": "Yosef"
  },
  {
    "first_name": "Sharon",
    "last_name": "Barshishat"
  }
]
```

### Logs Service (Port 3001)

#### Retrieve All Logs
```
GET /api/logs
```

Returns all application log entries sorted by time (newest first).

## Testing

Execute the test suite:
```bash
npm test
```

**Important:** Ensure all four services are running before executing tests. The test suite relies on the initial user ID configured in `INITIAL_USER_ID`.

## Database Management

### Initialize Database
```bash
npm run init-db
```

Creates the initial user based on `INITIAL_USER_*` environment variables.

### Clean Database
```bash
npm run clean-db
```

Removes all data except the initial user, resetting the database to its default state.

## Key Features

- **Microservices Architecture** - Independent services for scalability and maintainability
- **Report Caching** - Past monthly reports are cached for improved performance
- **Persistent Logging** - All application logs are stored in MongoDB using Pino
- **Input Validation** - Comprehensive validation with consistent error responses
- **RESTful Design** - Standard HTTP methods and status codes
- **Shared Modules** - Common functionality extracted to reusable modules

## Technology Stack

- **Runtime:** Node.js
- **Web Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Logging:** Pino
- **Testing:** Supertest
