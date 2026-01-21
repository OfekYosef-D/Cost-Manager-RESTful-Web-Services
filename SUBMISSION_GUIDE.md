# Submission Guide

Complete step-by-step instructions for preparing and submitting your project according to the course requirements.

## Pre-Submission Checklist

Before starting the submission process, ensure:

- [ ] All code is complete and functional
- [ ] All tests pass successfully
- [ ] Database is clean (contains only initial user: id=123123, first_name=mosh, last_name=israeli)
- [ ] All services run without errors
- [ ] Project is deployed (if required)

## Step 1: Create Demonstration Video

### Requirements:
- **Length:** Up to 60 seconds
- **Content:** Show the project running and functioning
- **Upload:** YouTube as Unlisted video
- **Save:** Keep the video URL for the PDF

### Recommended Video Content:

1. **Opening (5 seconds):** Show all 4 services starting
2. **Add User (10 seconds):** Demonstrate adding a new user via API
3. **Add Cost (10 seconds):** Show adding an expense entry
4. **Generate Report (10 seconds):** Display monthly report generation
5. **API Endpoints (15 seconds):** Test various endpoints
6. **Run Tests (10 seconds):** Execute test suite showing all tests pass

### Upload to YouTube:

1. Record your screen showing the project in action
2. Upload to YouTube
3. Set visibility to **Unlisted**
4. Copy the video URL (you'll need it for the PDF)

## Step 2: Prepare Database for Submission

Before creating the ZIP file, ensure the database is in the correct state:

```bash
npm run clean-db
```

This will:
- Delete all cost entries
- Delete all log entries
- Delete all report entries
- Delete all users except the initial user (id: 123123)
- Verify/create the initial user: id=123123, first_name=mosh, last_name=israeli

## Step 3: Create ZIP File

### Important: Remove node_modules First!

**Windows PowerShell:**
```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item -Recurse -Force logs_service/node_modules
Remove-Item -Recurse -Force users_service/node_modules
Remove-Item -Recurse -Force costs_service/node_modules
Remove-Item -Recurse -Force admin_service/node_modules
```

**Windows Command Prompt:**
```cmd
rmdir /s /q node_modules
rmdir /s /q logs_service\node_modules
rmdir /s /q users_service\node_modules
rmdir /s /q costs_service\node_modules
rmdir /s /q admin_service\node_modules
```

**Linux/Mac:**
```bash
rm -rf node_modules
rm -rf logs_service/node_modules
rm -rf users_service/node_modules
rm -rf costs_service/node_modules
rm -rf admin_service/node_modules
```

### Create ZIP File:

**Windows PowerShell:**
```powershell
Compress-Archive -Path * -DestinationPath project_submission.zip -Force
```

**Or manually:**
1. Select all files and folders (except node_modules)
2. Right-click → Send to → Compressed (zipped) folder
3. Rename to `project_submission.zip`

### Files to Include:
- All `.js` source files
- All `package.json` files
- `README.md`
- `env.template`
- `config/` directory
- `scripts/` directory
- `tests/` directory
- `shared/` directory (if exists)
- All model files

### Files to Exclude:
- `node_modules/` (delete before zipping!)
- `.env` (never include!)
- `.git/` directory
- Log files
- Temporary files
- `*.log` files

## Step 4: Create PDF File

### File Naming:
- Format: `firstname_lastname.pdf` (lowercase only)
- Example: `ofek_yosef.pdf`
- Use the team manager's name

### PDF Structure:

#### Page 1: Team Information

```
Development Team Manager:
First Name: [Your First Name]
Last Name: [Your Last Name]

Team Members:
1. First Name: [Name] | Last Name: [Name] | ID: [ID] | Mobile: [Phone] | Email: [Email]
2. First Name: [Name] | Last Name: [Name] | ID: [ID] | Mobile: [Phone] | Email: [Email]

Video Link: [YouTube URL - make it clickable]

Collaborative Tools Summary (up to 100 words):
[Describe at least 2 collaborative tools used, such as:
- GitHub for version control and code collaboration
- Discord/Slack for team communication
- Trello/Asana for project management
- etc.]
```

#### Subsequent Pages: Source Code

For each code file, include:

```
=== File: [relative/path/to/file.js] ===

[Complete source code here - ensure lines are not broken]

=== End of File: [relative/path/to/file.js] ===
```

### Files to Include in PDF:

**Root Level:**
- `package.json`

**Configuration:**
- `config/identity.js`

**Scripts:**
- `scripts/init_database.js`
- `scripts/clean_database.js`

**Tests:**
- `tests/run_tests.js`

**Admin Service:**
- `admin_service/admin_service.js`
- `admin_service/package.json`
- `admin_service/models/logs.model.js`

**Costs Service:**
- `costs_service/costs_service.js`
- `costs_service/package.json`
- `costs_service/models/costs.model.js`
- `costs_service/models/reports.model.js`
- `costs_service/models/users.model.js`
- `costs_service/models/logs.model.js`

**Logs Service:**
- `logs_service/logs_service.js`
- `logs_service/package.json`
- `logs_service/models/logs.model.js`

**Users Service:**
- `users_service/users_service.js`
- `users_service/package.json`
- `users_service/models/users.model.js`
- `users_service/models/costs.model.js`
- `users_service/models/logs.model.js`

**Shared Modules:**
- `shared/database-connector.js`
- `shared/logger-factory.js`
- `shared/middleware-builder.js`
- `shared/error-handler.js`
- `shared/validators.js`

### Creating the PDF:

1. Open Microsoft Word or Google Docs
2. Copy all code files with their paths
3. Ensure:
   - Lines are NOT broken
   - Code is properly formatted
   - File paths are clearly marked
   - All code is included
4. Save as PDF
5. Verify filename is correct (lowercase, underscore, .pdf)

## Step 5: Upload to Moodle

### Files to Upload:

1. **`project_submission.zip`** - ZIP file of the project
2. **`ofek_yosef.pdf`** - PDF file with all code (use team manager's name)

### Important Notes:

- Upload files **separately** (not in a single ZIP!)
- Only the **team manager** should submit
- Submit **before the deadline** (treat deadline as 30 minutes earlier due to server time difference)
- Late submissions will NOT be accepted

### Upload Process:

1. Log in to Moodle
2. Navigate to the assignment submission box
3. Upload `project_submission.zip`
4. Upload `ofek_yosef.pdf` (separately)
5. Submit

## Step 6: Submit Deployment URL

Fill out the Google Form:
https://forms.gle/H31okSipL2nARKv28

Provide:
- Your deployment URL (where services are accessible)
- Ensure all services are running and testable

## Final Checklist

Before final submission, verify:

- [ ] Video created and uploaded to YouTube (Unlisted)
- [ ] Video URL saved for PDF
- [ ] Database cleaned (only initial user: id=123123)
- [ ] ZIP file created (without node_modules)
- [ ] PDF file created with:
  - [ ] Team information on first page
  - [ ] Video link (clickable)
  - [ ] Collaborative tools summary (100 words max)
  - [ ] All source code files
  - [ ] Correct filename (lowercase, underscore)
- [ ] Deployment URL submitted via Google Form
- [ ] Files uploaded to Moodle (separately)
- [ ] Submission completed before deadline

## Troubleshooting

### ZIP file too large:
- Ensure all `node_modules` folders are deleted
- Check for large log files
- Remove any unnecessary files

### PDF formatting issues:
- Use a monospace font for code
- Ensure lines don't wrap
- Check page breaks don't split code

### Submission errors:
- Verify file names are correct
- Check file sizes are within limits
- Ensure you're the team manager submitting

## Important Reminders

1. **Only the team manager submits** - other team members don't need to submit
2. **Deadline is 30 minutes earlier** - account for server time difference
3. **No late submissions** - submit well before deadline
4. **Database must be clean** - only initial user (id: 123123)
5. **Video must be Unlisted** - not private or public
6. **PDF filename must be lowercase** - with underscore, not spaces

Good luck with your submission!
