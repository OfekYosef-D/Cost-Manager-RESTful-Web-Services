# מדריך Deployment - Final Project

## סדר פעולות מומלץ

### שלב 1: בחירת פלטפורמת Deployment

**אפשרויות מומלצות:**
1. **Render.com** (חינמי, קל לשימוש)
2. **Railway.app** (חינמי, קל לשימוש)
3. **Heroku** (חינמי עם מגבלות)
4. **Vercel** (חינמי, אבל פחות מתאים ל-Node.js עם MongoDB)
5. **DigitalOcean** / **AWS** / **Azure** (שירותים בתשלום)

**המלצה:** Render.com - הכי קל ומהיר להגדרה.

---

## שלב 2: הכנת הפרויקט ל-Deployment

### 2.1 ודא שיש לך `.env` עם הערכים הנכונים

```bash
# בדוק שיש לך קובץ .env עם:
MONGODB_URI=mongodb+srv://...
INITIAL_USER_ID=123123
INITIAL_USER_FIRST_NAME=mosh
INITIAL_USER_LAST_NAME=israeli
INITIAL_USER_BIRTHDAY=1994-01-01
TEAM_MEMBERS_JSON=[{"first_name":"Ofek","last_name":"Yosef"},{"first_name":"Sharon","last_name":"Barshishat"}]
```

### 2.2 ודא שה-database נקי

```bash
npm run clean-db
```

### 2.3 בדוק שהכל עובד מקומית

```bash
# פתח 4 טרמינלים והרץ:
npm run start:logs
npm run start:users
npm run start:costs
npm run start:admin

# בטרמינל נוסף:
npm test
```

---

## שלב 3: Deployment ב-Render.com

### 3.1 יצירת חשבון

1. היכנס ל-https://render.com
2. הירשם עם GitHub/GitLab/Bitbucket
3. חבר את ה-repository שלך

### 3.2 יצירת 4 Web Services

**לכל שירות (Logs, Users, Costs, Admin):**

1. לחץ על "New" → "Web Service"
2. בחר את ה-repository שלך
3. הגדר:
   - **Name**: `cost-manager-logs-service` (או users/costs/admin)
   - **Environment**: `Node`
   - **Build Command**: `npm install && cd logs_service && npm install`
   - **Start Command**: `cd logs_service && npm start`
   - **Plan**: Free

4. ב-Environment Variables, הוסף:
   ```
   MONGODB_URI=your_mongodb_uri
   INITIAL_USER_ID=123123
   INITIAL_USER_FIRST_NAME=mosh
   INITIAL_USER_LAST_NAME=israeli
   INITIAL_USER_BIRTHDAY=1994-01-01
   TEAM_MEMBERS_JSON=[{"first_name":"Ofek","last_name":"Yosef"},{"first_name":"Sharon","last_name":"Barshishat"}]
   LOGS_SERVICE_PORT=3001
   USERS_SERVICE_PORT=3002
   COSTS_SERVICE_PORT=3003
   ADMIN_SERVICE_PORT=3004
   ```

5. לחץ על "Create Web Service"

**חשוב:** צריך ליצור 4 שירותים נפרדים, אחד לכל service!

### 3.3 קבלת URLs

לאחר ה-deployment, כל שירות יקבל URL:
- `https://cost-manager-logs-service.onrender.com`
- `https://cost-manager-users-service.onrender.com`
- `https://cost-manager-costs-service.onrender.com`
- `https://cost-manager-admin-service.onrender.com`

---

## שלב 4: בדיקת Deployment

### 4.1 בדוק שכל השירותים עובדים

```bash
# בדוק כל endpoint:
curl https://cost-manager-admin-service.onrender.com/api/about
curl https://cost-manager-users-service.onrender.com/api/users
curl https://cost-manager-logs-service.onrender.com/api/logs
```

### 4.2 הרץ את test_project.py עם ה-URLs החדשים

```bash
# עדכן את ה-environment variables:
export LOGS_SERVICE_URL=https://cost-manager-logs-service.onrender.com
export USERS_SERVICE_URL=https://cost-manager-users-service.onrender.com
export COSTS_SERVICE_URL=https://cost-manager-costs-service.onrender.com
export ADMIN_SERVICE_URL=https://cost-manager-admin-service.onrender.com

# הרץ את הבדיקה:
python test_project.py
```

### 4.3 ודא שה-database נקי

```bash
# הרץ את clean_database.js מקומית (עם ה-MONGODB_URI שלך)
npm run clean-db
```

---

## שלב 5: מילוי טופס Google

1. היכנס ל: https://forms.gle/H31okSipL2nARKv28
2. מלא את 4 ה-URLs:
   - Logs Service URL
   - Users Service URL
   - Costs Service URL
   - Admin Service URL

---

## בעיות נפוצות ופתרונות

### בעיה: השירותים לא מתחילים

**פתרון:**
- בדוק שה-Build Command ו-Start Command נכונים
- בדוק שה-Environment Variables מוגדרים נכון
- בדוק את ה-Logs ב-Render dashboard

### בעיה: MongoDB connection error

**פתרון:**
- ודא שה-MONGODB_URI נכון
- ודא שה-MongoDB Atlas מאפשר connections מ-0.0.0.0/0 (כל IP)
- בדוק את ה-Network Access ב-MongoDB Atlas

### בעיה: השירותים "נרדמים" אחרי זמן

**פתרון:**
- זה נורמלי ב-Render.com (Free tier)
- השירותים יתעוררו אוטומטית כשמגיע request
- אפשר להוסיף uptime monitoring (UptimeRobot) כדי לשמור עליהם פעילים

### בעיה: Port conflicts

**פתרון:**
- ✅ הקוד כבר מעודכן להשתמש ב-`process.env.PORT` (עם fallback)
- Render.com מגדיר את ה-PORT אוטומטית, והקוד יתאים לזה

---

## הערות חשובות

1. **Free tier limitations:**
   - השירותים יכולים "לישון" אחרי 15 דקות של חוסר פעילות
   - זה יכול לגרום לעיכובים בבדיקות

2. **Environment Variables:**
   - אל תעלה את קובץ `.env` ל-Git!
   - השתמש ב-Environment Variables ב-Render

3. **Database:**
   - ודא שה-MongoDB Atlas מאפשר connections מכל IP
   - בדוק את ה-Network Access ב-MongoDB Atlas

4. **Testing:**
   - בדוק את כל ה-endpoints אחרי deployment
   - ודא שה-database נקי (רק המשתמש הראשוני)

---

## סדר פעולות סופי

1. ✅ הכנת הפרויקט (clean-db, test מקומי)
2. ✅ יצירת 4 Web Services ב-Render
3. ✅ הגדרת Environment Variables
4. ✅ בדיקת כל ה-endpoints
5. ✅ הרצת test_project.py עם ה-URLs החדשים
6. ✅ מילוי טופס Google עם ה-URLs
7. ✅ צילום סרטון (עם ה-URLs החדשים!)

---

**טיפ:** התחל עם שירות אחד (למשל Admin), בדוק שהוא עובד, ואז המשך לשאר.
