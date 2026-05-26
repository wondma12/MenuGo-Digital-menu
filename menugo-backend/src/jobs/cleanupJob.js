const { UserSession, Order, Restaurant, StaffActivityLog, SystemLog, User, MenuItem } = require('../models');
const fs = require('fs').promises;
const path = require('path');
const { logger } = require('../utils/logger');
const { Op } = require('sequelize');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// Cleanup expired sessions
const cleanupExpiredSessions = async () => {
  try {
    const result = await UserSession.destroy({
      where: {
        expires_at: { [Op.lt]: new Date() },
      },
    });
    
    logger.info(`Cleaned up ${result} expired user sessions`);
    return result;
  } catch (error) {
    logger.error('Error cleaning up expired sessions:', error);
    throw error;
  }
};

// Cleanup old logs (keep last 30 days)
const cleanupOldLogs = async () => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const result = await SystemLog.destroy({
      where: {
        created_at: { [Op.lt]: thirtyDaysAgo },
      },
    });
    
    const staffLogsResult = await StaffActivityLog.destroy({
      where: {
        created_at: { [Op.lt]: thirtyDaysAgo },
      },
    });
    
    logger.info(`Cleaned up ${result} system logs and ${staffLogsResult} staff activity logs`);
    return { systemLogs: result, staffLogs: staffLogsResult };
  } catch (error) {
    logger.error('Error cleaning up old logs:', error);
    throw error;
  }
};

// Cleanup temporary files
const cleanupTempFiles = async () => {
  try {
    const tempDir = path.join(__dirname, '../../uploads/temp');
    const files = await fs.readdir(tempDir);
    
    let deletedCount = 0;
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    
    for (const file of files) {
      const filePath = path.join(tempDir, file);
      const stats = await fs.stat(filePath);
      
      if (stats.mtimeMs < oneHourAgo) {
        await fs.unlink(filePath);
        deletedCount++;
      }
    }
    
    logger.info(`Cleaned up ${deletedCount} temporary files`);
    return deletedCount;
  } catch (error) {
    logger.error('Error cleaning up temp files:', error);
    throw error;
  }
};

// Cleanup soft-deleted records (older than 90 days)
const cleanupDeletedRecords = async () => {
  try {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    // Soft-deleted users: only permanently delete users who do NOT own any active restaurants
    const users = await User.findAll({ where: { deleted_at: { [Op.lt]: ninetyDaysAgo } } });
    let deletedUsers = 0;
    for (const u of users) {
      const ownedCount = await Restaurant.count({ where: { owner_id: u.id, deleted_at: null } });
      if (ownedCount === 0) {
        await User.destroy({ where: { id: u.id }, force: true }).catch(err => {
          logger.warn(`Failed to permanently delete user ${u.id}: ${err.message || err}`);
        });
        deletedUsers++;
      } else {
        logger.info(`Skipping permanent deletion of user ${u.id} because they own ${ownedCount} restaurant(s)`);
      }
    }

    // Cleanup soft-deleted restaurants (unchanged)
    const deletedRestaurants = await Restaurant.destroy({
      where: {
        deleted_at: { [Op.lt]: ninetyDaysAgo },
      },
      force: true,
    });

    // Cleanup soft-deleted menu items
    const deletedMenuItems = await MenuItem.destroy({
      where: {
        deleted_at: { [Op.lt]: ninetyDaysAgo },
      },
      force: true,
    });

    logger.info(`Permanently deleted: ${deletedUsers} users, ${deletedRestaurants} restaurants, ${deletedMenuItems} menu items`);
    return { deletedUsers, deletedRestaurants, deletedMenuItems };
  } catch (error) {
    logger.error('Error cleaning up deleted records:', error);
    throw error;
  }
};

// Check stale orders (pending for more than 2 hours)
const checkStaleOrders = async () => {
  try {
    const twoHoursAgo = new Date();
    twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);
    
    const staleOrders = await Order.findAll({
      where: {
        status: 'pending',
        created_at: { [Op.lt]: twoHoursAgo },
      },
    });
    
    for (const order of staleOrders) {
      await order.update({
        status: 'cancelled',
        cancellation_reason: 'Auto-cancelled: Order stale (no verification within 2 hours)',
        cancelled_at: new Date(),
      });
      
      logger.info(`Auto-cancelled stale order ${order.id}`);
    }
    
    logger.info(`Auto-cancelled ${staleOrders.length} stale orders`);
    return staleOrders.length;
  } catch (error) {
    logger.error('Error checking stale orders:', error);
    throw error;
  }
};

// Backup database
const backupDatabase = async () => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(__dirname, '../../backups');
    
    // Create backup directory if it doesn't exist
    await fs.mkdir(backupDir, { recursive: true });
    
    const backupFile = path.join(backupDir, `backup_${timestamp}.sql`);
    
    const dbConfig = {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    };
    
    const command = `PGPASSWORD=${dbConfig.password} pg_dump -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} -d ${dbConfig.database} > ${backupFile}`;
    
    await execPromise(command);
    
    logger.info(`Database backup created: ${backupFile}`);
    
    // Delete backups older than 30 days
    const files = await fs.readdir(backupDir);
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    
    for (const file of files) {
      const filePath = path.join(backupDir, file);
      const stats = await fs.stat(filePath);
      
      if (stats.mtimeMs < thirtyDaysAgo) {
        await fs.unlink(filePath);
        logger.info(`Deleted old backup: ${file}`);
      }
    }
    
    return backupFile;
  } catch (error) {
    logger.error('Error backing up database:', error);
    throw error;
  }
};

// Optimize database tables
const optimizeDatabase = async () => {
  try {
    const tables = [
      'users', 'restaurants', 'orders', 'order_items', 
      'menu_items', 'restaurant_tables', 'notifications'
    ];
    
    for (const table of tables) {
      await sequelize.query(`VACUUM ANALYZE ${table};`);
      logger.info(`Optimized table: ${table}`);
    }
    
    logger.info('Database optimization completed');
  } catch (error) {
    logger.error('Error optimizing database:', error);
    throw error;
  }
};

// Cleanup old analytics data (keep last 12 months)
const cleanupAnalyticsData = async () => {
  try {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    
    const deletedDailySales = await DailySalesSummary.destroy({
      where: {
        date: { [Op.lt]: twelveMonthsAgo },
      },
    });
    
    const deletedMenuItemAnalytics = await MenuItemAnalytics.destroy({
      where: {
        date: { [Op.lt]: twelveMonthsAgo },
      },
    });
    
    const deletedHourlyAnalytics = await HourlyAnalytics.destroy({
      where: {
        date: { [Op.lt]: twelveMonthsAgo },
      },
    });
    
    logger.info(`Cleaned up old analytics: ${deletedDailySales} daily, ${deletedMenuItemAnalytics} menu, ${deletedHourlyAnalytics} hourly`);
    return { deletedDailySales, deletedMenuItemAnalytics, deletedHourlyAnalytics };
  } catch (error) {
    logger.error('Error cleaning up analytics data:', error);
    throw error;
  }
};

module.exports = {
  cleanupExpiredSessions,
  cleanupOldLogs,
  cleanupTempFiles,
  cleanupDeletedRecords,
  checkStaleOrders,
  backupDatabase,
  optimizeDatabase,
  cleanupAnalyticsData,
};