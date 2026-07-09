# 🚀 MenuGo Railway Database Setup Guide

This guide will help you set up your MenuGo database on Railway and automatically create all required tables.

## 📋 Your Railway Database Credentials

```
Host:     hayabusa.proxy.rlwy.net
Port:     45537
Username: root
Password: KbEWdlIgUugfGZeQgDxDDfyfkyHEPJpD
Database: menugo_db
```

## ⚡ Quick Start (Recommended Methods)

### Method 1: Windows Users - Double-Click Setup

Simply double-click this file from your project root:
```
setupRailway.bat
```

A command window will open and run the setup automatically. When it's done, press Enter to close.

### Method 2: macOS/Linux Users - Terminal Setup

Make the script executable and run:
```bash
chmod +x setupRailway.sh
./setupRailway.sh
```

Or simply:
```bash
bash setupRailway.sh
```

### Method 3: Using npm (All Platforms)

Navigate to the `menugo-backends` directory and run:
```bash
npm run setup:railway
```

## 🔧 What Gets Created

The setup script will automatically create:

### Core Tables (40+)
- ✅ Authentication (users, sessions, oauth)
- ✅ Restaurants (info, settings, subscriptions)
- ✅ Menu Management (items, categories, options)
- ✅ Orders (orders, items, tracking)
- ✅ Waiter Dashboard (waiters, shifts, performance)
- ✅ Kitchen Display (kitchen orders, metrics)
- ✅ Reviews & Ratings
- ✅ And more...

### Features
- Foreign key relationships
- Performance indexes
- Character set: UTF-8 MB4 (supports emojis)
- Ready for production use

## 📊 Setup Script Output

When you run the setup, you'll see:
```
🔧 Connecting to Railway database...
✅ Connected to Railway successfully!
📄 Reading database schema...
✅ Schema file loaded
🚀 Creating database and tables...
[1/500] Executing: DROP DATABASE IF EXISTS menugo_db;...
[2/500] Executing: CREATE DATABASE menugo_db...
...
✅ Database setup completed!
   ✓ Successful statements: 487
   ⚠️  Skipped statements: 13
   📊 Total statements: 500

📋 Verifying tables created...
✅ Successfully created 45 tables:
   1. users
   2. user_sessions
   3. restaurants
   ...
```

## 🔐 Security Notes

### Credentials Storage
The hardcoded credentials in `setupRailwayDatabase.js` are for quick setup. For production:

1. **Use environment variables instead:**
   ```bash
   npm run setup:railway:env
   ```

2. **Set these environment variables:**
   ```bash
   export DB_HOST=hayabusa.proxy.rlwy.net
   export DB_PORT=45537
   export DB_USER=root
   export DB_PASSWORD=your_password
   export DB_NAME=menugo_db
   ```

3. **Never commit passwords to git:**
   - Add `setupRailwayDatabase.js` to `.gitignore` if it contains real credentials
   - Use `.env` files with `dotenv` for local development

### Best Practices
- ✅ Use strong passwords for production
- ✅ Restrict network access to your app servers only
- ✅ Enable SSL/TLS connections when available
- ✅ Regularly backup your database
- ✅ Monitor Railway dashboard for unusual activity

## 🚨 Troubleshooting

### "Connection refused" or "ECONNREFUSED"
**Solution:**
1. Verify Railway database is running (check Railway dashboard)
2. Confirm credentials are correct
3. Check internet connection
4. Try pinging the host: `ping hayabusa.proxy.rlwy.net`

### "Access denied for user 'root'"
**Solution:**
1. Verify password is exactly: `KbEWdlIgUugfGZeQgDxDDfyfkyHEPJpD`
2. Check for extra spaces or special characters
3. Ensure you're using the correct host/port
4. Reset password in Railway dashboard if needed

### "Database already exists"
**This is not an error!** The script safely skips existing tables. You can run it multiple times.

### Tables not being created
**Debugging steps:**
1. Manually test connection:
   ```bash
   mysql -h hayabusa.proxy.rlwy.net -P 45537 -u root -p menugo_db
   ```
2. Check that the user has CREATE TABLE permissions
3. Verify database.sql file exists and is not corrupted
4. Check Node.js is properly installed: `node --version`

### Windows: "setupRailway.bat" doesn't work
**Alternative:**
```bash
cd menugo-backends
npm run setup:railway
```

### macOS/Linux: "Permission denied"
**Solution:**
```bash
chmod +x setupRailway.sh
./setupRailway.sh
```

## 📱 Verifying the Setup

After successful setup, verify your database:

### Using MySQL Client
```bash
mysql -h hayabusa.proxy.rlwy.net -P 45537 -u root -p menugo_db
> SHOW TABLES;
> SELECT COUNT(*) FROM users;
```

### Using Railway Dashboard
1. Log in to https://railway.app
2. Go to your project
3. Click on the MySQL database
4. View tables and data

### Using Your App
Configure your backend `.env`:
```env
DB_HOST=hayabusa.proxy.rlwy.net
DB_PORT=45537
DB_USER=root
DB_PASSWORD=KbEWdlIgUugfGZeQgDxDDfyfkyHEPJpD
DB_NAME=menugo_db
DB_DIALECT=mysql
NODE_ENV=production
```

Then start your backend:
```bash
npm start
```

## 📖 Additional Scripts

Once setup is complete, you can use these scripts:

```bash
# Seed database with sample data
npm run seed

# Create backups
npm run backup

# Run migrations
npm run migrate

# View backup list
npm run backup:list
```

## 🆘 Getting Help

If you encounter issues:

1. **Check Railway Status:**
   - Visit https://railway.app/dashboard
   - Ensure database is running

2. **Review Logs:**
   - Check the setup script output
   - Look for specific error messages

3. **Database Manual Check:**
   - Use a MySQL client to test connection
   - Verify credentials work before running setup

4. **Node.js Verification:**
   ```bash
   node --version
   npm --version
   npm list mysql2
   ```

## ✅ You're All Set!

Once setup completes successfully:
1. ✅ All 45+ tables are created
2. ✅ Your database is ready for use
3. ✅ You can now configure your backend
4. ✅ Connect your frontend to the API

**Next Steps:**
- Configure backend environment variables
- Start your backend server: `npm run dev`
- Deploy to Railway or your preferred hosting
- Connect your frontend to the backend API

---

**Need more help?**
- View README: `scripts/RAILWAY_SETUP_README.md`
- Check database schema: `database.sql`
- View script logs: Run setup again and check output
