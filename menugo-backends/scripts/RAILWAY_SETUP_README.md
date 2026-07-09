# Database Setup Scripts

This directory contains scripts for setting up and managing the MenuGo database.

## Railway Database Setup

### Quick Setup (Direct Credentials)

Use this for quick setup with direct credentials:

```bash
node scripts/setupRailwayDatabase.js
```

**Note:** This script has credentials hardcoded. For production, use the environment variable version instead.

### Setup with Environment Variables (Recommended)

For better security, use environment variables:

```bash
# Set environment variables
export DB_HOST=hayabusa.proxy.rlwy.net
export DB_PORT=45537
export DB_USER=root
export DB_PASSWORD=your_password_here
export DB_NAME=menugo_db

# Run setup
node scripts/setupRailwayDatabaseEnv.js
```

### Using npm scripts

Add these to your `package.json` scripts section:

```bash
npm run setup:railway
npm run setup:railway:env
```

## Railway Credentials

Your Railway database credentials:
- **Host:** hayabusa.proxy.rlwy.net
- **Port:** 45537
- **Username:** root
- **Password:** KbEWdlIgUugfGZeQgDxDDfyfkyHEPJpD
- **Database:** menugo_db

## What Gets Created

The setup script will create:
- 40+ tables for the MenuGo platform
- Foreign key relationships
- Indexes for performance
- Triggers and views (if defined in database.sql)

### Tables Created:
1. **Authentication:** users, user_sessions, oauth_providers
2. **Restaurants:** restaurants, restaurant_settings, restaurant_subscriptions
3. **Menu:** menu_items, menu_categories, menu_options
4. **Orders:** orders, order_items, order_tracking
5. **Waiter Management:** waiters, waiter_shifts, waiter_performance
6. **Kitchen:** kitchen_orders, kitchen_performance_metrics
7. **Reviews:** reviews, ratings
8. **And more...**

## Troubleshooting

### Connection Errors

If you get connection errors:
1. Verify the Railway database is running
2. Check that the host, port, and credentials are correct
3. Ensure your firewall allows outbound connections to Railway
4. Try connecting with a MySQL client first:
   ```bash
   mysql -h hayabusa.proxy.rlwy.net -P 45537 -u root -p
   ```

### Permission Errors

If you get "Access Denied":
1. Verify the password is correct
2. Check that the user has CREATE DATABASE/TABLE permissions
3. Verify you're connecting to the right host/port

### Already Exists Errors

These are not errors - the script skips them if tables already exist. This allows you to run the script multiple times safely.

## Other Database Scripts

- `seedDatabase.js` - Seeds the database with sample data
- `apply_migrations.js` - Applies database migrations
- `backupDatabase.js` - Creates database backups

## Support

For issues with Railway:
- Visit: https://railway.app
- Check your Railway dashboard for database status
- Ensure your plan supports the connections you're making
